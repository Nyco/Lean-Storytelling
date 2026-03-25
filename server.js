const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = process.env.PORT || 5000;
const METRICS_TOKEN = process.env.METRICS_TOKEN || '';
const DATA_FILE = path.join(__dirname, 'data.json');

const sessions = new Map();

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    const init = { users: [], stories: [], resetTokens: [], clicks: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(init, null, 2));
    return init;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function escapeHtml(v = '') {
  return v
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function randomId() {
  return crypto.randomBytes(16).toString('hex');
}

function makePasswordHash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const check = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  header.split(';').forEach((part) => {
    const [k, ...rest] = part.trim().split('=');
    if (k) out[k] = decodeURIComponent(rest.join('='));
  });
  return out;
}

function getSession(req, res) {
  const cookies = parseCookies(req);
  let sid = cookies.sid;
  if (!sid || !sessions.has(sid)) {
    sid = randomId();
    sessions.set(sid, { csrf: randomId() });
    res.setHeader('Set-Cookie', `sid=${sid}; HttpOnly; Path=/; SameSite=Lax`);
  }
  return sessions.get(sid);
}

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        try { resolve(JSON.parse(raw || '{}')); } catch { resolve({}); }
        return;
      }
      const params = new URLSearchParams(raw);
      const out = {};
      for (const [k, v] of params.entries()) out[k] = v;
      resolve(out);
    });
  });
}

function requireCsrf(body, session) {
  return body.csrf_token && body.csrf_token === session.csrf;
}

function getUser(data, session) {
  if (!session.userId) return null;
  return data.users.find((u) => u.id === session.userId) || null;
}

