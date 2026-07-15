import { Sphere } from "@react-three/drei";

export default function Globe() {
  return (
    <Sphere args={[1.4, 64, 64]}>
      <meshStandardMaterial
        color="#12395B"
        metalness={0.6}
        roughness={0.2}
      />
    </Sphere>
  );
}