"use client";

import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * --- SIMULATION CONFIGURATION ---
 * Change these values to adjust the appearance of the particle swarm.
 * Since the UI is removed, these constants now control the permanent look.
 */
const SIMULATION_CONFIG = {
  radius: { label: "Radius", min: 10, max: 200, value: 145 },
  spin: { label: "Spin Speed", min: 0, max: 5, value: 0.35 },
  chaos: { label: "Wave Strength", min: 0, max: 50, value: 0.22 },
  density: { label: "Layer Density", min: 1, max: 10, value: 1.5 },
};

// --- PERFORMANCE OPTIMIZED ENGINE ---

function SwarmEngine({ count = 18000, controlState }) {
  const meshRef = useRef();
  const mouse = useRef({ x: 0, y: 0 });

  // Reuse objects for ZERO GARBAGE COLLECTION
  const dummyTarget = useMemo(() => new THREE.Object3D(), []);
  const dummyColor = useMemo(() => new THREE.Color(), []);
  const timer = useMemo(() => new THREE.Timer(), []);

  useFrame((state) => {
    if (!meshRef.current || Object.keys(controlState).length === 0) return;

    timer.update(performance.now());
    const time = timer.getElapsed();

    // Access control values (pre-dereferenced for speed)
    const rBase = controlState.radius.value;
    const sBase = controlState.spin.value;
    const cBase = controlState.chaos.value;
    const dBase = controlState.density.value;

    // Smooth mouse follow
    mouse.current.x += (state.mouse.x - mouse.current.x) * 0.05;
    mouse.current.y += (state.mouse.y - mouse.current.y) * 0.05;

    for (let i = 0; i < count; i++) {
      // Mathematical structure logic
      const layers = 6;
      const pPerLayer = count / layers;
      const lIdx = (i / pPerLayer) | 0;
      const innerIdx = i % pPerLayer;
      const progress = innerIdx / pPerLayer;

      // Spiral calculations
      const angle = progress * Math.PI * 2 * dBase + time * sBase + lIdx * 0.8;
      const height = (progress - 0.5) * 200;
      const r =
        rBase +
        Math.sin(height * 0.03 + time * 1.5) * cBase +
        Math.sin(angle * 4 + time) * 5;

      // Interactive mouse offset (stronger at the center)
      const distToCenter = 1 - Math.abs(progress - 0.5) * 2;
      const mx = mouse.current.x * 40 * distToCenter;
      const my = mouse.current.y * 40 * distToCenter;

      const x = Math.cos(angle) * r + mx;
      const z = Math.sin(angle) * r + my;
      const y = height + Math.sin(time * 0.7 + lIdx) * 12;

      // Apply to instanced mesh
      dummyTarget.position.set(x, y, z);
      // Pulsing scale
      const s = 0.4 + Math.sin(i * 0.05 + time * 2) * 0.2;
      dummyTarget.scale.set(s, s, s);
      dummyTarget.updateMatrix();
      meshRef.current.setMatrixAt(i, dummyTarget.matrix);

      // Color logic - Cycle through brand colors (Purple -> Cyan -> Pink)
      const hue = (0.7 + progress * 0.3 + Math.sin(time * 0.2) * 0.1) % 1.0;
      dummyColor.setHSL(hue, 0.8, 0.6);
      meshRef.current.setColorAt(i, dummyColor);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[0.25, 6, 6]} />
      <meshBasicMaterial
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

// --- MAIN EXPORT ---

export default function InteractiveSwarm({ count = 20000 }) {
  // We keep the state but remove the UI to change it.
  // The user can still change the initial values in SIMULATION_CONFIG above.
  const [controls] = useState(SIMULATION_CONFIG);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 280], fov: 40 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]} // Support high-DPI displays
        style={{ background: "transparent" }}
      >
        <SwarmEngine count={count} controlState={controls} />
      </Canvas>
    </div>
  );
}
