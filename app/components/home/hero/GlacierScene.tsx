/**
 * Echtzeit-Hero: Kamera fliegt über einen Gletscher auf eine Eiswand zu,
 * das Eis bricht auf, das orange Signet steigt heraus.
 * Wird nur clientseitig und nur auf Desktop mit ausreichender GPU geladen.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {Environment, Lightformer, PerformanceMonitor} from '@react-three/drei';
import {
  Bloom,
  EffectComposer,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import {BlendFunction} from 'postprocessing';
import * as THREE from 'three';
import {SIGNET_BASE, SIGNET_PEAK} from '~/components/brand/logo-geometry';
import {
  easeInOut,
  easeOut,
  fbm,
  lerp,
  range,
  ridged,
  seeded,
  smoothstep,
} from './math';

type Progress = MutableRefObject<number>;

type SceneProps = {
  progress: Progress;
  active: boolean;
  onReady: () => void;
};

export default function GlacierScene({progress, active, onReady}: SceneProps) {
  const [dpr, setDpr] = useState(1.5);
  // Erst rendern, wenn alle Shader kompiliert sind – sonst blockiert die
  // (unter Windows/D3D sehr langsame) Kompilierung den Main Thread
  const [compiled, setCompiled] = useState(false);
  const onCompiled = useCallback(() => setCompiled(true), []);

  useEffect(() => {
    if (!compiled) return;
    // zwei Frames: erster Render inkl. Postprocessing, dann Preloader freigeben
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => onReady());
    });
    return () => cancelAnimationFrame(id);
  }, [compiled, onReady]);

  return (
    <Canvas
      dpr={dpr}
      frameloop={active && compiled ? 'always' : 'never'}
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      camera={{fov: 38, near: 0.1, far: 140, position: [0, 2.6, 26]}}
      onCreated={({gl}) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.9;
      }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(Math.min(1.75, window.devicePixelRatio))}
      />
      <color attach="background" args={['#05080d']} />
      <fog attach="fog" args={['#08111b', 9, 50]} />

      <ambientLight intensity={0.12} color="#4a6a8a" />
      <hemisphereLight args={['#7fa6c2', '#05080d', 0.22]} />
      <directionalLight
        position={[-9, 11, -14]}
        intensity={2.6}
        color="#bfd9e6"
      />
      <directionalLight
        position={[7, 5, 12]}
        intensity={0.25}
        color="#7fa3c4"
      />

      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.2}
          color="#bfd9e6"
          position={[0, 6, -8]}
          scale={[18, 4, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          color="#e8f4fa"
          position={[-10, 2, 4]}
          rotation-y={Math.PI / 2}
          scale={[10, 3, 1]}
        />
        <Lightformer
          form="circle"
          intensity={3}
          color="#ff5a1f"
          position={[4, 1, 6]}
          scale={1.6}
        />
      </Environment>

      <CameraRig progress={progress} />
      <Terrain />
      <IceWall progress={progress} />
      <Glow progress={progress} />
      <SignetModel progress={progress} />
      <Snow />
      <Precompile onDone={onCompiled} />

      {compiled ? (
        <EffectComposer multisampling={0}>
          <Bloom
            mipmapBlur
            intensity={0.85}
            luminanceThreshold={0.62}
            luminanceSmoothing={0.25}
          />
          <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
          <Vignette offset={0.22} darkness={0.78} />
        </EffectComposer>
      ) : null}
    </Canvas>
  );
}

/** Weich nachgezogener Scroll-Fortschritt, damit die Szene auch bei Mausrad-Sprüngen gleitet. */
function useSmoothedProgress(progress: Progress) {
  const smoothed = useRef(progress.current);
  useFrame((_, delta) => {
    smoothed.current = lerp(
      smoothed.current,
      progress.current,
      1 - Math.exp(-delta * 7),
    );
  });
  return smoothed;
}

/**
 * Kompiliert alle Materialien der Szene asynchron (KHR_parallel_shader_compile),
 * bevor der erste Frame gerendert wird.
 */
function Precompile({onDone}: {onDone: () => void}) {
  const {gl, scene, camera} = useThree();
  useEffect(() => {
    let cancelled = false;
    gl.compileAsync(scene, camera)
      .catch(() => {})
      .then(() => !cancelled && onDone());
    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera, onDone]);
  return null;
}

/* ------------------------------------------------------------------ Kamera */

