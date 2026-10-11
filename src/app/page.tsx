import { Nav } from "@/components/layout/Nav";
import { Descent } from "@/components/sections/Descent";
import { Projects } from "@/components/sections/Projects";
import { Capabilities } from "@/components/sections/Capabilities";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-volt focus:px-4 focus:py-2 focus:text-volt-ink"
      >
        Skip to work
      </a>
      <Nav />
      <main>
        <Descent />
        <Projects />
        <Capabilities />
        <About />
        <Contact />
      </main>
    </>
  );
}
