import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AICoreProps {
  state?: 'idle' | 'active' | 'awakening';
  className?: string;
}

export const AICore: React.FC<AICoreProps> = ({ state = 'idle', className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particle Sphere (Neural Lattice)
    const particleCount = 1800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const radius = 2.1;
    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      // Radiant Amber to Warm Honey-Gold dual-tone gradient particles
      const ratio = (y + radius) / (2 * radius);
      // Bright Honey Amber (#fbbf24: 0.98, 0.75, 0.14) -> Deep Radiant Amber (#d97706: 0.85, 0.47, 0.02)
      colors[i * 3] = 0.98 - 0.13 * ratio;
      colors[i * 3 + 1] = 0.75 - 0.28 * ratio;
      colors[i * 3 + 2] = 0.05 + 0.10 * (1 - ratio);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.048,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Central Energy Core (Pulsing Amber Nucleus)
    const coreGeo = new THREE.IcosahedronGeometry(0.7, 3);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Inner Glowing Solid Orb (Golden Amber)
    const nucleusGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.75,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    scene.add(nucleusMesh);

    // Orbital Gyroscopic Rings (Amber & Honey Tones)
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.012, 16, 100), ringMat1);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xd97706,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.01, 16, 100), ringMat2);
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    const ringMat3 = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.008, 16, 100), ringMat3);
    ring3.rotation.z = Math.PI / 6;
    scene.add(ring3);

    // Synaptic Network Wireframes (Warm Graphite-Amber)
    const linesGeo = new THREE.IcosahedronGeometry(1.5, 2);
    const linesMat = new THREE.MeshBasicMaterial({
      color: 0xb45309,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const linesMesh = new THREE.Mesh(linesGeo, linesMat);
    scene.add(linesMesh);

    // Track mouse over window
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      mouseRef.current.targetX = (clientX / rect.width - 0.5) * 2;
      mouseRef.current.targetY = -(clientY / rect.height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Mouse damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // State intensity multipliers
      let speedMult = 1.0;
      let pulseAmp = 0.08;

      if (currentState === 'active') {
        speedMult = 1.8;
        pulseAmp = 0.15;
      } else if (currentState === 'awakening') {
        speedMult = 3.2;
        pulseAmp = 0.35;
      }

      // Smooth camera parallax
      camera.position.x = mouseRef.current.x * 0.8;
      camera.position.y = mouseRef.current.y * 0.8;
      camera.lookAt(0, 0, 0);

      // Core rotation with subtle mouse tilt
      particles.rotation.y = elapsedTime * 0.15 * speedMult + mouseRef.current.x * 0.3;
      particles.rotation.x = elapsedTime * 0.08 * speedMult + mouseRef.current.y * 0.2;

      ring1.rotation.z = elapsedTime * 0.25 * speedMult;
      ring1.rotation.x = Math.PI / 3 + mouseRef.current.y * 0.2;

      ring2.rotation.y = elapsedTime * 0.2 * speedMult;
      ring2.rotation.z = mouseRef.current.x * 0.2;

      ring3.rotation.x = -elapsedTime * 0.18 * speedMult;

      coreMesh.rotation.y = -elapsedTime * 0.4 * speedMult;
      coreMesh.rotation.z = elapsedTime * 0.2;

      linesMesh.rotation.y = elapsedTime * 0.1 * speedMult;

      // Nucleus breathing
      const pulse = 1.0 + Math.sin(elapsedTime * 3 * speedMult) * pulseAmp;
      nucleusMesh.scale.set(pulse, pulse, pulse);

      // Particle Displacement Wave
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i += 3) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        const wave = Math.sin(elapsedTime * 2.5 * speedMult + ox * 1.5 + oy * 1.5) * (0.04 + pulseAmp * 0.1);
        const scale = 1.0 + wave;

        posAttr.setXYZ(i, ox * scale, oy * scale, oz * scale);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      ring1.geometry.dispose();
      ringMat1.dispose();
      ring2.geometry.dispose();
      ringMat2.dispose();
      ring3.geometry.dispose();
      ringMat3.dispose();
      linesGeo.dispose();
      linesMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full cursor-grab active:cursor-grabbing select-none ${className}`}
    />
  );
};
