import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useCurrentFrame, useDelayRender, useVideoConfig } from "remotion";
import * as THREE from "three";
import timing from "./timing.json";

const TAU = Math.PI * 2;
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number) => {
  const p = clamp((t - a) / (b - a));
  return p * p * (3 - 2 * p);
};

// Seeded data is shared by all frames; motion is a pure function of time.
const rng = (seed: number) => {
  let state = seed;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) | 0;
    return (state >>> 0) / 4294967296;
  };
};

const particleVertex = `
  attribute vec4 seed;
  uniform float time;
  uniform float pixelScale;
  varying vec3 tint;
  varying float intensity;
  #define TAU 6.28318530718

  mat3 ry(float a) {
    return mat3(cos(a),0.,-sin(a), 0.,1.,0., sin(a),0.,cos(a));
  }
  void main() {
    float theta = seed.x * TAU;
    float phi = acos(2. * seed.y - 1.);
    vec3 unit = vec3(sin(phi)*cos(theta), cos(phi), sin(phi)*sin(theta));
    float gather = smoothstep(.5, 5.05, time);
    float radius = mix(3.8 + seed.z * 7., .25 + seed.z * .32, gather);
    float spiral = theta + time * (.32 + seed.z*.2) + gather*4.;
    vec3 cloud = vec3(cos(spiral)*radius*sin(phi), unit.y*radius*.48, sin(spiral)*radius*sin(phi));
    cloud.y += sin(spiral*3.+time)*.22*(1.-gather);

    float travel = max(0., time-5.3);
    float z = -34. + fract(seed.z + travel*.235 + travel*travel*.006)*42.;
    float angle = theta + z*.055 + time*.24;
    float rr = 2.6 + seed.y*4.7;
    vec3 tunnel = vec3(cos(angle)*rr, sin(angle)*rr, z);
    vec3 p = mix(cloud, tunnel, smoothstep(5.1, 5.8, time));
    vec3 compressed = ry(time*.6)*unit*(.7 + .10*sin(time*10.+theta));
    p = mix(p, compressed, smoothstep(10.7, 12.65, time));

    float elapsed = max(0.,time-12.8);
    float explosion = (1.-exp(-elapsed*1.3))*7.;
    vec3 shattered = unit*(.7+explosion*(.25+seed.z));
    shattered.y -= elapsed*elapsed*.075;
    shattered = ry(elapsed*.23)*shattered;
    p = mix(p, shattered, smoothstep(12.8,12.84,time));

    float a = theta + time*.2;
    float tube = seed.y * TAU + time*.48;
    float wave = sin(3.*a-time*.72)*.55;
    float ring = 3.1 + wave + .6*cos(tube);
    vec3 bloom = vec3(ring*cos(a), .6*sin(tube)+sin(a*2.+time*.62)*.62, ring*sin(a));
    bloom += unit*.15;
    bloom = ry(time*.14)*bloom;
    p = mix(p,bloom,smoothstep(15.,17.5,time));

    float breathe = 1. + .022*sin(time*2.4);
    vec3 globe = ry(time*.25)*unit*2.12*breathe;
    p = mix(p,globe,smoothstep(21.1,24.,time));

    vec4 mv = modelViewMatrix*vec4(p,1.);
    gl_Position = projectionMatrix*mv;
    float depth = max(1.,-mv.z);
    float warp = smoothstep(5.3,6.,time)*(1.-smoothstep(10.7,12.,time));
    gl_PointSize = min(26.,(12. + seed.w*25.)/depth * pixelScale);
    gl_PointSize *= 1.+warp*.5;
    float warm = smoothstep(15.6,18.,time);
    tint = mix(vec3(.42,.76,1.),vec3(1.,.65,.29),warm);
    tint = mix(tint,vec3(.88,.96,1.),pow(seed.w,5.));
    intensity = (.26+seed.w*.67) * (.8+.2*sin(time*2.3+theta*8.));
    intensity *= smoothstep(.0,.6,time);
    intensity *= 1.-smoothstep(27.1,28.,time);
    intensity *= 1.-smoothstep(7.,8.,p.z)*warp;
  }
`;

const particleFragment = `
  varying vec3 tint;
  varying float intensity;
  void main() {
    float r=length(gl_PointCoord-.5)*2.;
    if(r>1.) discard;
    float halo=exp(-r*r*5.)*.30;
    float core=exp(-r*r*44.);
    gl_FragColor=vec4(tint*2.5, (halo+core)*intensity);
  }
`;