const CAMERA_KEYS: Array<{
  p: number;
  pos: [number, number, number];
  look: [number, number, number];
}> = [
  {p: 0, pos: [0, 3.1, 27], look: [0, 1.4, 0]},
  {p: 0.3, pos: [0.9, 2.2, 13], look: [0, 1.7, 0]},
  {p: 0.55, pos: [-0.2, 1.9, 8.6], look: [0, 1.9, 0]},
  {p: 0.85, pos: [0, 2.2, 7.2], look: [0, 2.35, 0]},
  {p: 1, pos: [0, 2.25, 7.6], look: [0, 2.25, 0]},
];

function CameraRig({progress}: {progress: Progress}) {
  const p = useSmoothedProgress(progress);
  const look = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);

  useFrame(({camera, pointer, size, clock}) => {
    const v = p.current;
    let i = 0;
    while (i < CAMERA_KEYS.length - 2 && v > CAMERA_KEYS[i + 1].p) i++;
    const a = CAMERA_KEYS[i];
    const b = CAMERA_KEYS[i + 1];
    const t = easeInOut(range(v, a.p, b.p));

    // Hochformat: weiter zurück, damit Wand und Signet ins Bild passen
    const portrait = size.width / size.height < 1 ? 1.45 : 1;
    const sway = Math.sin(clock.elapsedTime * 0.35) * 0.08;

    pos.set(
      lerp(a.pos[0], b.pos[0], t) + pointer.x * 0.35 + sway,
      lerp(a.pos[1], b.pos[1], t) + pointer.y * 0.18,
      lerp(a.pos[2], b.pos[2], t) * portrait,
    );
    look.set(
      lerp(a.look[0], b.look[0], t),
      lerp(a.look[1], b.look[1], t),
      lerp(a.look[2], b.look[2], t),
    );
    camera.position.lerp(pos, 0.12);
    camera.lookAt(look);
  });
  return null;
}

/* ---------------------------------------------------------------- Gelände */

/** Höhe des Geländes: flache Gletscherzunge in der Mitte, Grate an den Seiten und dahinter. */
function terrainHeight(x: number, z: number) {
  const ax = Math.abs(x);
  const tongue = fbm(x * 0.12 + 3, z * 0.12) * 0.7 - 0.35;
  const sides = smoothstep(4.5, 22, ax) * (5 + ridged(x * 0.07, z * 0.07) * 14);
  const behind =
    smoothstep(-1.5, -30, z) * (8 + ridged(x * 0.05 + 9, z * 0.05) * 26);
  return tongue + sides + behind;
}

function Terrain() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(120, 110, 150, 138);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, -15);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const snow = new THREE.Color('#8ea6b8');
    const ice = new THREE.Color('#29455c');
    const rock = new THREE.Color('#0d1218');
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = terrainHeight(x, z);
      pos.setY(i, y);
      // Fels an steilen Grat-Partien, Schnee oben, Eis auf der Zunge
      const rockiness =
        smoothstep(0.55, 0.75, fbm(x * 0.3, z * 0.3 + 7)) * smoothstep(3, 9, y);
      c.copy(ice).lerp(snow, smoothstep(0.2, 6, y));
      c.lerp(rock, rockiness * 0.85);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.62}
        metalness={0.02}
        flatShading
        envMapIntensity={0.22}
      />
    </mesh>
  );
}

/* --------------------------------------------------------------- Eiswand */

type Shard = {
  geometry: THREE.ExtrudeGeometry;
  base: THREE.Vector3;
  dir: THREE.Vector3;
  spin: THREE.Vector3;
  delay: number;
};

const WALL = {width: 9, height: 5.6, cols: 7, rows: 5};

