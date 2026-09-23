import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ArrowRight, Cpu } from 'lucide-react';

interface CinematicIntroProps {
  onComplete: () => void;
  isInitialMount?: boolean;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Phase & Telemetry tracking state for HUD display
  const [currentPhase, setCurrentPhase] = useState<string>('PHASE 01 // THE VOID');
  const [phaseNumber, setPhaseNumber] = useState<string>('01/08');
  const [isSkipped, setIsSkipped] = useState(false);
  const [showTypography, setShowTypography] = useState(false);
  const [showEnterPrompt, setShowEnterPrompt] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      onComplete();
    }
  }, [onComplete]);

  // Handle Skip
  const handleSkip = useCallback(() => {
    setIsSkipped(true);
    if (masterTimelineRef.current) {
      masterTimelineRef.current.kill();
    }
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.45,
      ease: 'power2.inOut',
      onComplete: () => {
        onComplete();
      },
    });
  }, [onComplete]);

  // Handle manual Enter Click from typography prompt
  const handleEnterSystem = useCallback(() => {
    handleSkip();
  }, [handleSkip]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    const PARTICLE_COUNT = isMobile ? 4200 : 13500;

    // 1. Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050605');
    scene.fog = new THREE.FogExp2('#050605', 0.0035);

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 1000);
    camera.position.set(0, 0, 175);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: !isMobile,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));

    // 2. Groups requested by specification
    const universeGroup = new THREE.Group();
    const galaxyGroup = new THREE.Group();
    const solarSystemGroup = new THREE.Group();
    const neuralGroup = new THREE.Group();
    const engineGroup = new THREE.Group();
    const coreGroup = new THREE.Group();

    scene.add(universeGroup);
    scene.add(galaxyGroup);
    scene.add(solarSystemGroup);
    scene.add(neuralGroup);
    scene.add(engineGroup);
    scene.add(coreGroup);

    // Initial group visibility/opacity states
    solarSystemGroup.visible = false;
    neuralGroup.visible = false;
    engineGroup.visible = false;

    // -------------------------------------------------------------
    // 3. Central Seed Particle for Phase 1 (The Void)
    // -------------------------------------------------------------
    const seedGeo = new THREE.SphereGeometry(0.85, 16, 16);
    const seedMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#fdfcf8'),
      transparent: true,
      opacity: 0,
    });
    const voidSeedMesh = new THREE.Mesh(seedGeo, seedMat);
    voidSeedMesh.position.set(0, 0, 0);
    universeGroup.add(voidSeedMesh);

    // -------------------------------------------------------------
    // 4. Primary Morphing Particle Buffer (ShaderMaterial)
    // -------------------------------------------------------------
    const posVoid = new Float32Array(PARTICLE_COUNT * 3);
    const posGalaxy = new Float32Array(PARTICLE_COUNT * 3);
    const posSolar = new Float32Array(PARTICLE_COUNT * 3);
    const posNeural = new Float32Array(PARTICLE_COUNT * 3);
    const posEngine = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const randoms = new Float32Array(PARTICLE_COUNT);
    const types = new Float32Array(PARTICLE_COUNT);

    // Color definitions
    const colWarmWhite = new THREE.Color('#f4f1ea');
    const colSoftGrey = new THREE.Color('#9ca3af');
    const colGraphite = new THREE.Color('#374151');
    const colAmberEnergy = new THREE.Color('#f59e0b');
    const colAmberGlow = new THREE.Color('#fbbf24');
    const colMutedGreen = new THREE.Color('#387a52');

    // 32 Neural Cluster Hubs
    const neuralHubs: THREE.Vector3[] = [];
    for (let h = 0; h < 32; h++) {
      const u = (h / 32) * Math.PI * 2;
      const v = ((h % 8) / 8 - 0.5) * Math.PI;
      const r = 24 + (h % 3) * 10;
      neuralHubs.push(
        new THREE.Vector3(
          Math.cos(u) * Math.cos(v) * r,
          Math.sin(v) * r * 0.75,
          Math.sin(u) * Math.cos(v) * r
        )
      );
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const rnd = Math.random();
      randoms[i] = rnd;

      // Type tagging
      if (i === 0) types[i] = 4.0; // Central Seed
      else if (i < PARTICLE_COUNT * 0.08) types[i] = 1.0; // Planetary node / major hub
      else if (i < PARTICLE_COUNT * 0.28) types[i] = 2.0; // Data / asteroid
      else if (i < PARTICLE_COUNT * 0.65) types[i] = 3.0; // Engine arc / gear particle
      else types[i] = 0.0; // Deep cosmic dust

      // 1. VOID / UNIVERSE (Spherical expanse from origin)
      if (i === 0) {
        posVoid[i3] = 0;
        posVoid[i3 + 1] = 0;
        posVoid[i3 + 2] = 0;
      } else {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const radius = 10 + Math.pow(Math.random(), 0.7) * 220;
        posVoid[i3] = radius * Math.sin(phi) * Math.cos(theta);
        posVoid[i3 + 1] = (radius * Math.sin(phi) * Math.sin(theta)) * 0.65;
        posVoid[i3 + 2] = radius * Math.cos(phi);
      }

      // 2. GALAXY (Logarithmic 3-arm spiral)
      const armIndex = i % 3;
      const armAngle = (armIndex * (Math.PI * 2)) / 3;
      const galDist = Math.pow(Math.random(), 0.55) * 115 + 2.5;
      const galTheta = armAngle + galDist * 0.048 + (Math.random() - 0.5) * 0.38;
      posGalaxy[i3] = Math.cos(galTheta) * galDist;
      posGalaxy[i3 + 1] = (Math.random() - 0.5) * (18 / (1 + galDist * 0.04));
      posGalaxy[i3 + 2] = Math.sin(galTheta) * galDist;

      // 3. SOLAR SYSTEM (Concentric orbital planes, planet clumps, asteroid torus)
      if (i < PARTICLE_COUNT * 0.05) {
        // Central star nucleus
        const rStar = Math.random() * 4.5;
        const thetaS = Math.random() * Math.PI * 2;
        const phiS = Math.random() * Math.PI;
        posSolar[i3] = rStar * Math.sin(phiS) * Math.cos(thetaS);
        posSolar[i3 + 1] = rStar * Math.cos(phiS);
        posSolar[i3 + 2] = rStar * Math.sin(phiS) * Math.sin(thetaS);
      } else if (i < PARTICLE_COUNT * 0.65) {
        // Concentric orbital rings
        const ringRadii = [20, 32, 48, 64, 82, 104];
        const rIndex = i % ringRadii.length;
        const baseR = ringRadii[rIndex];
        const angleO = Math.random() * Math.PI * 2;
        const jitterR = (Math.random() - 0.5) * 1.8;
        posSolar[i3] = Math.cos(angleO) * (baseR + jitterR);
        posSolar[i3 + 1] = (Math.random() - 0.5) * 1.6;
        posSolar[i3 + 2] = Math.sin(angleO) * (baseR + jitterR);
      } else {
        // Asteroid belt torus
        const rAst = 50 + Math.random() * 12;
        const aAst = Math.random() * Math.PI * 2;
        posSolar[i3] = Math.cos(aAst) * rAst;
        posSolar[i3 + 1] = (Math.random() - 0.5) * 4.5;
        posSolar[i3 + 2] = Math.sin(aAst) * rAst;
      }

      // 4. NEURAL NETWORK (Clustering around 32 synaptic hubs & axon links)
      const hubIdx = i % neuralHubs.length;
      const targetHub = neuralHubs[hubIdx];
      const nextHub = neuralHubs[(hubIdx + 1 + (i % 3)) % neuralHubs.length];
      const linkT = Math.random();
      // Interpolate along network axon link with noise
      const axonX = THREE.MathUtils.lerp(targetHub.x, nextHub.x, linkT);
      const axonY = THREE.MathUtils.lerp(targetHub.y, nextHub.y, linkT);
      const axonZ = THREE.MathUtils.lerp(targetHub.z, nextHub.z, linkT);
      posNeural[i3] = axonX + (Math.random() - 0.5) * 4.2;
      posNeural[i3 + 1] = axonY + (Math.random() - 0.5) * 4.2;
      posNeural[i3 + 2] = axonZ + (Math.random() - 0.5) * 4.2;

      // 5. ENGINE ASSEMBLY (Precision multi-layer mechanical engine geometry)
      if (i < PARTICLE_COUNT * 0.12) {
        // Central Core Engine
        const rC = Math.random() * 4.0;
        const tC = Math.random() * Math.PI * 2;
        posEngine[i3] = Math.cos(tC) * rC;
        posEngine[i3 + 1] = (Math.random() - 0.5) * 3.0;
        posEngine[i3 + 2] = Math.sin(tC) * rC;
      } else if (i < PARTICLE_COUNT * 0.35) {
        // Ring 1: Inner Caliper Gear (r = 14)
        const a = (Math.floor(Math.random() * 24) / 24) * Math.PI * 2 + (Math.random() - 0.5) * 0.05;
        posEngine[i3] = Math.cos(a) * 14;
        posEngine[i3 + 1] = (Math.random() - 0.5) * 1.0;
        posEngine[i3 + 2] = Math.sin(a) * 14;
      } else if (i < PARTICLE_COUNT * 0.65) {
        // Ring 2: Mid Gimbal Ring (r = 34, tilted)
        const a = Math.random() * Math.PI * 2;
        const rMid = 34 + (i % 2 === 0 ? 0.8 : -0.8);
        posEngine[i3] = Math.cos(a) * rMid;
        posEngine[i3 + 1] = Math.sin(a * 2.0) * 2.5;
        posEngine[i3 + 2] = Math.sin(a) * rMid;
      } else if (i < PARTICLE_COUNT * 0.85) {
        // Ring 3: Outer Computational Ring with precision index teeth (r = 58)
        const a = Math.random() * Math.PI * 2;
        posEngine[i3] = Math.cos(a) * 58;
        posEngine[i3 + 1] = (Math.random() - 0.5) * 1.5;
        posEngine[i3 + 2] = Math.sin(a) * 58;
      } else {
        // Radial structural circuit bus spokes
        const spokeIndex = i % 12;
        const spokeAngle = (spokeIndex * Math.PI) / 6;
        const rSpoke = 10 + Math.random() * 52;
        posEngine[i3] = Math.cos(spokeAngle) * rSpoke;
        posEngine[i3 + 1] = (Math.random() - 0.5) * 0.8;
        posEngine[i3 + 2] = Math.sin(spokeAngle) * rSpoke;
      }

      // Sizes & Colors
      if (types[i] === 4.0) {
        sizes[i] = isMobile ? 4.5 : 6.0;
        colAmberGlow.toArray(colors, i3);
      } else if (types[i] === 1.0) {
        sizes[i] = isMobile ? 3.0 : 4.2;
        colAmberEnergy.toArray(colors, i3);
      } else if (types[i] === 2.0) {
        sizes[i] = isMobile ? 2.0 : 2.8;
        colWarmWhite.toArray(colors, i3);
      } else if (types[i] === 3.0) {
        sizes[i] = isMobile ? 1.6 : 2.4;
        if (i % 7 === 0) colMutedGreen.toArray(colors, i3);
        else if (i % 4 === 0) colGraphite.toArray(colors, i3);
        else colSoftGrey.toArray(colors, i3);
      } else {
        sizes[i] = isMobile ? 1.2 : 1.8;
        colSoftGrey.toArray(colors, i3);
      }
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posVoid, 3));
    particleGeo.setAttribute('aGalaxy', new THREE.BufferAttribute(posGalaxy, 3));
    particleGeo.setAttribute('aSolar', new THREE.BufferAttribute(posSolar, 3));
    particleGeo.setAttribute('aNeural', new THREE.BufferAttribute(posNeural, 3));
    particleGeo.setAttribute('aEngine', new THREE.BufferAttribute(posEngine, 3));
    particleGeo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    particleGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    particleGeo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    particleGeo.setAttribute('aType', new THREE.BufferAttribute(types, 1));

    const particleUniforms = {
      uTime: { value: 0 },
      uStage1: { value: 0 }, // Void -> Galaxy
      uStage2: { value: 0 }, // Galaxy -> Solar
      uStage3: { value: 0 }, // Solar -> Neural
      uStage4: { value: 0 }, // Neural -> Engine
      uWarp: { value: 0 },
      uActivation: { value: 0 },
      uOpacity: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
    };

    const particleMat = new THREE.ShaderMaterial({
      uniforms: particleUniforms,
      vertexShader: `
        attribute vec3 aGalaxy;
        attribute vec3 aSolar;
        attribute vec3 aNeural;
        attribute vec3 aEngine;
        attribute float aSize;
        attribute vec3 aColor;
        attribute float aRandom;
        attribute float aType;

        uniform float uTime;
        uniform float uStage1;
        uniform float uStage2;
        uniform float uStage3;
        uniform float uStage4;
        uniform float uWarp;
        uniform float uActivation;
        uniform float uOpacity;
        uniform float uPixelRatio;

        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          // Smooth progressive morphing between phases
          vec3 p1 = mix(position, aGalaxy, smoothstep(0.0, 1.0, uStage1));
          vec3 p2 = mix(p1, aSolar, smoothstep(0.0, 1.0, uStage2));
          vec3 p3 = mix(p2, aNeural, smoothstep(0.0, 1.0, uStage3));
          vec3 p = mix(p3, aEngine, smoothstep(0.0, 1.0, uStage4));

          // Subtle organic gravitational drift
          float driftAmp = 0.5 * (1.0 - uStage4 * 0.7);
          p.y += sin(uTime * 1.4 + aRandom * 6.28) * driftAmp;
          p.x += cos(uTime * 1.1 + aRandom * 3.14) * (driftAmp * 0.6);

          // Core activation pulse
          if (aType > 3.5) {
            p *= (1.0 + sin(uTime * 7.0) * 0.18 * uActivation);
          }

          // Warp velocity elongation in Phase 7
          if (uWarp > 0.01) {
            p.z += (p.z - cameraPosition.z) * uWarp * 2.6;
          }

          vec4 mvPos = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mvPos;

          // Depth attenuation
          float ptSize = aSize * uPixelRatio * (170.0 / -mvPos.z);
          if (uWarp > 0.05) {
            ptSize *= (1.0 + uWarp * 1.8);
          }
          gl_PointSize = clamp(ptSize, 1.0, 55.0);

          // Dynamic colors: subtle amber influx during core activation
          vec3 col = aColor;
          if (uActivation > 0.01 && aType > 0.5) {
            col = mix(col, vec3(0.96, 0.62, 0.04), uActivation * 0.75);
          }
          vColor = col;

          // Micro-twinkle
          float twinkle = 0.85 + 0.15 * sin(uTime * 2.8 + aRandom * 12.0);
          vAlpha = twinkle * uOpacity;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;

          // Realistic soft celestial point falloff with bright energetic core
          float core = smoothstep(0.16, 0.0, dist) * 0.8;
          float halo = smoothstep(0.5, 0.05, dist);
          float intensity = halo + core;

          gl_FragColor = vec4(vColor, intensity * vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const mainPointsMesh = new THREE.Points(particleGeo, particleMat);
    galaxyGroup.add(mainPointsMesh);

    // -------------------------------------------------------------
    // 5. Solar System Orbital Rings & Planet Markers
    // -------------------------------------------------------------
    const orbitRingRadii = [20, 32, 48, 64, 82, 104];
    const orbitLineMaterials: THREE.LineBasicMaterial[] = [];

    orbitRingRadii.forEach((radius, idx) => {
      const segments = 96;
      const ringPoints: THREE.Vector3[] = [];
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        ringPoints.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
      const ringMat = new THREE.LineBasicMaterial({
        color: idx % 2 === 0 ? new THREE.Color('#f59e0b') : new THREE.Color('#9ca3af'),
        transparent: true,
        opacity: 0,
        linewidth: 1,
      });
      orbitLineMaterials.push(ringMat);
      const ringLine = new THREE.Line(ringGeo, ringMat);
      solarSystemGroup.add(ringLine);

      // Planet nodes
      const planetGeo = new THREE.SphereGeometry(idx === 2 ? 1.4 : 1.0, 16, 16);
      const planetMat = new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? new THREE.Color('#f59e0b') : new THREE.Color('#d1d5db'),
        transparent: true,
        opacity: 0,
      });
      const planetMesh = new THREE.Mesh(planetGeo, planetMat);
      const angle = (idx * Math.PI * 2) / 6 + 0.4;
      planetMesh.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      solarSystemGroup.add(planetMesh);
    });

    // -------------------------------------------------------------
    // 6. Neural Network Synaptic Graph Lines
    // -------------------------------------------------------------
    const neuralLinePoints: THREE.Vector3[] = [];
    for (let i = 0; i < neuralHubs.length; i++) {
      for (let j = i + 1; j < neuralHubs.length; j++) {
        const dist = neuralHubs[i].distanceTo(neuralHubs[j]);
        if (dist < 38) {
          neuralLinePoints.push(neuralHubs[i], neuralHubs[j]);
        }
      }
    }
    const neuralLineGeo = new THREE.BufferGeometry().setFromPoints(neuralLinePoints);
    const neuralLineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#f59e0b'),
      transparent: true,
      opacity: 0,
    });
    const neuralLinesMesh = new THREE.LineSegments(neuralLineGeo, neuralLineMat);
    neuralGroup.add(neuralLinesMesh);

    // -------------------------------------------------------------
    // 7. Mechanical Engine Rings & Precision Segments
    // -------------------------------------------------------------
    // Ring A: Inner Gimbal
    const engineRingAGeo = new THREE.RingGeometry(13.8, 14.3, 64);
    const engineRingAMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#f59e0b'),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const engineRingA = new THREE.Mesh(engineRingAGeo, engineRingAMat);
    engineRingA.rotation.x = Math.PI / 2;
    engineGroup.add(engineRingA);

    // Ring B: Mid Segmented Caliper Ring
    const engineRingBGeo = new THREE.RingGeometry(33.5, 34.2, 72);
    const engineRingBMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#cbd5e1'),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const engineRingB = new THREE.Mesh(engineRingBGeo, engineRingBMat);
    engineRingB.rotation.x = Math.PI / 2.3;
    engineGroup.add(engineRingB);

    // Ring C: Outer Telemetry Compass Ring
    const engineRingCGeo = new THREE.RingGeometry(57.5, 58.2, 80);
    const engineRingCMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#4b5563'),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const engineRingC = new THREE.Mesh(engineRingCGeo, engineRingCMat);
    engineRingC.rotation.x = Math.PI / 2;
    engineGroup.add(engineRingC);

    // Structural Radiating Bus Spokes
    const spokePoints: THREE.Vector3[] = [];
    for (let s = 0; s < 12; s++) {
      const a = (s * Math.PI) / 6;
      spokePoints.push(
        new THREE.Vector3(Math.cos(a) * 14, 0, Math.sin(a) * 14),
        new THREE.Vector3(Math.cos(a) * 58, 0, Math.sin(a) * 58)
      );
    }
    const spokeGeo = new THREE.BufferGeometry().setFromPoints(spokePoints);
    const spokeMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#374151'),
      transparent: true,
      opacity: 0,
    });
    const spokeLines = new THREE.LineSegments(spokeGeo, spokeMat);
    engineGroup.add(spokeLines);

    // -------------------------------------------------------------
    // 8. Central Cognitive Core (Wireframe Icosahedron & Core Sphere)
    // -------------------------------------------------------------
    const coreIcosaGeo = new THREE.IcosahedronGeometry(4.6, 1);
    const coreIcosaMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#fbbf24'),
      wireframe: true,
      transparent: true,
      opacity: 0,
    });
    const coreIcosaMesh = new THREE.Mesh(coreIcosaGeo, coreIcosaMat);
    coreGroup.add(coreIcosaMesh);

    const coreInnerGeo = new THREE.SphereGeometry(3.0, 32, 32);
    const coreInnerMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#f59e0b'),
      transparent: true,
      opacity: 0,
    });
    const coreInnerMesh = new THREE.Mesh(coreInnerGeo, coreInnerMat);
    coreGroup.add(coreInnerMesh);

    // -------------------------------------------------------------
    // 9. Camera Trajectory Controller
    // -------------------------------------------------------------
    const cameraState = {
      x: 0,
      y: 0,
      z: 175,
      lookX: 0,
      lookY: 0,
      lookZ: 0,
    };

    // -------------------------------------------------------------
    // 10. Master GSAP Animation Timeline (Sequencing Phases 1 - 8)
    // -------------------------------------------------------------
    const tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        // Fade out overlay canvas smoothly and transition
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            onComplete();
          },
        });
      },
    });

    masterTimelineRef.current = tl;

    // --- PHASE 1: THE VOID (0.0s - 2.5s) ---
    tl.addLabel('phase1', 0);
    tl.call(() => {
      setCurrentPhase('PHASE 01 // THE VOID');
      setPhaseNumber('01/08');
    }, undefined, 0.1);

    // Void spark appears
    tl.to(voidSeedMesh.material, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.2);
    tl.to(voidSeedMesh.scale, { x: 2.2, y: 2.2, z: 2.2, duration: 1.0, ease: 'elastic.out(1, 0.6)' }, 0.4);

    // Stars materialize gradually into deep space
    tl.to(particleUniforms.uOpacity, { value: 0.95, duration: 1.8, ease: 'power2.inOut' }, 0.8);
    tl.to(cameraState, { z: 140, y: 3, duration: 2.5, ease: 'sine.inOut' }, 0);

    // --- PHASE 2: UNIVERSE (2.5s - 5.2s) ---
    tl.addLabel('phase2', 2.5);
    tl.call(() => {
      setCurrentPhase('PHASE 02 // UNIVERSE');
      setPhaseNumber('02/08');
    }, undefined, 2.5);

    // Seed particle dissolves into the cosmic fabric
    tl.to(voidSeedMesh.material, { opacity: 0, duration: 0.6, ease: 'power2.out' }, 2.5);

    // Morph to Galaxy logarithmic spiral
    tl.to(particleUniforms.uStage1, { value: 1.0, duration: 2.7, ease: 'power2.inOut' }, 2.5);

    // Camera travels organically through the cosmos
    tl.to(cameraState, { x: 16, y: 14, z: 96, lookX: 0, lookY: 0, lookZ: 0, duration: 2.7, ease: 'power1.inOut' }, 2.5);

    // --- PHASE 3: COLLAPSE (5.2s - 7.8s) ---
    tl.addLabel('phase3', 5.2);
    tl.call(() => {
      setCurrentPhase('PHASE 03 // COLLAPSE');
      setPhaseNumber('03/08');
      solarSystemGroup.visible = true;
    }, undefined, 5.2);

    // Particles collapse toward orbital paths
    tl.to(particleUniforms.uStage2, { value: 1.0, duration: 2.6, ease: 'power3.inOut' }, 5.2);

    // Solar system rings and planet nodes fade in
    orbitLineMaterials.forEach((mat) => {
      tl.to(mat, { opacity: 0.35, duration: 1.8, ease: 'power2.out' }, 5.6);
    });

    // Camera pulls back in a majestic arc to reveal the planetary plane
    tl.to(cameraState, { x: 0, y: 48, z: 112, lookX: 0, lookY: 0, lookZ: 0, duration: 2.6, ease: 'power2.inOut' }, 5.2);

    // --- PHASE 4: TRANSFORMATION (7.8s - 10.4s) ---
    tl.addLabel('phase4', 7.8);
    tl.call(() => {
      setCurrentPhase('PHASE 04 // TRANSFORMATION');
      setPhaseNumber('04/08');
      neuralGroup.visible = true;
    }, undefined, 7.8);

    // Morph to Neural network lattice
    tl.to(particleUniforms.uStage3, { value: 1.0, duration: 2.6, ease: 'power3.inOut' }, 7.8);

    // Fade out planetary rings and fade in neural synaptic connections
    orbitLineMaterials.forEach((mat) => {
      tl.to(mat, { opacity: 0, duration: 1.0, ease: 'power2.in' }, 7.8);
    });
    tl.to(neuralLineMat, { opacity: 0.45, duration: 1.8, ease: 'power2.out' }, 8.2);

    // Camera pivots to isometric neural graph perspective
    tl.to(cameraState, { x: 38, y: 22, z: 74, duration: 2.6, ease: 'power2.inOut' }, 7.8);

    // --- PHASE 5: ENGINE ASSEMBLY (10.4s - 12.8s) ---
    tl.addLabel('phase5', 10.4);
    tl.call(() => {
      setCurrentPhase('PHASE 05 // ENGINE ASSEMBLY');
      setPhaseNumber('05/08');
      engineGroup.visible = true;
    }, undefined, 10.4);

    // Morph to Precision Engine layout
    tl.to(particleUniforms.uStage4, { value: 1.0, duration: 2.4, ease: 'power3.inOut' }, 10.4);

    // Engine rings & spokes fade in with metallic graphite & amber clarity
    tl.to(engineRingAMat, { opacity: 0.85, duration: 1.4, ease: 'power2.out' }, 10.6);
    tl.to(engineRingBMat, { opacity: 0.7, duration: 1.5, ease: 'power2.out' }, 10.8);
    tl.to(engineRingCMat, { opacity: 0.5, duration: 1.6, ease: 'power2.out' }, 11.0);
    tl.to(spokeMat, { opacity: 0.4, duration: 1.4, ease: 'power2.out' }, 11.0);

    // Neural lines settle into internal circuit traces
    tl.to(neuralLineMat, { opacity: 0.2, duration: 1.2, ease: 'power2.out' }, 10.8);

    // Camera squares up to front-facing computational engine view
    tl.to(cameraState, { x: 0, y: 14, z: 62, lookX: 0, lookY: 0, lookZ: 0, duration: 2.4, ease: 'power2.inOut' }, 10.4);

    // --- PHASE 6: CORE ACTIVATION (12.8s - 15.2s) ---
    tl.addLabel('phase6', 12.8);
    tl.call(() => {
      setCurrentPhase('PHASE 06 // CORE ACTIVATION');
      setPhaseNumber('06/08');
      setShowTypography(true);
    }, undefined, 12.8);

    // Core activates & pulses
    tl.to(coreIcosaMat, { opacity: 0.9, duration: 1.0, ease: 'power2.out' }, 12.8);
    tl.to(coreInnerMat, { opacity: 0.75, duration: 1.0, ease: 'power2.out' }, 12.8);
    tl.to(particleUniforms.uActivation, { value: 1.0, duration: 1.4, ease: 'power2.out' }, 12.9);

    // Subtle engine stabilization pulse
    tl.to(coreGroup.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.6, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 13.2);

    // Camera locks in close to center
    tl.to(cameraState, { x: 0, y: 0, z: 46, duration: 2.4, ease: 'sine.out' }, 12.8);

    // --- PHASE 7: ENTER THE ENGINE (15.2s - 17.5s) ---
    tl.addLabel('phase7', 15.2);
    tl.call(() => {
      setCurrentPhase('PHASE 07 // ENTER THE ENGINE');
      setPhaseNumber('07/08');
      setShowEnterPrompt(true);
    }, undefined, 15.2);

    // Warp acceleration into core
    tl.to(particleUniforms.uWarp, { value: 1.0, duration: 2.0, ease: 'power3.in' }, 15.3);

    // Camera hyper-drive through the cognitive nucleus
    tl.to(cameraState, { z: -35, duration: 2.2, ease: 'power3.in' }, 15.3);

    // Engine rings expand outward as camera passes through
    tl.to(engineGroup.scale, { x: 3.5, y: 3.5, z: 3.5, duration: 2.0, ease: 'power2.in' }, 15.4);
    tl.to(coreGroup.scale, { x: 4.0, y: 4.0, z: 4.0, duration: 2.0, ease: 'power2.in' }, 15.4);

    // Dissolve into Landing Page Hero
    tl.to([particleUniforms.uOpacity, engineRingAMat, engineRingBMat, engineRingCMat, coreIcosaMat, coreInnerMat], {
      value: 0,
      opacity: 0,
      duration: 1.2,
      ease: 'power2.inOut',
    }, 16.3);

    // --- PHASE 8: LANDING PAGE TRANSITION (17.5s) ---
    tl.addLabel('phase8', 17.5);
    tl.call(() => {
      setCurrentPhase('PHASE 08 // KAIZEN ONLINE');
      setPhaseNumber('08/08');
    }, undefined, 17.5);

    // Start playback
    tl.play();

    // -------------------------------------------------------------
    // 11. Animation Render Loop (requestAnimationFrame)
    // -------------------------------------------------------------
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      particleUniforms.uTime.value = elapsedTime;

      // Group rotations for mechanical dynamism
      galaxyGroup.rotation.y = elapsedTime * 0.05;
      solarSystemGroup.rotation.y = elapsedTime * 0.035;
      neuralGroup.rotation.y = -elapsedTime * 0.025;

      // Counter-rotating engine gimbals
      engineRingA.rotation.z = elapsedTime * 0.35;
      engineRingB.rotation.z = -elapsedTime * 0.22;
      engineRingC.rotation.z = elapsedTime * 0.12;
      spokeLines.rotation.y = elapsedTime * 0.08;

      // Cognitive Core internal gyro
      coreIcosaMesh.rotation.x = elapsedTime * 0.4;
      coreIcosaMesh.rotation.y = elapsedTime * 0.6;

      // Camera positioning
      camera.position.set(cameraState.x, cameraState.y, cameraState.z);
      camera.lookAt(cameraState.lookX, cameraState.lookY, cameraState.lookZ);

      renderer.render(scene, camera);
    };

    animate();

    // -------------------------------------------------------------
    // 12. Responsive Window Resize Handler
    // -------------------------------------------------------------
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      particleUniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    };

    window.addEventListener('resize', handleResize);

    // -------------------------------------------------------------
    // 13. Cleanup on Unmount
    // -------------------------------------------------------------
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
      }
      particleGeo.dispose();
      particleMat.dispose();
      seedGeo.dispose();
      seedMat.dispose();
      neuralLineGeo.dispose();
      neuralLineMat.dispose();
      engineRingAGeo.dispose();
      engineRingBGeo.dispose();
      engineRingCGeo.dispose();
      engineRingAMat.dispose();
      engineRingBMat.dispose();
      engineRingCMat.dispose();
      spokeGeo.dispose();
      spokeMat.dispose();
      coreIcosaGeo.dispose();
      coreIcosaMat.dispose();
      coreInnerGeo.dispose();
      coreInnerMat.dispose();
      orbitLineMaterials.forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, [onComplete]);

  if (isSkipped) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#050605] overflow-hidden select-none pointer-events-auto transition-opacity"
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Top Bar: Telemetry & Minimal SKIP INTRO Button */}
      <div className="absolute top-0 left-0 right-0 p-6 sm:p-8 flex items-center justify-between z-40 pointer-events-auto">
        {/* Left: Project Telemetry Glyph */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0e1015]/80 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-[0.25em] block">
              PROJECT KAIZEN // GENESIS
            </span>
            <span className="font-mono text-[9px] text-slate-400 tracking-wider block">
              COGNITIVE SYSTEM FORMATION
            </span>
          </div>
        </div>

        {/* Right: SKIP INTRO Button */}
        <button
          onClick={handleSkip}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-[#0e1015]/80 hover:bg-[#181d26] border border-white/10 hover:border-amber-400/50 text-slate-300 hover:text-white font-mono text-[11px] tracking-[0.2em] font-bold uppercase transition-all shadow-lg active:scale-95 cursor-pointer backdrop-blur-md"
          title="Skip intro animation and jump to landing page"
        >
          <span>SKIP INTRO</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-400 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Bottom Bar: Sequential Phase Telemetry HUD */}
      <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-8 flex items-end justify-between pointer-events-none z-40 font-mono text-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[10px] text-amber-300/80 font-bold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)] animate-pulse" />
            <span>{currentPhase}</span>
          </div>
          <span className="text-[9px] text-slate-400 uppercase tracking-wider">
            GPU ACCELERATED COGNITIVE SUBSTRATE • ZERO TELEMETRY
          </span>
        </div>

        {/* Phase Indicator Counter */}
        <div className="text-right">
          <span className="font-mono text-xs text-amber-400/90 font-bold tracking-widest">
            {phaseNumber}
          </span>
        </div>
      </div>

      {/* Central Activation Typography (Phase 6 Reveal: KAIZEN / THINK. LEARN. ACT. IMPROVE.) */}
      {showTypography && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30 px-4 text-center">
          <div className="animate-in fade-in zoom-in-95 duration-1000">
            {/* Minimal High-End Title */}
            <h1 className="font-orbitron font-black text-5xl sm:text-7xl lg:text-9xl tracking-[0.2em] text-white uppercase drop-shadow-[0_0_35px_rgba(245,158,11,0.35)]">
              KAIZEN
            </h1>

            {/* Engineering Mantra */}
            <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 font-orbitron font-bold text-sm sm:text-lg lg:text-xl tracking-[0.25em] text-slate-200">
              <span className="text-white hover:text-amber-300 transition-colors">THINK.</span>
              <span className="text-amber-500/60">•</span>
              <span className="text-white hover:text-amber-300 transition-colors">LEARN.</span>
              <span className="text-amber-500/60">•</span>
              <span className="text-white hover:text-amber-300 transition-colors">ACT.</span>
              <span className="text-amber-500/60">•</span>
              <span className="text-amber-400 hover:text-amber-300 transition-colors">IMPROVE.</span>
            </div>

            {/* Interactive "ENTER SYSTEM" Prompt when reaching engine core */}
            {showEnterPrompt && (
              <div className="mt-8 pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-700">
                <button
                  onClick={handleEnterSystem}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 font-mono text-xs font-black tracking-[0.2em] uppercase shadow-[0_0_25px_rgba(245,158,11,0.5)] border border-amber-300/60 hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>[ ENTER SYSTEM ]</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CinematicIntro;
