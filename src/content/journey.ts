// From the resume PDF and the previous portfolio's education block.

export type Milestone = {
  period: string;
  title: string;
  place: string;
  detail?: string;
  tags?: string[];
  current?: boolean;
};

export const journey: Milestone[] = [
  {
    period: "2019 to 2021",
    title: "Matriculation, Science",
    place: "Allama Iqbal Public High School, Kasur",
  },
  {
    period: "2021 to 2023",
    title: "Intermediate (FSc), Pre-Engineering",
    place: "PIASS College, Kasur",
    
  },
  {
    period: "2023 to Present",
    title: "BS Computer Science",
    place: "FAST-NUCES, Lahore",
    tags: [
      "Object-Oriented Programming",
      "Data Structures & Algorithms",
      "Database Systems",
      "Operating Systems",
      "COAL",
      "Digital Logic Design",
    ],
    current: true,
  },
];
