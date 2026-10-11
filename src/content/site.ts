// Single source of truth for personal details. Everything here is taken from
// the previous portfolio, the resume PDF, or public GitHub data — keep it that way.

export const site = {
  name: "Umair Maqsood",
  firstName: "Umair",
  lastName: "Maqsood",
  role: "Full-Stack Developer & AI Automation",
  location: "Lahore, Pakistan",
  timezone: "Asia/Karachi",
  email: "umairmaqsood488@gmail.com",
  resume: "/files/umair-maqsood-resume.pdf",
  formspree: "https://formspree.io/f/xzzvdgzy",
  intro:
    "Computer Science student at FAST-NUCES Lahore building full-stack web apps, cross-platform mobile apps, automation and AI/ML systems, from REST APIs and scrapers to RAG pipelines.",
  about: [
    "I'm a Computer Science student at FAST-NUCES Lahore, and most of what I know I learned by shipping. I work across the whole stack, from the data model and the API to the interface and the deploy, mostly with Next.js, React, Node.js, Express and MongoDB. When it needs to live on a phone, I use React Native.",
    "My biggest work so far is SAT Sharks, an EdTech platform I build for a client. The first version, with subscriptions, payments, practice tests and role-based dashboards, runs at satsharks.org. For SAT Sharks 2.0 I rebuilt it as a TypeScript monorepo and automated the hard part: a web scraping pipeline, built with Playwright and background jobs, that collected and validated a 9,927-question bank. On top of it sit a Bluebook-style timed test screen and an admin question editor. Building for real users taught me to care about what comes after the demo, like permissions, performance and data that has to be right.",
    "On the AI side I like work that can be measured: a RAG assistant that turns course material into a searchable knowledge base and generates exams from it, and a resume parser that reaches a 93.9% F1 score.",
  ],
  mission: "I want to build software people rely on, software that is simple to use, solid underneath and quick to improve.",
  hobbies: ["Cricket", "Football", "Photography", "Music"],
  socials: [
    { label: "GitHub", href: "https://github.com/Umairmaqsood00", handle: "Umairmaqsood00" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/umair-maqsood488/", handle: "umair-maqsood488" },
    { label: "Instagram", href: "https://www.instagram.com/umair_maqsood488/", handle: "umair_maqsood488" },
    { label: "WhatsApp", href: "https://wa.me/923274950998", handle: "+92 327 4950998" },
  ],
} as const;

/**
 * Canonical URL. Set NEXT_PUBLIC_SITE_URL once a custom domain exists.
 * On Vercel, VERCEL_PROJECT_PRODUCTION_URL is provided automatically.
 * (umairmaqsood.com belongs to someone else — do not use it.)
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
