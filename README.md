# Umair Maqsood — Portfolio

My personal portfolio: a scroll-driven 3D story built from scratch with Next.js, React Three Fiber and assets I modelled in Blender.

A dark glass orb sits between two wet black rocks. As you scroll, it drops down a stone shaft and falls through four glowing rings, one for each layer of the stack I build (Interface, Logic, Data, Intelligence). Each ring turns it into a pearl of a new colour. At the bottom, a skeletal hand rises out of black water, catches the orb and pulls it under. After that come the projects, skills, about and contact sections.

**Live:** [my-portfolio-gamma-topaz-52.vercel.app](https://my-portfolio-gamma-topaz-52.vercel.app)

---

## Contents

- [Tech stack](#tech-stack)
- [How it was made](#how-it-was-made)
  - [1. Blender: the rings](#1-blender-the-rings)
  - [2. Blender: the rocks](#2-blender-the-rocks)
  - [3. Blender: the orb's textures](#3-blender-the-orbs-textures)
  - [4. Blender: the 2D planet render](#4-blender-the-2d-planet-render)
  - [5. The hand](#5-the-hand)
  - [6. Bringing it into the browser](#6-bringing-it-into-the-browser)
  - [7. One number drives the whole story](#7-one-number-drives-the-whole-story)
  - [8. Light, water and atmosphere](#8-light-water-and-atmosphere)
  - [9. Sound with no audio files](#9-sound-with-no-audio-files)
- [2D and 3D modes](#2d-and-3d-modes)
- [Performance and fallbacks](#performance-and-fallbacks)
- [The rest of the page](#the-rest-of-the-page)
- [Project structure](#project-structure)
- [Running it locally](#running-it-locally)
- [Deploying to Vercel](#deploying-to-vercel)
- [Editing the content](#editing-the-content)
- [Credits](#credits)

---

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| 3D | three.js, React Three Fiber, drei, @react-three/postprocessing |
| Animation | GSAP + ScrollTrigger, Lenis smooth scrolling |
| Styling | Tailwind CSS 4 |
| 3D assets | Blender (modelling, texture baking, Cycles rendering), glTF export |
| Hosting | Vercel |
| Contact form | Formspree |

---

## How it was made

The scene has five pieces: **rings**, **rocks**, the **orb**, the **hand** and the **water**. The rings and rocks are models I built in Blender. The orb is a shader written in code, which uses two textures baked in Blender. The hand is a CC-BY model I re-posed in code. The water is created entirely in code.

```
 Blender                                   Browser (React Three Fiber)
 ───────                                   ───────────────────────────
 Ring model (core + detail)  ── .glb ──▶   Rings.tsx   recoloured + animated per frame
 4 rock variants + normal map ─ .glb ──▶   Rocks.tsx   ~40 placements, wet-stone material
 Matcap + pearl detail bake  ── .webp ─▶   Orb.tsx     custom shader on a plain sphere
 Cycles render of the planet ── .webp ─▶   Descent.tsx the still orb for 2D mode / phones
                       Sketchfab hand ──▶  Hand.tsx    posed joint by joint in code
                                           Water.tsx   reflective water + ripples (code only)
```

### 1. Blender: the rings

File: [`public/models/ring.glb`](public/models/ring.glb) (~95 KB) · Code: [`src/components/three/Rings.tsx`](src/components/three/Rings.tsx)

Each ring is designed to look like part of a precision instrument rather than a plain torus. I modelled it in Blender as **two separate meshes** so the code can treat the parts differently:

- **`ringCore`**: one bright, solid band. This is the only part bright enough to trigger the bloom effect, so it's the part that glows.
- **`ringDetail`**: the fine details: a ring of graduated tick marks, a broken outer hairline and a dashed inner line.

Both were exported with Blender's glTF exporter (Khronos glTF Blender I/O). The materials are left out of the file because the code assigns its own.

In the browser, the four rings reuse this one model at different depths in the shaft. Each ring is:
- tinted toward the colour it is about to give the orb,
- tilted slightly differently from the others and slowly spinning,
- given a counter-rotating tick layer, so the ring looks like a working dial,
- flashed and briefly enlarged when the orb passes through it.

The detail layer is kept at 32% of the core's brightness so it stays under the bloom threshold and stays crisp instead of turning into haze.

### 2. Blender: the rocks

File: [`public/models/rocks.glb`](public/models/rocks.glb) (~740 KB) · Code: [`src/components/three/Rocks.tsx`](src/components/three/Rocks.tsx)

The rocks line the shaft, frame the orb in the hero and stand in the water at the bottom. I modelled **four rock variants** in Blender (`rock0` to `rock3`, about 2,500 vertices each). Each has split-stone facets, fractures and layered strata.

The fine detail isn't in the geometry. It's **baked into one shared normal map**, which keeps the meshes light and makes all four rocks look like the same stone. The normal map is embedded in the `.glb` as WebP (`EXT_texture_webp`) to keep the download small.

In code:
- The four variants are placed about 40 times, each with its own position, rotation and scale. A seeded random generator decides the layout, so it comes out identical on every load and on both server and client.
- The material makes them look like wet stone: a rough, near-black rock that uses the baked normal map, under a glossy clear-coat layer of "water" that follows the big facets so they catch crisp highlights.
- On phones the clear-coat is swapped for a cheaper glossy material, because clear-coat doubles the lighting cost.

### 3. Blender: the orb's textures

Files: [`public/textures/orb-matcap.webp`](public/textures/orb-matcap.webp), [`public/textures/orb-detail.webp`](public/textures/orb-detail.webp) · Code: [`src/components/three/Orb.tsx`](src/components/three/Orb.tsx)

The orb is not a model. It's a plain sphere with a custom shader, so its colour can change smoothly at every ring. Blender supplied two baked textures that give it depth:

- **Studio matcap (512×512)**: a mirror sphere rendered under softbox lights and back rims. The shader uses it for realistic reflections along the orb's edge.
- **Pearl detail map (1024×512)**: three separate patterns packed into one image's colour channels:
  - **R**: marble veins
  - **G**: nacre (mother-of-pearl) grain
  - **B**: slow-moving clouds

The shader samples the detail map in the sphere's own 3D space and turns it slowly, so the veins look like they're floating inside the pearl. On top of that it adds:
- a lit-to-shadow body colour that drifts slowly like liquid,
- a soft highlight,
- a thin-film sheen and a hint of iridescence toward the rim,
- slight darkening at the edge, so the orb reads as round without a glow halo.

The page never waits for these textures. The orb renders right away with a calculated highlight, and the baked textures fade in once they've loaded.

The orb's colours follow this order, from [`descent.ts`](src/components/three/descent.ts):

| Stage | Look |
| --- | --- |
| Start | Obsidian glass |
| Ring 1: Interface | Glacier blue |
| Ring 2: Logic | Periwinkle |
| Ring 3: Data | Lilac |
| Ring 4: Intelligence | Rose pearl |

### 4. Blender: the 2D planet render

File: [`public/images/orb-glow-soft.webp`](public/images/orb-glow-soft.webp) · Code: `OrbStill` in [`src/components/sections/Descent.tsx`](src/components/sections/Descent.tsx)

Phones, and visitors who choose 2D, get a still image instead of the live scene. I built it in Blender with the **lilac pearl, the site's ring model and a belt of dust**, rendered with **Cycles** on a black background.

- It's composited onto the page with `mix-blend-mode: screen`, so the black disappears and the render's own glow carries over onto the dark page.
- Its baked halo was later cut back so it doesn't spill over the name in the hero. The halo was softened outside the sphere's edge while the sphere, ring and stars stayed untouched.
- On phones it has a little life: a slow float, a faint breathing aura and twinkling stars, all done in CSS ([`globals.css`](src/app/globals.css)).

### 5. The hand

File: [`public/models/skeleton-hand.glb`](public/models/skeleton-hand.glb) · Code: [`src/components/three/Hand.tsx`](src/components/three/Hand.tsx)

The hand is ["Skeleton Hand" by Zachariah Hale](https://sketchfab.com/3d-models/skeleton-hand-a4bf7eabaca24985b3aa2dbfc2d369ca) (CC BY 4.0), modified. It has no skeleton rig: each finger joint is a separate node. So the code poses it directly, rotating each joint from its resting position with three controls:

- **rise**: emerges from the water fingers-up, then the wrist bends back so the palm turns up under the orb
- **spread**: fingers fan out to receive it
- **curl**: fingers close around the orb

The model also gets a new material in code to match the scene.

### 6. Bringing it into the browser

Everything runs in one React Three Fiber canvas ([`DescentCanvas.tsx`](src/components/three/DescentCanvas.tsx)):

- Models load with drei's `useGLTF` and are preloaded as soon as the module loads.
- **Each model has its own `Suspense` boundary.** The orb shows immediately, and the rings, rocks and hand each appear as they finish downloading. A slow download never blocks the hero.
- The canvas is loaded dynamically on the client only, so it stays out of the server-rendered HTML.
- Rendering pauses completely when the section is off-screen.

### 7. One number drives the whole story

The core idea is in [`src/components/three/descent.ts`](src/components/three/descent.ts): **a single number, `t`, runs from 0 to 12** and determines everything on screen.

- GSAP ScrollTrigger maps the hero section's scroll range onto `t`.
- On every frame, the render loop reads `t` and works out the orb's height, the current ring, the orb's colour, the camera position, the hand's pose and the text overlays from a set of keyframes.
- The orb's fall is eased between keyframes, so it **pauses on each chapter and passes the rings at speed**.
- Since everything is calculated from `t`, scrolling backwards plays the whole story in reverse at no extra cost.
- Scrolling never causes a React re-render. GSAP writes to a plain mutable object, and the 3D loop reads from it.

The camera follows in three phases: a hero framing between the two big rocks, a slow orbit around the shaft as the orb falls, and a low angle over the water at the bottom.

### 8. Light, water and atmosphere

- **Lighting:** two directional lights (a cool key light from above and a blue rim from below), plus a small studio environment built from drei `Lightformer` panels. The wet rocks reflect those panels, so no HDR file needs to be downloaded.
- **Water** ([`Water.tsx`](src/components/three/Water.tsx)): a black reflective surface (`MeshReflectorMaterial`) with expanding ripple rings, three per disturbance, when the hand breaks the surface. It only renders near the bottom of the shaft.
- **Post-processing:** bloom with a high threshold (only the ring cores and the orb's highlight glow, never its body) and a vignette. Fog and floating dust particles give the shaft depth.
- **Tone mapping:** ACES Filmic.

### 9. Sound with no audio files

[`src/lib/ambient.ts`](src/lib/ambient.ts) generates the soundtrack live with the Web Audio API:

- a slow, slightly detuned pad on D · A · C# · E over a low D (open and unresolved, so it never sounds like a loop),
- a soft water bed made from filtered brown noise,
- a chime as each ring is passed and a splash when the hand breaks the surface,
- a filter that closes gradually, so **the sound gets darker the deeper you go**.

Nothing is created until the visitor turns sound on, as browsers require. Phones get no sound.

---

## 2D and 3D modes

The site has two modes, switched with the **2D / 3D** toggle in the nav ([`src/lib/motion.ts`](src/lib/motion.ts)):

- **3D**: the full scroll-driven scene with Lenis smooth scrolling and GSAP reveals.
- **2D**: a static page with no animation, which shows the Blender still of the planet.

A small inline script in [`layout.tsx`](src/app/layout.tsx) chooses the mode **before the first paint**, so the page never flashes the wrong one:

- **Phones** are always 2D.
- On other devices the visitor's saved choice wins. Without one, visitors whose OS asks for reduced motion start in 2D.
- The script adds a `.still` class to `<html>`, and CSS, GSAP, Lenis and the canvas all follow that one class.
- If the JavaScript never arrives, hidden content is shown anyway after 4 seconds.

## Performance and fallbacks

- **Phones and tablets** get a lighter scene: 1× pixel ratio, no post-processing, no reflections, fewer particles, cheaper rock material.
- **Frame watchdog:** if the scene renders below 12 fps for a sustained stretch, the site switches to the 2D still. A single long frame (shader compiling, tab switch) doesn't count.
- **GPU context lost** (common on phones under memory pressure): the site switches to the still image instead of showing a black canvas.
- **No WebGL at all:** the 2D experience is shown.
- **Crash protection:** an error boundary around the canvas switches to the 2D still if the 3D scene crashes.
- **Images:** AVIF/WebP via `next/image`. Models and textures use WebP and stay small (the largest is the rocks file, about 740 KB).

## The rest of the page

| Section | What happens |
| --- | --- |
| **Projects** ([`Projects.tsx`](src/components/sections/Projects.tsx)) | Panels wipe open and their contents assemble; data packets flow through each project's diagram |
| **Capabilities** ([`Capabilities.tsx`](src/components/sections/Capabilities.tsx)) | A marquee that moves with the scroll, never on its own; grouped skill lists |
| **About** ([`About.tsx`](src/components/sections/About.tsx)) | Words light up as you read; a timeline line draws itself as you scroll |
| **Contact** ([`Contact.tsx`](src/components/sections/Contact.tsx)) | Formspree form, socials, live Lahore time, a glow that rises as the page ends |

Plus an Open Graph image generated in code ([`opengraph-image.tsx`](src/app/opengraph-image.tsx)), a sitemap and a robots file.

---

## Project structure

```
portfolio/
├── public/
│   ├── models/          ring.glb, rocks.glb (Blender) · skeleton-hand.glb (Sketchfab)
│   ├── textures/        orb-matcap.webp, orb-detail.webp (Blender bakes)
│   ├── images/          orb-glow-soft.webp (Cycles render), portrait, project shots
│   └── files/          Resume PDF
└── src/
    ├── app/             layout (mode script, fonts, metadata), page, OG image, sitemap
    ├── components/
    │   ├── three/       DescentCanvas, Orb, Rings, Rocks, Hand, Water, descent.ts
    │   ├── sections/    Descent (hero), Projects, Capabilities, About, Contact
    │   ├── layout/      Nav, ModeToggle, SoundToggle
    │   └── providers/   SmoothScroll (Lenis ↔ GSAP)
    ├── content/         site.ts, projects.ts, skills.ts, journey.ts  ← all text lives here
    └── lib/             gsap, motion (2D/3D), ambient (sound), useReveal
```

> `Stage.tsx`, `Laptop.tsx`, `WorkstationCanvas.tsx`, `stageState.ts` and `LayerStackFallback.tsx` are an earlier concept: a laptop that splits apart into its layers. They're kept in the repo but not used on the page.

---

## Running it locally

Requirements: Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:3000
```

To test on your phone, open `http://<your-PC's-local-IP>:3000` on the same Wi-Fi. `next.config.ts` already allows `192.168.*.*` and `10.*.*.*`.

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint
```

## Deploying to Vercel

1. Push to GitHub (`main`).
2. Go to [vercel.com/new](https://vercel.com/new), import the repo and keep the detected defaults: Framework **Next.js**, build `next build`, root `./`.
3. Click **Deploy**. You don't need to set any environment variables. The canonical URL comes from `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel provides.
4. Optional: after adding a custom domain, set `NEXT_PUBLIC_SITE_URL=https://your-domain` so the metadata and sitemap use it.

Every push to `main` redeploys automatically, and other branches get preview URLs.

> If you replace an image in `public/` and the old one keeps showing, give the file a new name. Next's image optimiser and the CDN cache images by URL.

## Editing the content

All text lives in [`src/content/`](src/content), not in the components:

- [`site.ts`](src/content/site.ts): name, role, email, about text, socials,Resume path, Formspree endpoint
- [`projects.ts`](src/content/projects.ts): featured projects and the archive
- [`skills.ts`](src/content/skills.ts): the capabilities lists
- [`journey.ts`](src/content/journey.ts): the About timeline

To change the scroll story (ring depths, chapter timing, orb colours), edit [`descent.ts`](src/components/three/descent.ts).

---

## Credits

- **Skeleton Hand** by [Zachariah Hale](https://sketchfab.com/zachariah.the.hale), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), modified (new material, posed and animated in code). Also credited in the site footer.
- Rings, rocks, orb textures and the 2D planet render: made in Blender for this site.

---

Designed and built from scratch by **Umair Maqsood**, Lahore.
