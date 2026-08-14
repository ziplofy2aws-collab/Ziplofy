import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import * as THREE from 'three';
import {
  LIVE_GLOBE_DEMO_MARKERS,
  LIVE_GLOBE_LAND_POINTS,
  latLngToCartesian,
} from './liveGlobeLandPoints';

const GLOBE_RADIUS = 1.55;
/** Closest zoom (zoom in). */
const MIN_DISTANCE = 2.2;
/** Farthest zoom (default / minimum zoom). */
const MAX_DISTANCE = 4.6;
const DEFAULT_FOV = 40;

const LAND_COLOR = '#4ec4d4';
const OCEAN_COLOR = '#eef5f7';
const ATMOSPHERE_COLOR = '#9fd8e2';
const ORDER_COLOR = '#8a3ffc';
const VISITOR_COLOR = '#00a0ac';

/** Default eye offset from origin (Europe/Africa lean). */
const HOME_EYE_OFFSET = new THREE.Vector3(0.12, 0.55, 1).normalize();

export type LiveViewGlobeHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
};

type OrbitControlsApi = {
  object: THREE.Camera;
  target: THREE.Vector3;
  update: () => void;
};

function createHexGeometry(size: number): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  positions.push(0, 0, 0);
  normals.push(0, 0, 1);

  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    positions.push(Math.cos(angle) * size, Math.sin(angle) * size, 0);
    normals.push(0, 0, 1);
  }

  for (let i = 1; i <= 6; i += 1) {
    indices.push(0, i, i === 6 ? 1 : i + 1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  return geometry;
}

function LandHexMesh() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => createHexGeometry(0.0115), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: LAND_COLOR,
        roughness: 0.62,
        metalness: 0,
        emissive: '#2aa8b8',
        emissiveIntensity: 0.22,
        flatShading: true,
      }),
    [],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 0, 1);
    const normal = new THREE.Vector3();

    LIVE_GLOBE_LAND_POINTS.forEach((point, index) => {
      const [x, y, z] = latLngToCartesian(point.lat, point.lng, GLOBE_RADIUS + 0.003);
      normal.set(x, y, z).normalize();
      dummy.position.set(x, y, z);
      dummy.quaternion.setFromUnitVectors(up, normal);
      const s = 0.92 + ((index * 17) % 7) * 0.012;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, []);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, LIVE_GLOBE_LAND_POINTS.length]}
      frustumCulled={false}
    />
  );
}

function Marker({
  lat,
  lng,
  color,
  size = 0.035,
  pulse = false,
}: {
  lat: number;
  lng: number;
  color: string;
  size?: number;
  pulse?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const [x, y, z] = useMemo(
    () => latLngToCartesian(lat, lng, GLOBE_RADIUS + 0.02),
    [lat, lng],
  );

  useFrame(({ clock }) => {
    if (!pulse || !pulseRef.current) return;
    const t = (Math.sin(clock.elapsedTime * 2.2) + 1) / 2;
    const s = 1 + t * 1.4;
    pulseRef.current.scale.setScalar(s);
    const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.35 - t * 0.28;
  });

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const normal = new THREE.Vector3(x, y, z).normalize();
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  }, [x, y, z]);

  return (
    <group ref={groupRef} position={[x, y, z]}>
      {pulse ? (
        <mesh ref={pulseRef}>
          <circleGeometry args={[size * 1.6, 24]} />
          <meshBasicMaterial color={color} transparent opacity={0.25} depthWrite={false} />
        </mesh>
      ) : null}
      <mesh>
        <circleGeometry args={[size, 24]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function Atmosphere() {
  return (
    <>
      <mesh scale={1.045}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshBasicMaterial
          color={ATMOSPHERE_COLOR}
          transparent
          opacity={0.22}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={1.09}>
        <sphereGeometry args={[GLOBE_RADIUS, 48, 48]} />
        <meshBasicMaterial
          color="#c5e8ee"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

function OceanSphere() {
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS, 96, 96]} />
      <meshStandardMaterial
        color={OCEAN_COLOR}
        roughness={0.92}
        metalness={0}
        emissive="#e4f1f4"
        emissiveIntensity={0.35}
      />
    </mesh>
  );
}

function GlobeScene({
  controlsRef,
}: {
  controlsRef: React.MutableRefObject<OrbitControlsApi | null>;
}) {
  const { camera } = useThree();

  useLayoutEffect(() => {
    const eye = HOME_EYE_OFFSET.clone().multiplyScalar(MAX_DISTANCE);
    camera.position.copy(eye);
    camera.lookAt(0, 0, 0);
    const controls = controlsRef.current;
    if (controls) {
      controls.target.set(0, 0, 0);
      controls.update();
    }
  }, [camera, controlsRef]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const controls = controlsRef.current;
      if (!controls) return;
      const eye = HOME_EYE_OFFSET.clone().multiplyScalar(MAX_DISTANCE);
      camera.position.copy(eye);
      controls.target.set(0, 0, 0);
      controls.update();
    }, 0);
    return () => window.clearTimeout(id);
  }, [camera, controlsRef]);

  return (
    <>
      <ambientLight intensity={1.05} />
      <directionalLight position={[5, 4, 3]} intensity={0.55} color="#ffffff" />
      <directionalLight position={[-4, -1, -3]} intensity={0.2} color="#b7dde3" />
      <hemisphereLight args={['#f4fbfc', '#d7e8ec', 0.45]} />

      <group rotation={[0.08, -0.35, 0.04]}>
        <Atmosphere />
        <OceanSphere />
        <LandHexMesh />
        <Marker
          lat={LIVE_GLOBE_DEMO_MARKERS.order.lat}
          lng={LIVE_GLOBE_DEMO_MARKERS.order.lng}
          color={ORDER_COLOR}
          size={0.038}
          pulse
        />
        <Marker
          lat={LIVE_GLOBE_DEMO_MARKERS.visitor.lat}
          lng={LIVE_GLOBE_DEMO_MARKERS.visitor.lng}
          color={VISITOR_COLOR}
          size={0.03}
        />
      </group>

      <OrbitControls
        ref={controlsRef as never}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        zoomSpeed={0.6}
        minDistance={MIN_DISTANCE}
        maxDistance={MAX_DISTANCE}
        minPolarAngle={0.28}
        maxPolarAngle={Math.PI - 0.28}
        target={[0, 0, 0]}
        autoRotate
        autoRotateSpeed={0.35}
      />
    </>
  );
}

