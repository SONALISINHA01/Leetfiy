<h1 align="center">Leetfiy</h1>

<p align="center">
	<strong>AI-powered coding profile analyzer for LeetCode, Codeforces, and GitHub</strong>
</p>

<p align="center">
	<a href="https://nextjs.org"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" /></a>
	<a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" /></a>
	<a href="https://tailwindcss.com/"><img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" /></a>
	<a href="https://vercel.com/"><img alt="Vercel" src="https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel" /></a>
</p>

---

## What Is Leetfiy?

Leetfiy is a competitive programming super-dashboard that helps you:

- Analyze LeetCode and Codeforces performance deeply
- Visualize weak areas using heatmaps, radar, and trend charts
- Get AI-generated profile roasts and feedback
- Use smart review and reminder workflows for spaced repetition
- Run head-to-head profile battles for comparison

This project is built with Next.js App Router, TypeScript, Tailwind CSS, and API integrations for LeetCode, Codeforces, GitHub, Redis, and LLM providers.

---

## Feature Highlights

| Area | What You Get |
| --- | --- |
| Deep Analytics | Contest trends, topic distribution, language stats, recent submissions, heatmaps |
| AI Roast Engine | Context-aware roasts with Gemini primary and Groq fallback |
| Smart Review Mode | Topic-weakness based review flow and due review tracking |
| Battle Mode | Compare two users in LeetCode/Codeforces battle pages |
| Shareability | Exportable dashboard visuals and social-friendly experience |

---

## Tech Stack

- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS + custom UI components
- Charts/UX: Recharts, Framer Motion, Lucide icons
- Data/Services:
	- LeetCode and Codeforces public data integrations
	- GitHub profile and contribution scraping/integration
	- Upstash Redis for spaced-repetition state
	- Gemini and Groq for AI text generation

---

## Project Structure

```text
src/
	app/
		api/
			analyze/
			preinterview/
			problems/search/
			problems/search-cf/
			review/
			review/bulk/
			review/due/
			review/weak-topics/
		battle/
			cf/[user1]/[user2]/
			cp/[user1]/[user2]/
		cf/[handle]/
		cp/[username]/
	components/
		animations/
		battle/
		dashboard/
		ui/
	lib/
		leetcode.ts
		codeforces.ts
		github.ts
		redis.ts
		roast.ts
		spacedRepetition.ts
```

---

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/SONALISINHA01/Leetfiy.git
cd Leetfiy
npm install
```

### 2. Configure environment variables

Create `.env.local` in the project root:

```bash
# AI providers
GEMINI_API_KEY=
GOOGLE_API_KEY=
GOOOGLE_GENAI_API_KEY=
GROQ_API_KEY=

# GitHub API (recommended to reduce rate limits)
GITHUB_TOKEN=

# Upstash Redis (required for reminders/spaced repetition)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Notes:

- `GEMINI_API_KEY` or `GOOGLE_API_KEY` enables Gemini generation.
- `GROQ_API_KEY` is used as fallback on certain Gemini failures/rate limits.
- `GOOOGLE_GENAI_API_KEY` is intentionally supported in current code as an additional fallback key name.

### 3. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Production Build

```bash
npm run build
npm run start
```

---

## Deploy (Vercel)

1. Push your latest code to `main`.
2. Import the repository into Vercel.
3. Framework preset will auto-detect as Next.js.
4. Add all required environment variables in Vercel Project Settings.
5. Deploy.

After that, every push to `main` triggers an automatic deployment.

---

## Roadmap Ideas

- Auth + user accounts
- Team-based battle rooms
- Contest reminders and streak gamification
- Personalized company-focused prep tracks
- Rich share cards with templates

---

## License

MIT LICENCE



