import React from 'react';
import '@react-three/fiber';
import { HousePlan, Room } from '@/types/plan';

export interface BuildingMeshProps {
  plan: HousePlan;
  wireframe?: boolean;
}

export const BuildingMesh: React.FC<BuildingMeshProps> = ({ plan, wireframe = false }) => {
  const wallHeight = 2.4; // architectural height in 3D units
  const floorHeightOffset = 2.8;
  const wallThick = 0.14; // wall thickness

  // Room floor color coding
  const getRoomColor = (name: string, isExterior = false) => {
    if (isExterior) return '#94a3b8';
    const lower = name.toLowerCase();
    if (lower.includes('bed') || lower.includes('master')) return '#e2d5c3'; // warm parquet wood
    if (lower.includes('living') || lower.includes('drawing') || lower.includes('foyer')) return '#f8fafc'; // polished marble
    if (lower.includes('kitchen')) return '#fed7aa'; // amber tile
    if (lower.includes('bath') || lower.includes('toilet')) return '#bae6fd'; // sky blue ceramic
    if (lower.includes('pooja')) return '#fef08a'; // gold / makrana marble
    if (lower.includes('balcony') || lower.includes('terrace')) return '#cbd5e1'; // stone pavers
    if (lower.includes('porch') || lower.includes('parking')) return '#64748b'; // paver blocks
    return '#f1f5f9';
  };

  return (
    <group position={[-plan.plot.width / 4, 0, -plan.plot.length / 4]}>
      {/* Ground plane (Lush site lawn & site boundaries) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[plan.plot.width / 4, -0.06, plan.plot.length / 4]}>
        <planeGeometry args={[plan.plot.width / 2 + 12, plan.plot.length / 2 + 12]} />
        <meshStandardMaterial color="#86efac" roughness={0.9} />
      </mesh>

      {/* Driveway / Paver path in front setback */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[plan.plot.width / 4, -0.04, plan.plot.length / 8]}>
        <planeGeometry args={[plan.plot.width / 2, plan.plot.length / 4]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>

      {/* Structural RCC Columns */}
      {plan.structural?.columns?.map((col) => {
        const cx = col.x / 2;
        const cz = col.y / 2;
        const totalHeight = plan.floors.length * floorHeightOffset;
        return (
          <mesh key={col.id} position={[cx, totalHeight / 2, cz]}>
            <boxGeometry args={[0.3, totalHeight, 0.3]} />
            <meshStandardMaterial color="#334155" roughness={0.5} wireframe={wireframe} />
          </mesh>
        );
      })}

      {/* Floors Extrusion with hollow architectural rooms, floors & glass windows */}
      {plan.floors.map((floor, fIdx) => (
        <group key={floor.level} position={[0, fIdx * floorHeightOffset, 0]}>
          {floor.rooms.map((room: Room) => {
            const rx = (room.x + room.width / 2) / 2;
            const rz = (room.y + room.length / 2) / 2;
            const rw = Math.max(room.width / 2, 0.4);
            const rl = Math.max(room.length / 2, 0.4);
            const isBalcony = room.name.toLowerCase().includes('balcony') || room.name.toLowerCase().includes('terrace');
            const floorColor = getRoomColor(room.name, isBalcony);

            return (
              <group key={room.id} position={[rx, 0, rz]}>
                {/* Room Floor Slab with finish material */}
                <mesh position={[0, 0.04, 0]}>
                  <boxGeometry args={[rw, 0.08, rl]} />
                  <meshStandardMaterial color={floorColor} roughness={0.6} />
                </mesh>

                {/* Hollow Architectural Walls (Dollhouse BIM view) */}
                {!isBalcony ? (
                  <>
                    {/* Left Wall */}
                    <mesh position={[-rw / 2 + wallThick / 2, wallHeight / 2, 0]}>
                      <boxGeometry args={[wallThick, wallHeight, rl]} />
                      <meshStandardMaterial color="#f1f5f9" roughness={0.5} wireframe={wireframe} />
                    </mesh>

                    {/* Right Wall */}
                    <mesh position={[rw / 2 - wallThick / 2, wallHeight / 2, 0]}>
                      <boxGeometry args={[wallThick, wallHeight, rl]} />
                      <meshStandardMaterial color="#f1f5f9" roughness={0.5} wireframe={wireframe} />
                    </mesh>

                    {/* Top Wall (with window cutout) */}
                    <mesh position={[0, wallHeight / 2, -rl / 2 + wallThick / 2]}>
                      <boxGeometry args={[Math.max(rw - wallThick * 2, 0.2), wallHeight, wallThick]} />
                      <meshStandardMaterial color="#f8fafc" roughness={0.5} wireframe={wireframe} />
                    </mesh>

                    {/* Bottom Wall */}
                    <mesh position={[0, wallHeight / 2, rl / 2 - wallThick / 2]}>
                      <boxGeometry args={[Math.max(rw - wallThick * 2, 0.2), wallHeight, wallThick]} />
                      <meshStandardMaterial color="#f8fafc" roughness={0.5} wireframe={wireframe} />
                    </mesh>

                    {/* Translucent Window Glazing */}
                    {room.windows && room.windows.length > 0 && (
                      <mesh position={[0, wallHeight * 0.55, -rl / 2 + wallThick / 2]}>
                        <boxGeometry args={[Math.max(rw * 0.5, 0.4), wallHeight * 0.45, 0.04]} />
                        <meshStandardMaterial
                          color="#38bdf8"
                          transparent
                          opacity={0.65}
                          roughness={0.1}
                          metalness={0.2}
                        />
                      </mesh>
                    )}
                  </>
                ) : (
                  /* Balcony Railing */
                  <mesh position={[0, 0.5, -rl / 2 + 0.05]}>
                    <boxGeometry args={[rw, 0.9, 0.08]} />
                    <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} />
                  </mesh>
                )}
              </group>
            );
          })}
        </group>
      ))}

      {/* Roof Parapet & Terrace Crown */}
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
