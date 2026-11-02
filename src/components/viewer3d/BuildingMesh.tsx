import React from 'react';
import '@react-three/fiber';
import { HousePlan } from '@/types/plan';

export interface BuildingMeshProps {
  plan: HousePlan;
  wireframe?: boolean;
}

export const BuildingMesh: React.FC<BuildingMeshProps> = ({ plan, wireframe = false }) => {
  const wallHeight = 2.8; // meters per floor
  const floorHeightOffset = 3.0;

  return (
    <group position={[-plan.plot.width / 4, 0, -plan.plot.length / 4]}>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[plan.plot.width / 4, -0.05, plan.plot.length / 4]}>
        <planeGeometry args={[plan.plot.width + 10, plan.plot.length + 10]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.9} />
      </mesh>

      {/* Floors extrusion */}
      {plan.floors.map((floor, fIdx) => (
        <group key={floor.level} position={[0, fIdx * floorHeightOffset, 0]}>
          {floor.rooms.map((room) => {
            const rx = (room.x + room.width / 2) / 2;
            const rz = (room.y + room.length / 2) / 2;
            const rw = room.width / 2;
            const rl = room.length / 2;

            return (
              <group key={room.id} position={[rx, 0, rz]}>
                {/* Floor slab */}
                <mesh position={[0, 0.05, 0]}>
                  <boxGeometry args={[rw, 0.1, rl]} />
                  <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
                </mesh>

                {/* Outer Room Walls */}
                <mesh position={[0, wallHeight / 2, 0]}>
                  <boxGeometry args={[rw, wallHeight, rl]} />
                  <meshStandardMaterial
                    color={fIdx === 0 ? '#f1f5f9' : '#e2e8f0'}
                    roughness={0.6}
                    wireframe={wireframe}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      ))}

      {/* Roof Parapet */}
      <mesh
        position={[
          plan.plot.width / 4,
          plan.floors.length * floorHeightOffset + 0.3,
          plan.plot.length / 4,
        ]}
      >
        <boxGeometry args={[plan.plot.width / 2, 0.6, plan.plot.length / 2]} />
        <meshStandardMaterial color="#334155" roughness={0.5} wireframe={wireframe} />
      </mesh>
    </group>
  );
};