function buildShards(): Shard[] {
  const rand = seeded(7);
  const {width, height, cols, rows} = WALL;
  const pts: THREE.Vector2[][] = [];
  for (let r = 0; r <= rows; r++) {
    pts[r] = [];
    for (let c = 0; c <= cols; c++) {
      const edgeX = c === 0 || c === cols;
      const edgeY = r === 0 || r === rows;
      const jx = edgeX ? 0 : (rand() - 0.5) * (width / cols) * 0.7;
      const jy = edgeY ? 0 : (rand() - 0.5) * (height / rows) * 0.7;
      pts[r][c] = new THREE.Vector2(
        (c / cols - 0.5) * width + jx,
        (r / rows) * height + jy,
      );
    }
  }

  const shards: Shard[] = [];
  const addTriangle = (
    a: THREE.Vector2,
    b: THREE.Vector2,
    c: THREE.Vector2,
  ) => {
    const center = a.clone().add(b).add(c).divideScalar(3);
    const shape = new THREE.Shape([a, b, c].map((p) => p.clone().sub(center)));
    const depth = 0.55 + rand() * 0.7;
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.04,
      bevelSegments: 1,
    });
    geometry.translate(0, 0, -depth / 2);
    const dist =
      center
        .clone()
        .sub(new THREE.Vector2(0, height * 0.45))
        .length() /
      (width * 0.6);
    shards.push({
      geometry,
      base: new THREE.Vector3(center.x, center.y, (rand() - 0.5) * 0.35),
      dir: new THREE.Vector3(
        center.x * 0.55 + (rand() - 0.5),
        0.6 + rand() * 1.4,
        1.2 + rand() * 2.2,
      ),
      spin: new THREE.Vector3(
        rand() - 0.5,
        rand() - 0.5,
        rand() - 0.5,
      ).multiplyScalar(5),
      delay: Math.min(1, dist) * 0.55 + rand() * 0.12,
    });
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p00 = pts[r][c];
      const p10 = pts[r][c + 1];
      const p01 = pts[r + 1][c];
      const p11 = pts[r + 1][c + 1];
      if (rand() > 0.5) {
        addTriangle(p00, p10, p11);
        addTriangle(p00, p11, p01);
      } else {
        addTriangle(p00, p10, p01);
        addTriangle(p10, p11, p01);
      }
    }
  }
  return shards;
}

function IceWall({progress}: {progress: Progress}) {
  const p = useSmoothedProgress(progress);
  const shards = useMemo(buildShards, []);
  const refs = useRef<Array<THREE.Mesh | null>>([]);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#d6ecf7',
        transmission: 1,
        thickness: 1.1,
        roughness: 0.16,
        ior: 1.31,
        attenuationColor: new THREE.Color('#4f93ba'),
        attenuationDistance: 1.4,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
        envMapIntensity: 1.3,
      }),
    [],
  );

  useFrame(() => {
    const v = p.current;
    const crack = range(v, 0.3, 0.46);
    const burst = range(v, 0.42, 0.7);
    shards.forEach((shard, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const local = easeOut(range(burst * 1.6 - shard.delay, 0, 1));
      // Risse: Splitter rücken auseinander, das Glühen dringt durch die Fugen
      const gap = 1 - crack * 0.07;
      mesh.position.set(
        shard.base.x * (1 + crack * 0.025) + shard.dir.x * local * 4,
        shard.base.y + shard.dir.y * local * 2.4 - local * local * 7,
        shard.base.z + crack * 0.08 * Math.sin(i) + shard.dir.z * local * 5,
      );
      mesh.rotation.set(
        shard.spin.x * local,
        shard.spin.y * local,
        shard.spin.z * local + crack * 0.015 * Math.cos(i),
      );
      mesh.scale.setScalar(gap * (1 - local * 0.35));
      mesh.visible = local < 0.995;
    });
  });

  return (
    <group position={[0, -0.1, 0]}>
      {shards.map((shard, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          geometry={shard.geometry}
          material={material}
          position={shard.base}
        />
      ))}
    </group>
  );
}

/* ----------------------------------------------------------------- Glühen */

function radialTexture(inner: string, outer: string) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Glow({progress}: {progress: Progress}) {
  const p = useSmoothedProgress(progress);
  const plane = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const texture = useMemo(
    () => radialTexture('rgba(255,120,40,1)', 'rgba(255,90,31,0)'),
    [],
  );

  useFrame(({clock}) => {
    const v = p.current;
    const pulse = 0.85 + Math.sin(clock.elapsedTime * 2.2) * 0.15;
    const intensity =
      lerp(0.12, 0.35, range(v, 0, 0.3)) * pulse +
      range(v, 0.25, 0.5) * 1.1 -
      range(v, 0.62, 0.95) * 1.25;
    if (plane.current) {
      (plane.current.material as THREE.MeshBasicMaterial).opacity = Math.max(
        0,
        intensity,
      );
      plane.current.scale.setScalar(1 + range(v, 0.3, 0.6) * 0.45);
    }
    if (light.current) light.current.intensity = Math.max(0, intensity) * 55;
  });

  return (
    <group position={[0, 2.4, -1.1]}>
      <mesh ref={plane}>
        <planeGeometry args={[9, 7]} />
        <meshBasicMaterial
          map={texture}
          transparent
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight
        ref={light}
        color="#ff6a2a"
        distance={14}
        decay={2}
        position={[0, 0, 0.4]}
      />
    </group>
  );
}

