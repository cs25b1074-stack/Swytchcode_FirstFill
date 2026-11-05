require('dotenv').config();
const { spawnSync } = require('node:child_process');

// Fallback for the unpublished swytchcode-runtime package:
// call `swytchcode exec` directly, as the official CLI README documents.
function swytchcodeExec(tool, args) {
  const r = spawnSync('swytchcode', ['exec', '--json'], {
    input: JSON.stringify({ tool, args }),
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    env: process.env,
  });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(r.stderr || `swytchcode exited ${r.status}`);
  return JSON.parse(r.stdout);
}

// First Fill: send a welcome email when a beginner trader signs up
function onSignup(name, email) {
  const html = `
    <h2>Welcome to First Fill, ${name}!</h2>
    <p>Your first trade starts here. Three tips before you place it:</p>
    <ol>
      <li><b>Start with paper trading.</b> Practice with virtual money first.</li>
      <li><b>Only risk what you can afford to lose.</b></li>
      <li><b>Learn the stop-loss.</b> It limits how much a bad trade can cost you.</li>
    </ol>
    <p>Happy trading,<br>The First Fill team</p>`;

  const result = swytchcodeExec('resend.email.create', {
    body: {
      from: 'First Fill <onboarding@resend.dev>',
      to: email,
      subject: `Welcome to First Fill, ${name}! Your first trade starts here`,
      html,
    },
  });

  console.log(JSON.stringify(result, null, 2));

  if (result.status_code >= 400) {
    console.error('Email failed:', result.data);
    process.exit(1);
  }
  console.log(`Welcome email sent to ${name} <${email}>, id: ${result.data?.id ?? result.id}`);
}

const [name, email] = process.argv.slice(2);
if (!name || !email) {
  console.log('Usage: node signup.js "Name" email@example.com');
  process.exit(1);
}
try {
  onSignup(name, email);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