function layout({ user, session, title, content, sidebar = '', flashes = [] }) {
  const app = !!user;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(title)}</title>
  <style>
  body{margin:0;font-family:Segoe UI,Arial,sans-serif;background:#f3f4f6;color:#1a1a1a} .top{height:60px;background:#fff;border-bottom:1px solid #d1d5db;display:flex;justify-content:space-between;align-items:center;padding:0 14px}
  .brand{font-size:30px;font-weight:700}.row{display:grid;grid-template-columns:250px 1fr;min-height:calc(100vh - 60px)}.left{background:#ececec;border-right:1px solid #d1d5db;padding:16px}
  .main{padding:18px}.panel{background:#fff;border:1px solid #d1d5db;border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:8px}
  input,textarea,button{font:inherit} input,textarea{padding:8px;border:1px solid #d1d5db;border-radius:8px} textarea{min-height:88px}
  .btn{padding:8px 12px;border-radius:8px;border:1px solid #999;background:#fff;cursor:pointer;text-decoration:none;color:#111;display:inline-block}
  .primary{background:#111;color:#fff;border-color:#111}.danger{background:#8a1f2d;border-color:#8a1f2d;color:#fff}.muted{color:#6b7280}.flash{background:#fff3cd;padding:8px;border:1px solid #f0d170;border-radius:7px;margin-bottom:8px}
  .auth{max-width:640px;margin:32px auto;padding:14px}.actions{display:flex;gap:8px;align-items:center}.list{list-style:none;padding:0}.list li{margin:6px 0}
  </style></head><body>
  ${app ? `<div class="top"><div class="brand">Lean Storytelling</div><div class="actions"><button class="btn" data-track="theme_toggle">Theme</button><button class="btn" data-track="profile_button">Profile</button><a class="btn" href="/account">Account</a><form method="post" action="/logout"><input type="hidden" name="csrf_token" value="${session.csrf}"><button class="btn" type="submit">Sign out</button></form></div></div>
  <div class="row"><aside class="left"><a class="btn primary" href="/stories/new">New Story</a><h3>Stories</h3>${sidebar}</aside><main class="main">${flashes.map((f)=>`<div class="flash">${escapeHtml(f)}</div>`).join('')}${content}</main></div>`
  : `<main class="auth"><h1>Lean Storytelling</h1>${flashes.map((f)=>`<div class="flash">${escapeHtml(f)}</div>`).join('')}${content}</main>`}
  ${app ? `<script>window.CSRF='${session.csrf}';document.querySelectorAll('[data-track]').forEach(n=>n.addEventListener('click',()=>fetch('/api/track-click',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({target:n.dataset.track,csrf_token:window.CSRF})})));</script>` : ''}
  </body></html>`;
}

function redirect(res, to) {
  res.statusCode = 302;
  res.setHeader('Location', to);
  res.end();
}

function withFlash(session, msg) {
  session.flashes = session.flashes || [];
  session.flashes.push(msg);
}

const server = http.createServer(async (req, res) => {
  const data = loadData();
  const session = getSession(req, res);
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathName = url.pathname;
  const flashes = session.flashes || [];
  session.flashes = [];
  const user = getUser(data, session);

  if (req.method === 'GET' && pathName === '/') return redirect(res, user ? '/app' : '/login');

  if (req.method === 'GET' && pathName === '/login') {
    const content = `<form class="panel" method="post"><input type="hidden" name="csrf_token" value="${session.csrf}"><label>Email<input type="email" name="email" required></label><label>Password<input type="password" name="password" required></label><button class="btn primary" type="submit">Sign in</button><p><a href="/register">Create account</a> · <a href="/reset-password">Reset password</a></p></form>`;
    res.end(layout({ title: 'Sign in', content, session, flashes })); return;
  }
  if (req.method === 'POST' && pathName === '/login') {
    const body = await parseBody(req);
    if (!requireCsrf(body, session)) { res.statusCode = 400; return res.end('Bad CSRF'); }
    const email = (body.email || '').toLowerCase().trim();
    const u = data.users.find((x) => x.email === email);
    if (!u || !verifyPassword(body.password || '', u.passwordHash)) {
      withFlash(session, 'Invalid email or password.'); return redirect(res, '/login');
    }
    session.userId = u.id; session.csrf = randomId(); return redirect(res, '/app');
  }

  if (req.method === 'GET' && pathName === '/register') {
    const content = `<form class="panel" method="post"><input type="hidden" name="csrf_token" value="${session.csrf}"><h2>Create account</h2><p>Email is your ID. A secure random password is generated automatically.</p><label>Email<input type="email" name="email" required></label><button class="btn primary" type="submit">Create account</button><p><a href="/login">Back</a></p></form>`;
    res.end(layout({ title: 'Create account', content, session, flashes })); return;
  }
  if (req.method === 'POST' && pathName === '/register') {
    const body = await parseBody(req);
    if (!requireCsrf(body, session)) { res.statusCode = 400; return res.end('Bad CSRF'); }
    const email = (body.email || '').toLowerCase().trim();
    if (!email) { withFlash(session, 'Email required.'); return redirect(res, '/register'); }
    if (data.users.some((u) => u.email === email)) { withFlash(session, 'Email already exists.'); return redirect(res, '/register'); }
    const tempPassword = crypto.randomBytes(12).toString('base64url');
    data.users.push({ id: randomId(), email, passwordHash: makePasswordHash(tempPassword), createdAt: new Date().toISOString() });
    saveData(data);
    const content = `<section class="panel"><h2>Account created</h2><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Generated password:</strong> <code>${escapeHtml(tempPassword)}</code></p><p>Store this now. In production this would be delivered via secure email.</p><a class="btn primary" href="/login">Go to sign in</a></section>`;
    res.end(layout({ title: 'Account created', content, session, flashes })); return;
  }

  if (req.method === 'GET' && pathName === '/reset-password') {
    const content = `<form class="panel" method="post"><input type="hidden" name="csrf_token" value="${session.csrf}"><h2>Reset password</h2><p>Best practices: generic response, single-use token, short expiration, minimum 12-char password.</p><label>Email<input type="email" name="email" required></label><button class="btn primary" type="submit">Send reset email</button></form>`;
    res.end(layout({ title: 'Reset password', content, session, flashes })); return;
  }
  if (req.method === 'POST' && pathName === '/reset-password') {
    const body = await parseBody(req);
    if (!requireCsrf(body, session)) { res.statusCode = 400; return res.end('Bad CSRF'); }
    const email = (body.email || '').toLowerCase().trim();
    const u = data.users.find((x) => x.email === email);
    if (u) {
      const raw = randomId() + randomId();
      data.resetTokens.push({ id: randomId(), userId: u.id, tokenHash: makePasswordHash(raw), expiresAt: Date.now() + 15 * 60 * 1000, used: false });
      saveData(data);
      console.log(`Reset email to ${email}: http://localhost:${PORT}/reset-password/${raw}`);
    }
    withFlash(session, 'If the email exists, a reset link has been sent.');
    return redirect(res, '/login');
  }

  if (req.method === 'GET' && pathName.startsWith('/reset-password/')) {
    const token = pathName.split('/').pop();
    const valid = data.resetTokens.find((t) => !t.used && Date.now() < t.expiresAt && verifyPassword(token, t.tokenHash));
    if (!valid) { withFlash(session, 'Invalid or expired token.'); return redirect(res, '/reset-password'); }
    const content = `<form class="panel" method="post"><input type="hidden" name="csrf_token" value="${session.csrf}"><input type="hidden" name="token" value="${escapeHtml(token)}"><label>New password (12+ chars)<input type="password" name="new_password" minlength="12" required></label><button class="btn primary" type="submit">Update password</button></form>`;
    res.end(layout({ title: 'Reset confirm', content, session, flashes })); return;
  }
  if (req.method === 'POST' && pathName.startsWith('/reset-password/')) {
    const token = pathName.split('/').pop();
    const body = await parseBody(req);
    if (!requireCsrf(body, session)) { res.statusCode = 400; return res.end('Bad CSRF'); }
    if ((body.new_password || '').length < 12) { withFlash(session, 'Password must be at least 12 chars.'); return redirect(res, pathName); }
    const valid = data.resetTokens.find((t) => !t.used && Date.now() < t.expiresAt && verifyPassword(token, t.tokenHash));
    if (!valid) { withFlash(session, 'Invalid or expired token.'); return redirect(res, '/reset-password'); }
    const u = data.users.find((x) => x.id === valid.userId);
    if (u) u.passwordHash = makePasswordHash(body.new_password);
    valid.used = true;
    saveData(data);
    withFlash(session, 'Password updated.');
    return redirect(res, '/login');
  }

  if (!user) {
    res.statusCode = 302;
    res.setHeader('Location', '/login');
    return res.end();
  }

  const sidebarList = `<ul class="list">${data.stories.filter((s)=>s.userId===user.id).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).map((s)=>`<li><a href="/stories/${s.id}">${escapeHtml(s.title)}</a></li>`).join('') || '<li class="muted">No stories yet</li>'}</ul>`;

  if (req.method === 'POST' && pathName === '/logout') {
    const body = await parseBody(req);
    if (!requireCsrf(body, session)) { res.statusCode = 400; return res.end('Bad CSRF'); }
    delete session.userId; session.csrf = randomId();
    return redirect(res, '/login');
  }

  if (req.method === 'GET' && pathName === '/app') {
    const content = `<section class="panel"><h1>Professional Story Structuring Workspace</h1><p>Use the left sidebar to start a new story.</p></section>`;
    res.end(layout({ title: 'App', content, sidebar: sidebarList, user, session, flashes })); return;
  }

  if (req.method === 'GET' && pathName === '/stories/new') {
    session.wizard = {};
    const content = `<form class="panel" method="post" action="/stories/new/step1"><input type="hidden" name="csrf_token" value="${session.csrf}"><h1>Step 1 — Core story elements</h1><p>These are the basic elements of a story.</p><label>👤 Target<textarea name="target" required></textarea></label><label>🛑 Problem, need, JTBD<textarea name="problem" required></textarea></label><label>💡 Solution<textarea name="solution" required></textarea></label><button class="btn primary" type="submit">Continue to step 2</button></form>`;
    res.end(layout({ title: 'Step 1', content, sidebar: '<p class="muted">Wizard 1/3</p>', user, session, flashes })); return;
  }

  if (req.method === 'POST' && pathName === '/stories/new/step1') {
    const body = await parseBody(req);
    if (!requireCsrf(body, session)) { res.statusCode = 400; return res.end('Bad CSRF'); }
    if (!body.target || !body.problem || !body.solution) { withFlash(session, 'Complete all fields.'); return redirect(res, '/stories/new'); }
    session.wizard = { target: body.target, problem: body.problem, solution: body.solution };
    const content = `<form class="panel" method="post" action="/stories/new/step2"><input type="hidden" name="csrf_token" value="${session.csrf}"><h1>Step 2 — Enrichment elements</h1><p>These elements enrich previous entries.</p><label>😱 Empathy<textarea name="empathy" required></textarea></label><label>💥 Consequences<textarea name="consequences" required></textarea></label><label>📈 Benefits and advantages<textarea name="benefits" required></textarea></label><button class="btn primary" type="submit">Continue to step 3</button></form>`;
    res.end(layout({ title: 'Step 2', content, sidebar: '<p class="muted">Wizard 2/3</p>', user, session, flashes })); return;
  }

  if (req.method === 'POST' && pathName === '/stories/new/step2') {
    const body = await parseBody(req);
    if (!requireCsrf(body, session)) { res.statusCode = 400; return res.end('Bad CSRF'); }
    if (!session.wizard || !body.empathy || !body.consequences || !body.benefits) { withFlash(session, 'Complete all fields.'); return redirect(res, '/stories/new'); }
    Object.assign(session.wizard, { empathy: body.empathy, consequences: body.consequences, benefits: body.benefits });
    const content = `<form class="panel" method="post" action="/stories/new/step3"><input type="hidden" name="csrf_token" value="${session.csrf}"><h1>Step 3 — Story arc framing</h1><p>Story needs a start and an end.</p><label>🌎 Context<textarea name="context" required></textarea></label><label>💭 Why<textarea name="why" required></textarea></label><button class="btn primary" type="submit">Generate full story</button></form>`;
    res.end(layout({ title: 'Step 3', content, sidebar: '<p class="muted">Wizard 3/3</p>', user, session, flashes })); return;
  }

  if (req.method === 'POST' && pathName === '/stories/new/step3') {
    const body = await parseBody(req);
    if (!requireCsrf(body, session)) { res.statusCode = 400; return res.end('Bad CSRF'); }
    if (!session.wizard || !body.context || !body.why) { withFlash(session, 'Complete all fields.'); return redirect(res, '/stories/new'); }
    const s = { id: randomId(), userId: user.id, title: `Story for ${session.wizard.target.slice(0, 30)}`, context: body.context, target: session.wizard.target, empathy: session.wizard.empathy, problem: session.wizard.problem, consequences: session.wizard.consequences, solution: session.wizard.solution, benefits: session.wizard.benefits, why: body.why, createdAt: new Date().toISOString() };
    data.stories.push(s); saveData(data); delete session.wizard;
    return redirect(res, `/stories/${s.id}`);
  }

  if (req.method === 'GET' && pathName.startsWith('/stories/')) {
    const id = pathName.split('/')[2];
    const s = data.stories.find((x) => x.id === id && x.userId === user.id);
    if (!s) { res.statusCode = 404; return res.end('Not found'); }
    const content = `<section class="panel"><h1>${escapeHtml(s.title)}</h1><ol><li><strong>🌎 Context:</strong> ${escapeHtml(s.context)}</li><li><strong>👤 Target:</strong> ${escapeHtml(s.target)}</li><li><strong>😱 Empathy:</strong> ${escapeHtml(s.empathy)}</li><li><strong>🛑 Problem:</strong> ${escapeHtml(s.problem)}</li><li><strong>💥 Consequences:</strong> ${escapeHtml(s.consequences)}</li><li><strong>💡 Solution:</strong> ${escapeHtml(s.solution)}</li><li><strong>📈 Benefits:</strong> ${escapeHtml(s.benefits)}</li><li><strong>💭 Why:</strong> ${escapeHtml(s.why)}</li></ol>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-track="manual_review">Manual/human text review and adjustment</button><button class="btn" data-track="ai_enhancement">AI-based enhancement</button><button class="btn" data-track="coaching">Storytelling coaching and mentoring</button><button class="btn" data-track="extension">Story extension</button><button class="btn" data-track="delivery_shaping">Story shaping for delivery</button></div></section>`;
    res.end(layout({ title: s.title, content, sidebar: sidebarList, user, session, flashes })); return;
  }

  if (req.method === 'GET' && pathName === '/account') {
    const content = `<section class="panel"><h1>Destroy account</h1><p style="color:#8a1f2d;font-weight:700">Warning: this permanently deletes your account, stories, and usage data.</p><form method="post"><input type="hidden" name="csrf_token" value="${session.csrf}"><label>Type DELETE MY ACCOUNT<input type="text" name="confirm" required></label><button class="btn danger" type="submit">Destroy account permanently</button></form></section>`;
    res.end(layout({ title: 'Account', content, sidebar: '<p class="muted">Account controls</p>', user, session, flashes })); return;
  }

  if (req.method === 'POST' && pathName === '/account') {
    const body = await parseBody(req);
    if (!requireCsrf(body, session)) { res.statusCode = 400; return res.end('Bad CSRF'); }
    if (body.confirm !== 'DELETE MY ACCOUNT') { withFlash(session, 'Type DELETE MY ACCOUNT to confirm.'); return redirect(res, '/account'); }
    data.users = data.users.filter((u) => u.id !== user.id);
    data.stories = data.stories.filter((s) => s.userId !== user.id);
    data.clicks = data.clicks.filter((c) => c.userId !== user.id);
    data.resetTokens = data.resetTokens.filter((t) => t.userId !== user.id);
    saveData(data);
    delete session.userId;
    withFlash(session, 'Account destroyed.');
    return redirect(res, '/login');
  }

  if (req.method === 'POST' && pathName === '/api/track-click') {
    const body = await parseBody(req);
    if (!requireCsrf(body, session)) { res.statusCode = 400; return res.end(JSON.stringify({ ok: false })); }
    const allowed = new Set(['theme_toggle', 'profile_button', 'manual_review', 'ai_enhancement', 'coaching', 'extension', 'delivery_shaping']);
    if (!allowed.has(body.target)) { res.statusCode = 400; return res.end(JSON.stringify({ ok: false })); }
    data.clicks.push({ id: randomId(), userId: user.id, target: body.target, at: new Date().toISOString() });
    saveData(data);
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: true }));
  }

  if (req.method === 'GET' && pathName === '/_internal/feature-demand') {
    if (!METRICS_TOKEN || url.searchParams.get('token') !== METRICS_TOKEN) { res.statusCode = 404; return res.end('Not found'); }
    const out = {};
    for (const c of data.clicks) out[c.target] = (out[c.target] || 0) + 1;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(out));
  }

  res.statusCode = 404;
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Lean Storytelling app running on http://0.0.0.0:${PORT}`);
});
