'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { BuildingMesh } from './BuildingMesh';
import { HousePlan } from '@/types/plan';

export interface BuildingCanvasProps {
  plan: HousePlan;
  wireframe?: boolean;
}

export const BuildingCanvas: React.FC<BuildingCanvasProps> = ({ plan, wireframe = false }) => {
  return (
    <div className="w-full h-full relative" data-testid="building-canvas-container">
      <Canvas
        camera={{ position: [20, 25, 25], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 20, 15]} intensity={1.2} castShadow />
        <OrbitControls enableDamping />
        <BuildingMesh plan={plan} wireframe={wireframe} />
      </Canvas>
    </div>
  );
};
