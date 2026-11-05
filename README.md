# First Fill × Swytchcode: a welcome email for beginner traders

## What is Swytchcode?

Swytchcode is an execution layer that sits between your code (or an AI agent) and external APIs like Resend, Stripe or Slack. Instead of reading each API's docs and hand-writing HTTP requests, you tell Swytchcode what you want to do, and it builds, validates and sends the request for you.

The problem it solves is that integration code breaks easily: wrong field names, missing authentication, errors nobody checks. This gets worse as AI agents write more of our code. Swytchcode uses a Wrekenfile, a machine-readable spec of an API's endpoints, inputs and auth, so the request is built from the spec instead of guessed.

A developer uses it in four steps: `swytchcode init` sets up the project, `get` downloads an integration's Wrekenfile, `add` approves the specific operation you trust, and `exec` runs it. `--dry-run` shows the exact request before anything is sent, and API keys are stored encrypted locally.

My example: I'm building First Fill, a trading app for beginners. When a user signs up, my Node script calls `swytchcode exec resend.email.create` to send a personalized welcome email with three safety tips. It arrived in my inbox with one command.

As someone learning AI agents and local LLMs (Ollama, OpenClaw), this is what excites me most: I want my local agents to message me by email or WhatsApp, and Swytchcode gives them a safe, consistent way to call those APIs. Next, I'd add price-drop alerts for stocks a user is watching.

## Problem and intended user

**First Fill** is a (fictional) trading app for beginner stock traders. When someone signs up, the app should send them a welcome email with a few safety tips before their first trade.

Instead of hand-writing HTTP requests to an email API, this project sends the email through **Swytchcode**, an execution layer that sits between your code and external APIs. My code only says _what_ to do (`resend.email.create` with this data); Swytchcode builds, validates and sends the request using the API's spec.

**Intended user:** a developer (or an AI coding agent) who needs to call a third-party API reliably without reading its docs and hand-writing request code.

## API / integration explored

- **Integration:** Resend (transactional email API), `Resend.resend@1.5.0` from the Swytchcode registry
- **Operation used:** `resend.email.create`, which is `POST https://api.resend.com/emails`
- **Swytchcode CLI version:** 2.25.5, macOS

## Setup and commands

### 1. Install / update the CLI

```bash
npm install -g swytchcode@latest   # or: curl -fsSL https://cli.swytchcode.com/install.sh | sh
swytchcode --version               # 2.25.5
```

### 2. Initialize and fetch the integration

```bash
swytchcode init                    # editor: none, mode: sandbox
swytchcode search resend
swytchcode get resend              # downloads the Wrekenfile
swytchcode list methods resend     # 75 methods
swytchcode add resend.email.create # allow this one tool (tooling.json)
swytchcode info resend.email.create
```

### 3. Execute one API operation from the CLI

```bash
# Resend has no sandbox server, so point sandbox mode at the real API
export SWYTCHCODE_BASE_URL_RESEND_RESEND_SANDBOX=https://api.resend.com

# Preview the request without sending (first run prompts to connect your Resend API key)
swytchcode exec resend.email.create --body body.json --dry-run

# Send it
swytchcode exec resend.email.create --body body.json --json
```

### 4. Run the First Fill example

```bash
npm install
echo "SWYTCHCODE_BASE_URL_RESEND_RESEND_SANDBOX=https://api.resend.com" > .env
node signup.js "Siva" you@example.com
```

`signup.js` builds a personalized welcome email with three beginner tips and calls `swytchcode exec` with the request as JSON on stdin.

> **Note:** Without a verified domain, Resend only delivers from `onboarding@resend.dev` to the email address you signed up to Resend with.

## What worked

- `init → get → add → exec` worked once the base URL was set.
- **`--dry-run`** showed the exact method, URL, headers and body before anything was sent. This was very useful for debugging.
- **Credentials:** on first `exec`, Swytchcode asked to connect my Resend key and stored it _locally and encrypted_. Dry-run output shows `Authorization: [REDACTED]`. This repo contains **no API keys**.
- The welcome email arrived in Gmail with the personalized name and tips (see `screenshots/`).

## What did not work / errors encountered

Full details (step, command, expected, actual, what I tried, resolved?) are in [`friction-diary.md`](friction-diary.md). The main ones:

1. **`swytchcode-runtime` is unpublished.** `npm install swytchcode-runtime` gives `ENOVERSIONS`; `npm view` shows `404 Unpublished on 2026-07-16`. Swytchcode's npm page and blog still recommend it. _Workaround:_ call `swytchcode exec` via `spawnSync`, following the pattern in the CLI README.
2. **No base URL in sandbox mode.** The `exec` dry run went to `https://base-url-not-set.invalid/emails`, even though the Wrekenfile's `DEFAULTS` contains `w_base_url: https://api.resend.com`. _Workaround:_ the `SWYTCHCODE_BASE_URL_RESEND_RESEND_SANDBOX` env var.
3. **Methods missing from `list`.** `resend.api_key.*` and `resend.contact_property.*` are defined in the Wrekenfile but don't appear in `swytchcode list methods resend`. Their keys use `_` while their `CANONICAL_ID`s use `-`, which may be the cause.
4. **Docs behind the 2.x CLI:** README lists 3 editors (the CLI shows 9); blog uses `emails.email.create` (actual: `resend.email.create`); README says `get` creates `workflows.json` (it doesn't).
5. **Unclear auth:** `info` shows `"Authorization": "bearer_token"` with no explanation of how to provide the key. The connect prompt only appears at `exec` time.
6. **Confusing UX:** `send.create` vs `send.create1` suffixes; `to` shown as a `ONE_OF` / `variant_0` / `variant_1` object; `failed to read body file` doesn't say which path it tried.

## How to reproduce

1. Clone this repo and `cd` into it.
2. Install the CLI (step 1 above) and run `npm install`.
3. Sign up at resend.com and create an API key (sending access is enough).
4. Create `.env` as shown in step 4.
5. `node signup.js "Your Name" your-resend-signup-email@example.com`
6. When prompted, connect your Resend key. Check your inbox.

## Demo

Video: _[add Loom / YouTube link]_

## Notes on the generated Wrekenfile

Path: `.swytchcode/integrations/Resend/resend/1.5.0/wrekenfile.yaml`

A Wrekenfile is a machine-readable spec of an API that Swytchcode uses to build and validate requests. Structure:

- `VERSION`: spec format version (2.0.2)
- `DEFAULTS`: shared values: base URL `https://api.resend.com` and a `bearer_token` placeholder
- `METHODS`: one block per operation (75 for Resend), each with `SUMMARY`, `HTTP` (verb, endpoint, headers), `SECURITY`, `EXECUTION`, `INPUTS` (type, required, and location: header / path / query / body), `RETURNS` and `CANONICAL_ID`
- `STRUCTS`: data shapes, e.g. `SendEmailRequest` (required: `from`, `to`, `subject`) and `SendEmailResponse` (`id`)

Observations:

- `body` for `resend.email.create` is marked `REQUIRED: false`, but `from`/`to`/`subject` inside it are required.
- `resend.email.update` is a `PATCH` with no `body` input, and its return type is the request struct `UpdateEmailOptions`.
- There is no `WORKFLOWS` section for Resend.
- Several methods are marked `DEPRECATED` (audiences → segments), which is useful information to carry in a spec.

## AI usage

I used **Claude** as a guide: to explain concepts (APIs, HTTP, Wrekenfiles), interpret error messages, and suggest commands and the `spawnSync` fallback. I ran every command myself, debugged the file-location and environment-variable issues, verified each output, and wrote the friction diary from what I observed.
