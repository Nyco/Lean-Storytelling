/* consistency.js — Rule-based consistency observation engine
   No external dependencies. Pure functions only.
   ---------------------------------------------------------- */

const STOPWORDS = new Set([
  'the', 'and', 'for', 'that', 'with', 'this', 'have', 'from', 'they',
  'will', 'your', 'more', 'been', 'were', 'when', 'their', 'than', 'then',
  'into', 'its', 'our', 'are', 'was', 'but', 'not', 'you', 'all', 'can',
  'has', 'her', 'his', 'him', 'she', 'who', 'what', 'how', 'any', 'each',
]);

const PAIR_LABELS = {
  'target-problem':  'Target → Problem',
  'problem-solution': 'Problem → Solution',
};

const DISCONNECT_MESSAGES = {
  'target-problem':
    'Possible disconnect — check that the Problem describes a challenge your Target actually faces.',
  'problem-solution':
    'Possible disconnect — check that the Solution directly addresses the Problem.',
};

/**
 * Returns a Set of significant words from a text string.
 * Lowercases, splits on non-word characters, filters short words and stopwords.
 * @param {string} text
 * @returns {Set<string>}
 */
function getSignificantWords(text) {
  return new Set(
    text
      .toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 3 && !STOPWORDS.has(w))
  );
}

/**
 * Evaluates the relationship between two field texts.
 * @param {string} textA
 * @param {string} textB
 * @param {'target-problem'|'problem-solution'} pairKey
 * @returns {{ pair: string, type: string, message: string }}
 */
function evaluatePair(textA, textB, pairKey) {
  const label = PAIR_LABELS[pairKey];

  if (!textA || !textB) {
    return {
      pair: pairKey,
      type: 'incomplete',
      message: `${label}: one or both fields are empty — fill them to evaluate consistency.`,
    };
  }

  if (textA.length < 10 || textB.length < 10) {
    return {
      pair: pairKey,
      type: 'too-short',
      message: `${label}: content is too short to evaluate — consider expanding your answer.`,
    };
  }

  const wordsA = getSignificantWords(textA);
  const wordsB = getSignificantWords(textB);
  const overlap = [...wordsA].some(w => wordsB.has(w));

  if (overlap) {
    return {
      pair: pairKey,
      type: 'connected',
      message: `${label}: these fields share common elements — they appear connected.`,
    };
  }

  return {
    pair: pairKey,
    type: 'disconnect',
    message: `${label}: ${DISCONNECT_MESSAGES[pairKey]}`,
  };
}

/**
 * Returns two consistency observations for a story object.
 * @param {{ target: string, problem: string, solution: string }} story
 * @returns {Array<{ pair: string, type: string, message: string }>}
 */
function getObservations(story) {
  return [
    evaluatePair(story.target, story.problem, 'target-problem'),
    evaluatePair(story.problem, story.solution, 'problem-solution'),
  ];
}
