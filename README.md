# UX Copy Generator v2.1

Built by [María Alvear](https://www.linkedin.com/in/alejaalvear/)

## Deploy to Vercel

1. Fork or clone this repo
2. Go to [vercel.com](https://vercel.com) → Add New Project → Import this repo
3. In **Environment Variables**, add:
   ```
   ANTHROPIC_API_KEY = your_key_here
   ```
4. Deploy — Vercel auto-detects Next.js

## Local development

```bash
npm install
# Create .env.local with your API key:
echo "ANTHROPIC_API_KEY=your_key_here" > .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## What it does

Upload your content guidelines once. Then audit existing UI copy or generate new on-brand copy — grounded in your brand, not generic defaults.