const Dust: React.FC<{ time: number }> = ({ time }) => {
  const { height } = useVideoConfig();
  const material = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const random = rng(92487);
    const count = 15500;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < seeds.length; i++) seeds[i] = random();
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("seed", new THREE.BufferAttribute(seeds, 4));
    return g;
  }, []);
  const uniforms = useMemo(
    () => ({ time: { value: 0 }, pixelScale: { value: height / 402 } }),
    [height],
  );
  useLayoutEffect(() => {
    if (material.current) {
      material.current.uniforms.time.value = time;
      material.current.uniforms.pixelScale.value = height / 402;
    }
  }, [time, height]);

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const CameraRig: React.FC<{ time: number }> = ({ time }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const drift = smooth(1, 5.3, time) * (1 - smooth(5.3, 6.2, time));
    const warp = smooth(5.3, 6.2, time) * (1 - smooth(10.6, 12, time));
    const bloom = smooth(15, 18, time);
    const resolve = smooth(22, 26, time);
    const impact =
      time >= timing.break ? Math.exp(-(time - timing.break) * 4) : 0;
    const x =
      Math.sin(time * 0.38) * drift * 0.6 +
      Math.sin(time * 0.7) * warp * 0.7 +
      Math.sin(time * 0.16) * bloom * 2.2;
    const y =
      0.25 +
      drift * 0.55 +
      Math.cos(time * 0.52) * warp * 0.4 +
      bloom * 3.2 -
      resolve * 2.1;
    const z = 10 - drift * 1.1 - warp * 1.5 + bloom * 0.2 + resolve * 1.2;
    camera.position.set(
      x + Math.sin(time * 101) * impact * 0.13,
      y + Math.cos(time * 93) * impact * 0.11,
      z,
    );
    camera.lookAt(0, -0.1 + resolve * 0.25, -warp * 7);
    camera.rotateZ(
      Math.sin(time * 0.45) * warp * 0.11 + bloom * -0.13 + resolve * 0.1,
    );
    camera.updateMatrixWorld();
  }, [time, camera]);
  return null;
};

const Core: React.FC<{ time: number }> = ({ time }) => {
  const ref = useRef<THREE.Mesh>(null);
  const grow = smooth(1.2, 5, time);
  const squeeze = smooth(10.8, 12.6, time);
  const gone = smooth(12.8, 12.85, time);
  const scale = (0.015 + grow * 0.25 + squeeze * 0.46) * (1 - gone);

  useLayoutEffect(() => {
    ref.current?.rotation.set(time * 0.37, time * 0.67, time * 0.22);
  }, [time]);
  if (time >= 12.86) return null;

  return (
    <group scale={scale}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#07131f"
          emissive="#438cb1"
          emissiveIntensity={0.13 + squeeze * 0.9}
          metalness={0.95}
          roughness={0.15}
        />
        <lineSegments>
          <edgesGeometry args={[new THREE.IcosahedronGeometry(1.015, 0)]} />
          <lineBasicMaterial
            color={new THREE.Color("#c9f4ff").multiplyScalar(2.8)}
            transparent
            opacity={0.85}
            toneMapped={false}
          />
        </lineSegments>
      </mesh>
    </group>
  );
};

const Rings: React.FC<{ time: number }> = ({ time }) => {
  const active = smooth(5.05, 5.6, time) * (1 - smooth(10.6, 11.5, time));
  if (active <= 0) return null;
  const travel = (time - 5.3) * 9 + Math.max(0, time - 6) ** 2 * 0.36;
  return (
    <group rotation={[0, 0, time * 0.12]}>
      {Array.from({ length: 22 }, (_, i) => {
        const z = ((((i * 2.55 + travel) % 56) + 56) % 56) - 46;
        const fade = active * smooth(-46, -30, z) * (1 - smooth(5.5, 9, z));
        return (
          <mesh
            key={i}
            position={[Math.sin(z * 0.08) * 0.65, Math.cos(z * 0.07) * 0.45, z]}
            rotation={[0, 0, i * 0.11 + time * 0.09]}
          >
            <torusGeometry
              args={[3.4 + Math.sin(i * 0.9) * 0.27, 0.012, 4, 96, TAU * 0.88]}
            />
            <meshBasicMaterial
              color={new THREE.Color(
                i % 5 === 0 ? "#c0edff" : "#467ca0",
              ).multiplyScalar(2)}
              transparent
              opacity={fade * 0.7}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
};

const Traces: React.FC<{ time: number }> = ({ time }) => {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(420 * 6), 3),
    );
    return g;
  }, []);
  const active = smooth(5.4, 6.5, time) * (1 - smooth(10.7, 11.7, time));
  useLayoutEffect(() => {
    const a = geometry.attributes.position.array as Float32Array;
    const random = rng(287);
    const travel = Math.max(0, time - 5.3);
    for (let i = 0; i < 420; i++) {
      const angle = random() * TAU + time * 0.12;
      const r = 3.6 + random() * 5;
      const z =
        ((random() * 45 + travel * 12 + travel * travel * 0.5) % 45) - 36;
      a.set(
        [
          Math.cos(angle) * r,
          Math.sin(angle) * r,
          z,
          Math.cos(angle) * r,
          Math.sin(angle) * r,
          z + 0.3 + active * 0.65,
        ],
        i * 6,
      );
    }
    geometry.attributes.position.needsUpdate = true;
  }, [time, active, geometry]);
  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial
        color="#a8e3ff"
        transparent
        opacity={active * 0.31}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
};

const Shards: React.FC<{ time: number }> = ({ time }) => {
  const elapsed = Math.max(0, time - timing.break);
  const opacity = smooth(12.78, 12.83, time) * (1 - smooth(15.1, 17.2, time));
  const ref = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(() => {
    const random = rng(640);
    return Array.from({ length: 100 }, () => ({
      a: random() * TAU,
      z: random() * 2 - 1,
      v: 1.7 + random() * 4,
      size: 0.05 + random() * 0.18,
      spin: random() * 8 - 4,
    }));
  }, []);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    seeds.forEach((s, i) => {
      const radial = Math.sqrt(1 - s.z * s.z);
      const r = 0.65 + (1 - Math.exp(-elapsed * 0.72)) * s.v * 1.5;
      dummy.position.set(
        Math.cos(s.a) * radial * r,
        s.z * r - elapsed * elapsed * 0.16,
        Math.sin(s.a) * radial * r,
      );
      dummy.rotation.set(
        elapsed * s.spin,
        s.a + elapsed * 1.3,
        elapsed * s.spin * 0.7,
      );
      dummy.scale.set(s.size * 0.75, s.size * 0.16, s.size * 0.25);
      dummy.updateMatrix();
      ref.current?.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [elapsed, seeds]);
  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, 100]}
      frustumCulled={false}
    >
      <tetrahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#203b51"
        emissive="#96c7ef"
        emissiveIntensity={1.7}
        roughness={0.17}
        metalness={0.9}
        transparent
        opacity={opacity}
      />
    </instancedMesh>
  );
};

