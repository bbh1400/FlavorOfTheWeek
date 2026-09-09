import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Table } from "./scenes/Table";
import { palette } from "@potluck/shared";

export default function App() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 6, 9], fov: 45 }}
      style={{ background: palette.background }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[5, 8, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <Table />
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={16}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}
