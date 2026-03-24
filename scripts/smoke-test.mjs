import { spawn } from 'node:child_process';

const baseUrl = 'http://127.0.0.1:5000';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseCookie(setCookie) {
  if (!setCookie) return '';
  return setCookie.split(';')[0];
}

function extractCsrf(html) {
  const m = html.match(/name="csrf_token" value="([^"]+)"/);
  return m?.[1] ?? '';
}

async function main() {
  const email = `smoke+${Date.now()}@example.com`;
  const server = spawn('node', ['server.js'], { stdio: 'ignore' });
  try {
    await sleep(800);

    let response = await fetch(`${baseUrl}/register`);
    const cookie = parseCookie(response.headers.get('set-cookie'));
    let html = await response.text();
    let csrf = extractCsrf(html);

    response = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: cookie,
      },
      body: new URLSearchParams({
        csrf_token: csrf,
        email,
      }),
    });

    html = await response.text();
    const password = html.match(/<code>([^<]+)<\/code>/)?.[1];
    if (!password) throw new Error('Could not extract generated password.');

    response = await fetch(`${baseUrl}/login`, { headers: { Cookie: cookie } });
    html = await response.text();
    csrf = extractCsrf(html);

    response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: cookie,
      },
      body: new URLSearchParams({
        csrf_token: csrf,
        email,
        password,
      }),
    });

    if (response.status !== 302) {
      throw new Error(`Expected redirect after login, got HTTP ${response.status}.`);
    }

    response = await fetch(`${baseUrl}/app`, { headers: { Cookie: cookie } });
    html = await response.text();

    if (!html.includes('Professional Story Structuring Workspace')) {
      throw new Error('Dashboard assertion failed.');
    }

    console.log('Smoke test passed.');
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
