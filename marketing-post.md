# Marketing asset: LinkedIn post (not published)

I'm learning AI agents and local LLMs, and I want them to reach me by email or WhatsApp. So I tried Swytchcode, a tool that lets code and agents call APIs safely, and built the welcome email for a beginner trading app, without writing a single HTTP request.

The app: **First Fill**, a (fictional) platform for first-time stock traders. When someone signs up, they get a welcome email with three safety tips before their first trade.

The tool: **Swytchcode**, an execution layer that sits between your code (or your AI agent) and real APIs. Instead of reading Resend's docs and hand-writing the request, I ran four commands:

```
swytchcode init
swytchcode get resend
swytchcode add resend.email.create
swytchcode exec resend.email.create
```

Swytchcode reads a **Wrekenfile**, a machine-readable spec of the API, so it knows the endpoint, required fields and auth. My code just says _what_ to do.

What I liked:
✅ `--dry-run` shows the exact request before anything is sent
✅ My API key is stored encrypted locally, so none in the code or repo

What I'd improve: a couple of setup bumps (sandbox mode needed a base URL for Resend, and the JS runtime package is currently unpublished on npm), all documented in my repo.

As AI writes more of our integration code, "AI declares intent, the tool executes" feels like the right boundary.

🔗 [GitHub repo link]

#APIs #DeveloperTools #AI #BuildInPublic