const Filaments: React.FC<{ time: number }> = ({ time }) => {
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(18 * 180 * 6), 3),
    );
    return geometry;
  }, []);
  const active = smooth(15.3, 17.3, time) * (1 - smooth(22, 24, time));
  useLayoutEffect(() => {
    const a = line.attributes.position.array as Float32Array;
    const point = (angle: number, j: number) => {
      const phase = (j / 18) * TAU;
      const r =
        3.1 +
        0.55 * Math.sin(angle * 3 - time * 0.72) +
        0.6 * Math.cos(phase + time * 0.48);
      return [
        Math.cos(angle) * r,
        0.6 * Math.sin(phase + time * 0.48) +
          Math.sin(angle * 2 + time * 0.62) * 0.62,
        Math.sin(angle) * r,
      ];
    };
    let offset = 0;
    for (let j = 0; j < 18; j++)
      for (let k = 0; k < 180; k++) {
        a.set(point((k / 180) * TAU + time * 0.2, j), offset);
        a.set(point(((k + 1) / 180) * TAU + time * 0.2, j), offset + 3);
        offset += 6;
      }
    line.attributes.position.needsUpdate = true;
  }, [time, line]);
  return (
    <lineSegments
      geometry={line}
      rotation={[0, time * 0.14, 0]}
      frustumCulled={false}
    >
      <lineBasicMaterial
        color={new THREE.Color("#ffd9a0").multiplyScalar(2.2)}
        transparent
        opacity={active * 0.36}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  );
};

const Shockwaves: React.FC<{ time: number }> = ({ time }) => {
  return (
    <group>
      {[timing.break, timing.release, ...timing.waves].map((at, i) => {
        const age = time - at;
        const radius = 0.1 + Math.max(0, age) * 5.5;
        const alpha = age < 0 ? 0 : Math.exp(-age * 1.75) * 0.8;
        return (
          <mesh
            key={at}
            scale={radius}
            rotation={[i === 0 ? 0 : Math.PI * 0.38, 0, 0.2]}
          >
            <torusGeometry args={[1, 0.003, 4, 160]} />
            <meshBasicMaterial
              color={i === 0 ? "#cceeff" : "#ffdda2"}
              transparent
              opacity={alpha}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// The composer creates its passes in effects. Hold each capture until those
// effects have settled, then render explicitly at the requested frame.
const PostFrameReady: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { advance } = useThree();
  const { delayRender, continueRender } = useDelayRender();
  useLayoutEffect(() => {
    const handle = delayRender("Waiting for frame-driven bloom");
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        advance(frame / fps);
        continueRender(handle);
      });
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      continueRender(handle);
    };
  }, [frame, fps, advance, delayRender, continueRender]);
  return null;
};

export const ParticleWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const time = frame / fps;
  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ fov: 44, near: 0.1, far: 140, position: [0, 0.25, 10] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 6]} intensity={4} color="#b7e5ff" />
      <pointLight position={[-3, -1, 3]} intensity={35} color="#396cfe" />
      <CameraRig time={time} />
      <Dust time={time} />
      <Core time={time} />
      <Rings time={time} />
      <Traces time={time} />
      <Shards time={time} />
      <Filaments time={time} />
      <Shockwaves time={time} />
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={1.15}
          luminanceThreshold={0.25}
          luminanceSmoothing={0.5}
          mipmapBlur
          radius={0.7}
        />
      </EffectComposer>
      <PostFrameReady />
    </ThreeCanvas>
  );
};
