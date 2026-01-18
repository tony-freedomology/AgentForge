import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Bloom, EffectComposer } from '@react-three/postprocessing';

export function Environment() {
    const gridTexture = useTexture('/assets/textures/grid.png');

    // Set texture to repeat
    gridTexture.wrapS = gridTexture.wrapT = THREE.RepeatWrapping;
    gridTexture.repeat.set(100, 100);
    gridTexture.anisotropy = 16;
    gridTexture.colorSpace = THREE.SRGBColorSpace;

    return (
        <group>
            {/* Background/Void color */}
            <color attach="background" args={['#050510']} />

            {/* Fog for depth */}
            <fog attach="fog" args={['#050510', 40, 120]} />

            {/* Infinite Grid Plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <planeGeometry args={[400, 400]} />
                <meshStandardMaterial
                    map={gridTexture}
                    roughness={0.2}
                    metalness={0.8}
                    emissive="#001133"
                    emissiveIntensity={0.2}
                />
            </mesh>

            {/* Ambient Light */}
            <ambientLight intensity={0.2} />

            {/* Main Directional Light (Simulating a cyber sun or moon) */}
            <directionalLight
                position={[20, 30, 20]}
                intensity={2}
                color="#a5f3fc" // Light cyan
                castShadow
            />

            {/* Rim light for agents */}
            <pointLight position={[-10, 10, -10]} intensity={1} color="#c084fc" />

            {/* Post Processing */}
            <EffectComposer>
                <Bloom
                    luminanceThreshold={0.5}
                    luminanceSmoothing={0.9}
                    height={300}
                    intensity={0.4}
                />
            </EffectComposer>
        </group>
    );
}
