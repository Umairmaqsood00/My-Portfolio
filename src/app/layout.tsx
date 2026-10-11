import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { site, siteUrl } from "@/content/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const description = `${site.name}, ${site.role} in ${site.location}. ${site.intro}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${site.name} | ${site.role}`, template: `%s | ${site.name}` },
  description,
  applicationName: site.name,
  authors: [{ name: site.name, url: siteUrl }],
  keywords: [
    "Umair Maqsood",
    "Full-Stack Developer",
    "AI Developer",
    "Next.js",
    "React",
    "Node.js",
    "RAG",
    "LangChain",
    "FAST-NUCES",
    "Lahore",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: `${site.name} | ${site.role}`,
    description,
  },
  twitter: { card: "summary_large_image", title: `${site.name} | ${site.role}`, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#090a09",
  colorScheme: "dark",
};

// Runs before paint and resolves the display mode (lib/motion.ts): `.still` for
// 2D (always on phones, which also get `.phone`; elsewhere the stored choice,
// else the OS reduced-motion preference), otherwise
// `.js-motion`, which hides content until its reveal animation runs. If the JS
// bundle never arrives, that content is shown anyway after 4s.
const motionFlag = `(function(){try{var d=document.documentElement,m=null,p=matchMedia('(max-width: 767px), (pointer: coarse) and (max-height: 520px)').matches;if(p)d.classList.add('phone');try{m=new URLSearchParams(location.search).get('mode')||localStorage.getItem('mode')}catch(e){}if(p||m==='2d'||(m!=='3d'&&matchMedia('(prefers-reduced-motion: reduce)').matches)){d.classList.add('still')}else{d.classList.add('js-motion');setTimeout(function(){if(!window.__revealed)d.classList.remove('js-motion')},4000)}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionFlag }} />
      </head>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
        <div aria-hidden className="grain" />
      </body>
    </html>
  );
}