/* ----------------------------------------------------------------- Signet */

function signetGeometry() {
  const toShape = (points: ReadonlyArray<readonly [number, number]>) =>
    new THREE.Shape(
      points.map(
        ([x, y]) => new THREE.Vector2((x - 487) / 380, -(y - 350) / 380),
      ),
    );
  const geo = new THREE.ExtrudeGeometry(
    [toShape(SIGNET_PEAK), toShape(SIGNET_BASE)],
    {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.035,
      bevelSegments: 4,
    },
  );
  geo.center();
  return geo;
}

function SignetModel({progress}: {progress: Progress}) {
  const p = useSmoothedProgress(progress);
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.MeshPhysicalMaterial>(null);
  const geometry = useMemo(signetGeometry, []);

  useFrame(({clock}) => {
    const v = p.current;
    const rise = easeInOut(range(v, 0.56, 0.86));
    const settled = range(v, 0.86, 1);
    const t = clock.elapsedTime;
    if (group.current) {
      group.current.position.set(
        0,
        lerp(1.25, 2.55, rise) + Math.sin(t * 0.9) * 0.04 * settled,
        lerp(-0.7, 1.1, rise),
      );
      group.current.rotation.set(
        lerp(0.55, 0, rise),
        lerp(-1.25, 0, rise) + Math.sin(t * 0.5) * 0.05 * settled,
        0,
      );
      group.current.scale.setScalar(lerp(0.9, 1.3, rise));
    }
    if (material.current)
      material.current.emissiveIntensity =
        0.12 + range(v, 0.3, 0.6) * 0.45 - settled * 0.25;
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          ref={material}
          color="#ff5a1f"
          emissive="#ff3d00"
          roughness={0.3}
          metalness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.12}
          envMapIntensity={1.4}
        />
      </mesh>
      <Droplets progress={p} />
    </group>
  );
}

/** Eis-Partikel, die beim Aufsteigen vom Signet abperlen. */
function Droplets({progress}: {progress: Progress}) {
  const COUNT = 46;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(() => {
    const rand = seeded(21);
    return Array.from({length: COUNT}, () => ({
      x: (rand() - 0.5) * 2.2,
      z: (rand() - 0.5) * 0.4,
      offset: rand(),
      speed: 0.35 + rand() * 0.5,
      size: 0.02 + rand() * 0.035,
    }));
  }, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({clock}) => {
    if (!mesh.current) return;
    const v = progress.current;
    const strength = range(v, 0.58, 0.7) * (1 - range(v, 0.9, 1));
    seeds.forEach((s, i) => {
      const life = (clock.elapsedTime * s.speed + s.offset) % 1;
      dummy.position.set(s.x * (1 - life * 0.2), 0.2 - life * 2.6, s.z);
      dummy.scale.setScalar(s.size * strength * (1 - life));
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color="#e8f4fa"
        roughness={0.05}
        metalness={0.1}
        envMapIntensity={2}
      />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------- Schneedrift */

function Snow() {
  const COUNT = 2200;
  const points = useRef<THREE.Points>(null);
  const {positions, speeds} = useMemo(() => {
    const rand = seeded(3);
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (rand() - 0.5) * 60;
      positions[i * 3 + 1] = rand() * 12;
      positions[i * 3 + 2] = -12 + rand() * 40;
      speeds[i] = 0.6 + rand() * 1.6;
    }
    return {positions, speeds};
  }, []);
  const sprite = useMemo(
    () => radialTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)'),
    [],
  );

  useFrame(({clock}, delta) => {
    const attr = points.current?.geometry.attributes.position as
      THREE.BufferAttribute | undefined;
    if (!attr) return;
    const arr = attr.array as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] += speeds[i] * delta * 1.6;
      arr[i * 3 + 1] += Math.sin(t * 0.8 + i) * delta * 0.15 - delta * 0.25;
      if (arr[i * 3] > 30) arr[i * 3] = -30;
      if (arr[i * 3 + 1] < 0) arr[i * 3 + 1] = 12;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        size={0.07}
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
        color="#e8f4fa"
      />
    </points>
  );
}
