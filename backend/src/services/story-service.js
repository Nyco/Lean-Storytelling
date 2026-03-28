/* story-service.js — Story and StoryVersion business logic */

import sql from '../db/client.js'

const STORY_FIELDS = ['context', 'target', 'empathy', 'problem', 'consequences', 'solution', 'benefits', 'why']

/* ============================================================
   STORIES
   ============================================================ */

export async function getStories(userId) {
  return sql`
    SELECT
      s.id,
      s.title,
      s.created_at,
      json_build_object(
        'version_number', v.version_number,
        'updated_at', v.updated_at
      ) AS latest_version
    FROM stories s
    JOIN story_versions v ON v.story_id = s.id
      AND v.version_number = (
        SELECT MAX(version_number) FROM story_versions WHERE story_id = s.id
      )
    WHERE s.user_id = ${userId}
    ORDER BY s.created_at DESC
  `
}

export async function createStory(userId, title, fields = {}) {
  const [story] = await sql`
    INSERT INTO stories (user_id, title)
    VALUES (${userId}, ${title})
    RETURNING id, title, created_at
  `

  const version = await createVersion(userId, story.id, fields)
  return { ...story, version }
}

export async function deleteStory(userId, storyId) {
  const result = await sql`
    DELETE FROM stories
    WHERE id = ${storyId} AND user_id = ${userId}
    RETURNING id
  `
  return result.length > 0
}

/* ============================================================
   VERSIONS
   ============================================================ */

export async function getVersions(userId, storyId) {
  await _assertStoryOwner(userId, storyId)

  const versions = await sql`
    SELECT id, version_number, created_at, updated_at
    FROM story_versions
    WHERE story_id = ${storyId}
    ORDER BY version_number ASC
  `

  const maxNum = versions.length > 0 ? Math.max(...versions.map(v => v.version_number)) : 0
  return versions.map(v => ({ ...v, is_latest: v.version_number === maxNum }))
}

export async function getVersion(userId, storyId, versionId) {
  await _assertStoryOwner(userId, storyId)

  const [row] = await sql`
    SELECT sv.*, (
      sv.version_number = MAX(sv2.version_number) OVER (PARTITION BY sv2.story_id)
    ) AS is_latest
    FROM story_versions sv
    JOIN story_versions sv2 ON sv2.story_id = sv.story_id
    WHERE sv.id = ${versionId} AND sv.story_id = ${storyId}
    LIMIT 1
  `

  if (!row) return null

  // Simpler approach: check if this is latest
  const [maxRow] = await sql`
    SELECT MAX(version_number) AS max_num FROM story_versions WHERE story_id = ${storyId}
  `
  return { ...row, is_latest: row.version_number === maxRow.max_num }
}

export async function createVersion(userId, storyId, fields = {}) {
  // Determine next version number
  const [row] = await sql`
    SELECT COALESCE(MAX(version_number), 0) + 1 AS next_num
    FROM story_versions
    WHERE story_id = ${storyId}
  `
  const versionNumber = row.next_num

  // Copy fields from latest version if not explicitly provided
  let sourceFields = {}
  if (Object.keys(fields).length === 0 && storyId) {
    const [latest] = await sql`
      SELECT ${sql(STORY_FIELDS)}
      FROM story_versions
      WHERE story_id = ${storyId}
      ORDER BY version_number DESC
      LIMIT 1
    `
    if (latest) sourceFields = latest
  }

  const merged = {}
  for (const f of STORY_FIELDS) {
    merged[f] = fields[f] !== undefined ? fields[f] : (sourceFields[f] || null)
  }

  const [version] = await sql`
    INSERT INTO story_versions (story_id, version_number, ${sql(STORY_FIELDS)})
    VALUES (${storyId}, ${versionNumber}, ${merged.context}, ${merged.target}, ${merged.empathy},
            ${merged.problem}, ${merged.consequences}, ${merged.solution}, ${merged.benefits}, ${merged.why})
    RETURNING id, story_id, version_number, ${sql(STORY_FIELDS)}, created_at, updated_at
  `
  return { ...version, is_latest: true }
}

export async function patchVersion(userId, storyId, versionId, fields) {
  await _assertStoryOwner(userId, storyId)

  // Check if latest
  const [maxRow] = await sql`
    SELECT id FROM story_versions
    WHERE story_id = ${storyId}
    ORDER BY version_number DESC
    LIMIT 1
  `
  if (!maxRow || maxRow.id !== versionId) {
    return { forbidden: true }
  }

  // Only update valid fields
  const allowed = {}
  for (const f of STORY_FIELDS) {
    if (fields[f] !== undefined) allowed[f] = fields[f]
  }
  if (Object.keys(allowed).length === 0) {
    return { noop: true }
  }

  const entries = Object.keys(allowed)
  const [updated] = await sql`
    UPDATE story_versions
    SET ${sql(allowed)}, updated_at = NOW()
    WHERE id = ${versionId} AND story_id = ${storyId}
    RETURNING updated_at
  `

  return { updated_at: updated.updated_at }
}

export async function deleteVersion(userId, storyId, versionId) {
  await _assertStoryOwner(userId, storyId)

  // Check if it's the only version
  const [countRow] = await sql`
    SELECT COUNT(*) AS cnt FROM story_versions WHERE story_id = ${storyId}
  `
  if (parseInt(countRow.cnt, 10) <= 1) {
    return { conflict: true }
  }

  const result = await sql`
    DELETE FROM story_versions WHERE id = ${versionId} AND story_id = ${storyId}
    RETURNING id
  `
  return { deleted: result.length > 0 }
}

export async function forkVersion(userId, storyId, versionId, newTitle) {
  await _assertStoryOwner(userId, storyId)

  const [source] = await sql`
    SELECT ${sql(STORY_FIELDS)} FROM story_versions
    WHERE id = ${versionId} AND story_id = ${storyId}
  `
  if (!source) return null

  return createStory(userId, newTitle, source)
}

/* ============================================================
   HELPERS
   ============================================================ */

async function _assertStoryOwner(userId, storyId) {
  const [row] = await sql`
    SELECT id FROM stories WHERE id = ${storyId} AND user_id = ${userId}
  `
  if (!row) {
    const err = new Error('Story not found or not owned by user')
    err.code = 'not_found'
    throw err
  }
}
