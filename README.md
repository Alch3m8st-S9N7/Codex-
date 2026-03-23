# AI Chat Resume Launcher

A tiny local web tool to quickly reopen the last conversation you had with ChatGPT or other AI providers.

## Features

- Save a provider's home URL and your most recent chat URL.
- Open last chat in one click.
- Fallback to provider home if a last-chat URL is not set.
- Add/remove providers.
- Export/import saved providers as JSON.
- Data persists in browser `localStorage`.

## Run

Open `index.html` directly, or run a local static server:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Notes

- This tool does not bypass logins; if your session expires, you'll need to sign in again.
- Some AI platforms may change URL formats for chat threads over time.
