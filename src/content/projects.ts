// Project copy comes from the previous portfolio, the resume, and public repo /
// live-site metadata. `repo` is only set for repositories that are publicly
// reachable; private ones are marked so visitors don't hit a 404.

export type ProjectVisual = "rag" | "resume" | "platform" | "journal" | "mobile" | "test";

export type Project = {
  slug: string;
  index: string;
  title: string;
  kicker: string;
  summary: string;
  problem: string;
  built: string[];
  stack: string[];
  stat?: { value: string; label: string };
  /** Real screenshot of the shipped product, if one exists. */
  image?: { src: string; alt: string };
  repo?: string;
  live?: string;
  privateRepo?: boolean;
  visual: ProjectVisual;
};

/** Featured on the site, in this order. */
export const projects: Project[] = [
  {
    slug: "sat-sharks-2",
    index: "01",
    title: "SAT Sharks 2.0",
    kicker: "Full-stack · Web scraping & automation",
    summary:
      "A digital SAT practice platform fed by an automated web scraping pipeline, with Bluebook-style timed tests on real past papers, scoring, review and an admin question bank.",
    problem:
      "Students preparing for the digital SAT need realistic, timed practice on real questions, not static PDFs.",
    built: [
      "Web scraping with Playwright: an automated pipeline that collects, parses, normalises and validates questions",
      "A 9,927-question bank built by that pipeline, with background jobs on BullMQ and Redis",
      "Bluebook-style test screen with timer, answer checking, results and review",
      "LaTeX, tables, charts and diagrams rendered inside questions",
      "Admin question bank with filters, search, a live-preview editor and publish controls",
      "JWT auth in an httpOnly cookie with permission-based authorization",
    ],
    stack: ["Next.js", "TypeScript", "Express.js", "MongoDB", "Playwright", "BullMQ", "Redis"],
    live: "https://satsharks-platform-orpin.vercel.app",
    privateRepo: true,
    visual: "test",
  },
  {
    slug: "sat-sharks",
    index: "02",
    title: "SAT Sharks",
    kicker: "Full-stack · EdTech platform",
    summary:
      "A full-stack SAT preparation and college-admissions platform with subscriptions, practice testing and role-based dashboards.",
    problem:
      "Students preparing for the SAT juggle separate tools for practice, essay feedback and university research.",
    built: [
      "Subscription management and payment workflows",
      "Practice testing and essay-review systems",
      "Role-based dashboards",
      "University recommendation module",
    ],
    stack: ["React.js", "Node.js", "Express.js", "MongoDB"],
    live: "https://www.satsharks.org",
    privateRepo: true,
    visual: "platform",
  },
  {
    slug: "batwaranow",
    index: "03",
    title: "BatwaraNow",
    kicker: "Mobile · Shared expense tracker",
    summary:
      "A cross-platform mobile app that lets groups track shared expenses and automatically calculates who owes whom.",
    problem: "Splitting bills across a group by hand is tedious and error-prone.",
    built: [
      "Group expense tracking with automatic balance calculation",
      "Modular, component-based React Native architecture",
      "Efficient real-time state management",
    ],
    stack: ["React Native", "Expo", "Node.js"],
    repo: "https://github.com/Umairmaqsood00/BatwaraNow",
    visual: "mobile",
  },
];

/** Smaller, earlier builds — shown as a compact archive list when not empty. */
export const archive: { title: string; stack: string; note: string; repo: string }[] = [];

// ─── Parked ──────────────────────────────────────────────────────────────────
// Not shown on the site right now. To bring one back, move it into `projects`
// (and fix its `index`) or into `archive`.

export const parkedProjects: Project[] = [
  {
    slug: "academic-rag-assistant",
    index: "",
    title: "Academic RAG Assistant",
    kicker: "AI · Retrieval-augmented generation",
    summary:
      "Turns a university's course material into a searchable knowledge base and generates custom exams from it.",
    problem:
      "Past exams and course documents are scattered and hard to search by course or document type.",
    built: [
      "Ingestion pipeline that embeds course materials with SentenceTransformer into Qdrant",
      "Semantic retrieval of past exams with course and document-type filters",
      "Custom exam generation with LangChain RAG on a Groq-hosted LLM",
      "Intent-routing chat and PDF export served through FastAPI",
    ],
    stack: ["Python", "FastAPI", "LangChain", "Qdrant", "SentenceTransformers", "Groq LLM"],
    privateRepo: true,
    visual: "rag",
  },
  {
    slug: "smartresume-ai",
    index: "",
    title: "SmartResume AI",
    kicker: "NLP · Intelligent resume parsing",
    summary:
      "Converts PDF resumes into structured JSON by combining a fine-tuned transformer with rule-based extraction.",
    problem:
      "Resumes arrive as unstructured, often multi-column PDFs that are slow to screen against a job description.",
    built: [
      "Hybrid DistilBERT + rule-based extraction pipeline",
      "Multi-column PDF support with pdfplumber",
      "Interactive Streamlit app for real-time analysis",
      "Job-description matching against parsed profiles",
    ],
    stack: ["Python", "DistilBERT", "Streamlit", "pdfplumber", "NLP"],
    stat: { value: "93.9%", label: "F1 score" },
    privateRepo: true,
    visual: "resume",
  },
  {
    slug: "tradevault",
    index: "",
    title: "TradeVault",
    kicker: "Web app · Trading journal & analytics",
    summary:
      "A private trading journal and analytics desk for logging executions and auditing trading discipline.",
    problem:
      "Traders need one place to record executions and see whether their results and risk management actually hold up.",
    built: [
      "Two isolated workspace desks, each with its own balance, trades and statistics",
      "Journal desk: trade ledger, trading plans, daily reviews, emotional audit and calendar",
      "Calculator desk: position sizing, cycle tracking, cycle net P/L and equity curve",
      "Win-rate, net P&L and discipline scoring on the overview",
    ],
    stack: ["React.js", "TypeScript", "Vite"],
    repo: "https://github.com/Umairmaqsood00/TradeJournel",
    live: "https://tradejournel.vercel.app",
    image: { src: "/images/projects/tradevault.jpg", alt: "TradeVault's workspace selector: a Journal desk and a Calculator desk" },
    visual: "journal",
  },
];

export const parkedArchive = [
  {
    title: "Word Catcher Game",
    stack: "Assembly (Intel 8086) · DOSBox",
    note: "Real-time game where players catch falling words, built on low-level memory handling and logic flow.",
    repo: "https://github.com/Umairmaqsood00/Word-Catching-Game",
  },
  {
    title: "Social Media Console App",
    stack: "C++ · OOP",
    note: "Profiles, posts and friend management built on classes, inheritance, encapsulation and polymorphism.",
    repo: "https://github.com/Umairmaqsood00/OOP-Social-App",
  },
];