/**
 * Keep WebGL viewport in lockstep with CSS layout while the left panel
 * width animates (ResizeObserver alone lags a frame or more).
 */
function SyncViewportToContainer() {
  const { gl, setSize, size } = useThree();
  const last = useRef({ w: 0, h: 0 });

  useFrame(() => {
    const parent = gl.domElement.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (w < 2 || h < 2) return;
    if (w === last.current.w && h === last.current.h) return;
    if (w === size.width && h === size.height) {
      last.current = { w, h };
      return;
    }
    last.current = { w, h };
    setSize(w, h);
  });

  return null;
}

/**
 * Globe for the Live View right pane (55% section). Centers in its own container.
 * Default camera distance = minimum zoom (maxDistance).
 */
export const LiveViewGlobe = forwardRef<LiveViewGlobeHandle>(function LiveViewGlobe(_, ref) {
  const controlsRef = useRef<OrbitControlsApi | null>(null);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      const controls = controlsRef.current;
      if (!controls) return;
      const cam = controls.object;
      const direction = new THREE.Vector3()
        .subVectors(cam.position, controls.target)
        .normalize();
      const distance = cam.position.distanceTo(controls.target);
      const next = Math.max(MIN_DISTANCE, distance * 0.82);
      cam.position.copy(controls.target).addScaledVector(direction, next);
      controls.update();
    },
    zoomOut: () => {
      const controls = controlsRef.current;
      if (!controls) return;
      const cam = controls.object;
      const direction = new THREE.Vector3()
        .subVectors(cam.position, controls.target)
        .normalize();
      const distance = cam.position.distanceTo(controls.target);
      const next = Math.min(MAX_DISTANCE, distance * 1.22);
      cam.position.copy(controls.target).addScaledVector(direction, next);
      controls.update();
    },
  }));

  return (
    <div className="relative h-full min-h-105 w-full cursor-grab active:cursor-grabbing">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 55% 50% at 50% 46%, rgba(78, 196, 212, 0.16) 0%, rgba(241, 241, 241, 0.18) 42%, transparent 70%)',
        }}
      />
      <Canvas
        className="h-full w-full touch-none"
        dpr={[1, 1.75]}
        resize={{ debounce: 0, scroll: false }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{
          fov: DEFAULT_FOV,
          near: 0.1,
          far: 40,
          position: [
            HOME_EYE_OFFSET.x * MAX_DISTANCE,
            HOME_EYE_OFFSET.y * MAX_DISTANCE,
            HOME_EYE_OFFSET.z * MAX_DISTANCE,
          ],
        }}
        style={{ background: 'transparent' }}
      >
        <SyncViewportToContainer />
        <GlobeScene controlsRef={controlsRef} />
      </Canvas>
    </div>
  );
});
