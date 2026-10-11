// Grouped from the previous portfolio's skills section and the resume.
// No proficiency levels on purpose — only what has actually been used.

export type SkillGroup = {
  id: string;
  label: string;
  blurb: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    id: "frontend",
    label: "Frontend",
    blurb: "Responsive interfaces and component architecture.",
    items: ["React.js", "Next.js", "TypeScript", "JavaScript", "HTML5", "CSS3", "Vite"],
  },
  {
    id: "backend",
    label: "Backend",
    blurb: "REST APIs, auth and the logic behind the UI.",
    items: ["Node.js", "Express.js", "FastAPI", "RESTful API Design", "Role-Based Auth"],
  },
  {
    id: "data",
    label: "Databases",
    blurb: "Relational, document and vector stores.",
    items: ["MongoDB", "MySQL", "PostgreSQL", "T-SQL", "Qdrant"],
  },
  {
    id: "ai",
    label: "AI / ML",
    blurb: "Retrieval pipelines, language models and evaluation.",
    items: [
      "Python",
      "Machine Learning",
      "NLP",
      "RAG Pipelines",
      "LLMs",
      "LangChain",
      "SentenceTransformers",
      "DistilBERT",
      "Groq LLM",
      "Streamlit",
      "pdfplumber",
      "Prompt Engineering",
      "Model Evaluation",
    ],
  },
  {
    id: "automation",
    label: "Automation",
    blurb: "Scrapers, browser automation and pipelines that run on their own.",
    items: ["Web Scraping", "Playwright", "Browser Automation", "Data Pipelines", "Background Jobs", "BullMQ", "Redis"],
  },
  {
    id: "mobile",
    label: "Mobile",
    blurb: "Cross-platform apps from one codebase.",
    items: ["React Native", "Expo"],
  },
  {
    id: "systems",
    label: "Systems & Tools",
    blurb: "Low-level foundations and daily tooling.",
    items: ["C++", "C", "Assembly (8086)", "Git", "GitHub", "Linux/Ubuntu", "VS Code", "VMware", "DOSBox", "LogicWorks"],
  },
];

/**
 * Where each skill was actually used — project titles from content/projects.ts
 * (featured or parked). A skill missing here shows a neutral fallback, so only
 * add a project you really used it in.
 */
const SAT2 = "SAT Sharks 2.0";
const SAT = "SAT Sharks";
const BATWARA = "BatwaraNow";
const RAG = "Academic RAG Assistant";
const RESUME = "SmartResume AI";
const VAULT = "TradeVault";

export const skillUsage: Record<string, string[]> = {
  // Frontend
  "React.js": [SAT2, SAT, VAULT],
  "Next.js": [SAT2],
  TypeScript: [SAT2, VAULT],
  JavaScript: [SAT, BATWARA],
  HTML5: [SAT2, SAT, VAULT],
  CSS3: [SAT2, SAT, VAULT],
  Vite: [VAULT],
  // Backend
  "Node.js": [SAT2, SAT, BATWARA],
  "Express.js": [SAT2, SAT],
  FastAPI: [RAG],
  "RESTful API Design": [SAT2, SAT, RAG],
  "Role-Based Auth": [SAT2, SAT],
  // Databases
  MongoDB: [SAT2, SAT],
  Qdrant: [RAG],
  // AI / ML
  Python: [RAG, RESUME],
  "Machine Learning": [RESUME],
  NLP: [RESUME],
  "RAG Pipelines": [RAG],
  LLMs: [RAG],
  LangChain: [RAG],
  SentenceTransformers: [RAG],
  DistilBERT: [RESUME],
  "Groq LLM": [RAG],
  Streamlit: [RESUME],
  pdfplumber: [RESUME],
  "Prompt Engineering": [RAG],
  "Model Evaluation": [RESUME],
  // Automation
  "Web Scraping": [SAT2],
  Playwright: [SAT2],
  "Browser Automation": [SAT2],
  "Data Pipelines": [SAT2, RAG],
  "Background Jobs": [SAT2],
  BullMQ: [SAT2],
  Redis: [SAT2],
  // Mobile
  "React Native": [BATWARA],
  Expo: [BATWARA],
  // Systems & Tools
  "C++": ["Social Media Console App"],
  "Assembly (8086)": ["Word Catcher Game"],
  DOSBox: ["Word Catcher Game"],
  Git: ["every project"],
  GitHub: ["every project"],
  "VS Code": ["every project"],
};

/** Shown as display-type rather than chips. */
export const foundations = [
  "Data Structures & Algorithms",
  "Object-Oriented Programming",
  "Database Systems",
  "Operating Systems",
  "Computer Organization & Assembly",
  "Digital Logic Design",
];

/** The four layers of the exploded-laptop scene. */
export const layers = [
  {
    id: "interface",
    part: "Display",
    title: "Interface",
    line: "What people see and touch.",
    tags: ["React.js", "Next.js", "TypeScript", "React Native"],
  },
  {
    id: "logic",
    part: "Logic board",
    title: "Logic",
    line: "APIs, auth and business rules.",
    tags: ["Node.js", "Express.js", "FastAPI", "REST"],
  },
  {
    id: "storage",
    part: "Storage",
    title: "Data",
    line: "Where it all persists and gets searched.",
    tags: ["MongoDB", "PostgreSQL", "MySQL", "Qdrant"],
  },
  {
    id: "compute",
    part: "Processor",
    title: "Intelligence",
    line: "Models that read, retrieve and generate.",
    tags: ["Python", "LangChain", "RAG", "LLMs"],
  },
] as const;
