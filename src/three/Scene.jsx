import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Globe from "./Globe";

export default function Scene() {
  return (
    <Canvas
      camera={{
        position: [0, 0, 6],
        fov: 45,
      }}
    >
      <ambientLight intensity={1.5} />

      <directionalLight
        intensity={3}
        position={[5, 5, 5]}
      />

      <Environment preset="city" />

      <Globe />
    </Canvas>
  );
}