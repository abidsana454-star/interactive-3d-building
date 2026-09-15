import { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const HIGHLIGHT_COLOR = new THREE.Color(0x4da3ff);

export default function BuildingModel({ autoRotate, hoverZone, onHover, onSectionClick }) {
  const { scene } = useGLTF('/models/building.glb');

  // groupRef is the OUTER pivot — this is what actually rotates,
  // and its origin is guaranteed to be the building's true visual
  // center. innerRef holds the raw model, offset so its bounding-box
  // center sits exactly at the group's origin. Rotating the group
  // (instead of the raw model) fixes the "wobbles off-center" bug,
  // since the raw model's own internal pivot is wherever the CAD
  // export happened to put it — not necessarily its visual center.
  const groupRef = useRef();
  const innerRef = useRef();
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls);

  const meshZonesRef = useRef([]);
  const currentZoneRef = useRef(null);
  const boundsRef = useRef(null);

  const getZone = (x, y, z) => {
    const b = boundsRef.current;
    if (!b) return null;

    if (x > b.minX + b.width * 0.65) {
      return 'RIGHT';
    }

    const relY = (y - b.minY) / b.height;
    if (relY < 0.34) return 'GROUND';
    if (relY < 0.67) return 'FIRST';
    return 'SECOND';
  };

  useEffect(() => {
    if (!innerRef.current) return;

    const box = new THREE.Box3().setFromObject(innerRef.current);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Offset the inner model so its bbox center lands on the
    // group's local origin (0,0,0) — and sits on the ground plane.
    innerRef.current.position.set(-center.x, -box.min.y, -center.z);

    const box2 = new THREE.Box3().setFromObject(innerRef.current);
    boundsRef.current = {
      minX: box2.min.x,
      minY: box2.min.y,
      width: box2.max.x - box2.min.x,
      height: box2.max.y - box2.min.y,
    };

    const zones = [];
    innerRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.userData.originalEmissive = child.material.emissive
          ? child.material.emissive.clone()
          : new THREE.Color(0x000000);

        const meshBox = new THREE.Box3().setFromObject(child);
        const meshCenter = meshBox.getCenter(new THREE.Vector3());
        const zone = getZone(meshCenter.x, meshCenter.y, meshCenter.z);
        zones.push({ mesh: child, zone });
      }
    });
    meshZonesRef.current = zones;

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const distance = maxDim * 0.95;

    camera.position.set(distance * 0.9, distance * 0.55, distance * 0.9);
    camera.near = maxDim / 100;
    camera.far = maxDim * 100;
    camera.updateProjectionMatrix();
    camera.lookAt(0, size.y * 0.4, 0);

    if (controls) {
      controls.target.set(0, size.y * 0.4, 0);
      controls.minDistance = maxDim * 0.4;
      controls.maxDistance = maxDim * 2.5;
      controls.update();
    }
  }, [scene, camera, controls]);

  const applyHighlight = (zone) => {
    if (currentZoneRef.current === zone) return;
    currentZoneRef.current = zone;

    meshZonesRef.current.forEach(({ mesh, zone: meshZone }) => {
      if (!mesh.material.emissive) return;
      if (meshZone === zone) {
        mesh.material.emissive.copy(HIGHLIGHT_COLOR);
        mesh.material.emissiveIntensity = 0.5;
      } else {
        mesh.material.emissive.copy(mesh.userData.originalEmissive);
        mesh.material.emissiveIntensity = 1;
      }
    });
  };

  useEffect(() => {
    applyHighlight(hoverZone || null);
  }, [hoverZone]);

  // Rotate the OUTER group only — never the inner model directly.
  // OrbitControls (manual drag) orbits the camera around the group's
  // origin independently, so both auto-rotate and manual drag now
  // pivot around the same correct center.
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  const handlePointerMove = (e) => {
    e.stopPropagation();
    const zone = getZone(e.point.x, e.point.y, e.point.z);
    applyHighlight(zone);
    onHover(zone, e.nativeEvent.clientX, e.nativeEvent.clientY);
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    applyHighlight(null);
    onHover(null);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    const zone = getZone(e.point.x, e.point.y, e.point.z);
    onSectionClick(zone);
  };

  return (
    <group ref={groupRef}>
      <primitive
        ref={innerRef}
        object={scene}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />
    </group>
  );
}
