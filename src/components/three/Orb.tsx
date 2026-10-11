"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import * as THREE from "three";
import { PALETTE } from "./descent";

/**
 * The orb: obsidian glass that each ring turns into a pearl of a new colour.
 * One lighting model for every stage — a lit→shadow body with a slow liquid
 * drift, a soft specular highlight, a faint sheen toward the rim and gentle
 * limb darkening, so the edge reads round and soft with no glow around it.
 * Colours ease toward the current stage every frame, so even a fast scroll
 * gets a smooth change.
 *
 * Two textures baked in Blender give it depth once loaded (they fade in, the
 * orb never waits on them): a studio matcap — a mirror sphere under softboxes
 * and back rims — for real reflections along the edge, and a pearl detail map
 * (R marble veins, G nacre grain, B slow clouds) sampled in object space.
 */

const vertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPos;
  varying vec3 vObjN;
  void main() {
    vPos = position;
    vObjN = normal;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform float uTime;
  uniform float uCharge;
  uniform float uFade;
  uniform vec3 uA; // lit side
  uniform vec3 uB; // shadow side
  uniform vec3 uC; // sheen + rim
  uniform sampler2D uMatcap;
  uniform sampler2D uDetail;
  uniform float uTex; // 0 → 1 as the baked textures arrive
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPos;
  varying vec3 vObjN;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    float facing = clamp(dot(n, v), 0.0, 1.0);
    float fres = 1.0 - facing;
    vec3 L = normalize(vec3(-0.5, 0.75, 0.45));
    float wrap = clamp(dot(n, L) * 0.5 + 0.5, 0.0, 1.0);
    float top = smoothstep(-0.2, 0.9, n.y);

    // Slow liquid drift so the pearl feels alive.
    vec3 p = vPos * 1.3;
    float flow = sin(p.x * 1.5 + uTime * 0.22 + sin(p.y * 2.0 - uTime * 0.17) * 1.4) * 0.5 + 0.5;

    // Baked pearl detail, wrapped round the sphere and turning slowly inside it.
    vec3 on = normalize(vObjN);
    vec2 duv = vec2(atan(on.z, on.x) / 6.2831853 + 0.5 + uTime * 0.006, asin(clamp(on.y, -1.0, 1.0)) / 3.1415927 + 0.5);
    vec3 det = mix(vec3(0.5), texture2D(uDetail, duv).rgb, uTex);
    float vein = mix(flow, det.r, 0.65 * uTex);

    // Body: shadow → lit, nudged by the veins.
    vec3 col = mix(uB, uA, smoothstep(0.1, 0.95, wrap * 0.85 + (vein - 0.5) * 0.36));
    // Slow clouds drift a pearl toward its sheen colour; nacre grain breaks up flat fills.
    col = mix(col, uC, clamp((det.b - 0.45) * 0.5, 0.0, 1.0) * uCharge);
    col *= 1.0 + (det.g - 0.5) * 0.14;
    // Thin-film sheen toward the rim.
    col = mix(col, uC, smoothstep(0.45, 1.0, fres) * mix(0.2, 0.45, uCharge));
    // Limb darkening: a soft, slightly darker edge instead of a hard cut-out.
    col *= mix(0.5, 1.0, smoothstep(0.0, 0.7, facing));

    // Analytic highlight until the matcap arrives, then the studio reflections take over.
    vec3 h = normalize(L + v);
    float nh = max(dot(n, h), 0.0);
    col += vec3(pow(nh, 70.0) * 0.5 + pow(nh, 10.0) * 0.05) * (1.0 - uTex);
    vec3 refl = texture2D(uMatcap, n.xy * 0.485 + 0.5).rgb;
    float rk = mix(0.22, 1.0, pow(fres, 1.6)) * mix(0.85, 0.5, uCharge);
    col += refl * rk * uTex;

    // Pearls only: a whisper of thin-film iridescence right at the edge.
    vec3 irid = 0.5 + 0.5 * cos(6.2831853 * (fres * 1.1 + det.g * 0.35 + vec3(0.0, 0.33, 0.67)));
    col += irid * pow(fres, 2.5) * 0.14 * uCharge * uTex;

    // Rim light — a thin line along the dark orb's upper edge, a whisper once charged.
    col += uC * pow(fres, 3.0) * (0.08 + 0.42 * top) * mix(0.9, 0.25, uCharge);

    // Only the outermost pixel row fades: anti-aliasing, not a halo.
    float alpha = smoothstep(0.0, 0.07, facing);
    gl_FragColor = vec4(col * uFade, alpha);
    #include <colorspace_fragment>
  }
`;

export type OrbHandle = {
  group: THREE.Group;
  light: THREE.PointLight;
  /** ease colours toward `stage`; call once per frame. `fade` 0 → 1 dims the whole orb. */
  update: (stage: number, dt: number, time: number, fade: number) => void;
};

function loadTexture(url: string, setup: (tex: THREE.Texture) => void, onLoad: () => void) {
  const tex = new THREE.TextureLoader().load(url, onLoad);
  setup(tex);
  return tex;
}

export const Orb = forwardRef<OrbHandle>(function Orb(_, ref) {
  const group = useRef<THREE.Group>(null!);
  const light = useRef<THREE.PointLight>(null!);
  const material = useRef<THREE.ShaderMaterial>(null!);
  const charge = useRef(0);
  const loaded = useRef(0);
  const tex = useRef(0);

  const textures = useMemo(() => {
    const done = () => loaded.current++;
    return {
      matcap: loadTexture("/textures/orb-matcap.webp", (t) => (t.colorSpace = THREE.SRGBColorSpace), done),
      // No mipmaps: the longitude wrap would otherwise show a one-pixel seam.
      detail: loadTexture(
        "/textures/orb-detail.webp",
        (t) => {
          t.wrapS = THREE.RepeatWrapping;
          t.generateMipmaps = false;
          t.minFilter = THREE.LinearFilter;
        },
        done,
      ),
    };
  }, []);
  useEffect(() => () => Object.values(textures).forEach((t) => t.dispose()), [textures]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCharge: { value: 0 },
      uFade: { value: 1 },
      uA: { value: new THREE.Color(PALETTE[0].a) },
      uB: { value: new THREE.Color(PALETTE[0].b) },
      uC: { value: new THREE.Color(PALETTE[0].c) },
      uMatcap: { value: textures.matcap },
      uDetail: { value: textures.detail },
      uTex: { value: 0 },
    }),
    [textures],
  );
  const targets = useMemo(
    () => PALETTE.map((p) => ({ a: new THREE.Color(p.a), b: new THREE.Color(p.b), c: new THREE.Color(p.c) })),
    [],
  );

  useImperativeHandle(ref, () => ({
    get group() {
      return group.current;
    },
    get light() {
      return light.current;
    },
    update(stage, dt, time, fade) {
      // Read the live uniforms off the material — the renderer may hold its own copy.
      const u = material.current.uniforms as typeof uniforms;
      const k = 1 - Math.exp(-dt * 3);
      const target = targets[stage];
      u.uA.value.lerp(target.a, k);
      u.uB.value.lerp(target.b, k);
      u.uC.value.lerp(target.c, k);
      charge.current += ((stage > 0 ? 1 : 0) - charge.current) * k;
      u.uCharge.value = charge.current;
      u.uTime.value = time;
      u.uFade.value = fade;
      tex.current += ((loaded.current >= 2 ? 1 : 0) - tex.current) * (1 - Math.exp(-dt * 2));
      u.uTex.value = tex.current;
      light.current.color.copy(u.uA.value).lerp(u.uC.value, 0.5);
      light.current.intensity = (2.5 + charge.current * 14) * fade;
    },
  }));

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <shaderMaterial ref={material} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent />
      </mesh>
      <pointLight ref={light} distance={16} decay={1.6} intensity={2.5} />
    </group>
  );
});
