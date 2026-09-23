import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AgentCognitiveState } from '../types';
import { Sparkles, Radio, Cpu, ShieldAlert, BookOpen, Volume2 } from 'lucide-react';

interface HolographicOrbProps {
  state: AgentCognitiveState;
  audioAmplitude?: number; // 0.0 to 1.0
  interrupted?: boolean;
}

export const HolographicOrb: React.FC<HolographicOrbProps> = ({
  state,
  audioAmplitude = 0.3,
  interrupted = false,
}) => {
  const [viewMode, setViewMode] = useState<'3D' | '2D' | 'Grid' | 'Orbits' | 'Neural'>('3D');
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  const ampRef = useRef(audioAmplitude);
  const interruptedRef = useRef(interrupted);
  const viewModeRef = useRef(viewMode);

  stateRef.current = state;
  ampRef.current = audioAmplitude;
  interruptedRef.current = interrupted;
  viewModeRef.current = viewMode;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particle Orb Geometry
    const particleCount = 4500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const radius = 2.0;
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

      // Initial Amber / Honey Tint
      colors[i * 3] = 0.96;
      colors[i * 3 + 1] = 0.65;
      colors[i * 3 + 2] = 0.08;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const material = new THREE.PointsMaterial({
      size: 0.065,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Inner Core Sphere
    const coreGeo = new THREE.IcosahedronGeometry(1.0, 3);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Orbital Rings with Amber theme colors
    const ringGeo1 = new THREE.TorusGeometry(2.6, 0.015, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.45,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(3.0, 0.012, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xd97706,
      transparent: true,
      opacity: 0.4,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    // Ring 3: Honey Gold
    const ringGeo3 = new THREE.TorusGeometry(3.4, 0.008, 16, 100);
    const ringMat3 = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.35 });
    const ring3 = new THREE.Mesh(ringGeo3, ringMat3);
    ring3.rotation.z = Math.PI / 6;
    scene.add(ring3);

    // Ring 4: Deep Bronze Amber
    const ringGeo4 = new THREE.TorusGeometry(1.5, 0.02, 16, 100);
    const ringMat4 = new THREE.MeshBasicMaterial({ color: 0xb45309, transparent: true, opacity: 0.45, wireframe: true });
    const ring4 = new THREE.Mesh(ringGeo4, ringMat4);
    ring4.rotation.x = Math.PI / 2;
    scene.add(ring4);

    // Inner Nucleus (reacts strongly to audio)
    const nucleusGeo = new THREE.IcosahedronGeometry(0.5, 2);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: 0xfef3c7,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    scene.add(nucleusMesh);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const currentState = stateRef.current;
      const currentAmp = ampRef.current;
      const isInterrupted = interruptedRef.current;

      // Color palettes by cognitive state (Graphite + Amber Theme)
      let targetR = 0.96;
      let targetG = 0.62;
      let targetB = 0.04;
      let coreColor = 0xf59e0b;
      let speedMult = 1.0;
      let displacementFactor = 0.0;

      if (isInterrupted) {
        // Red Shockwave
        targetR = 0.95;
        targetG = 0.2;
        targetB = 0.2;
        coreColor = 0xef4444;
        speedMult = 3.0;
        displacementFactor = 0.0;
      } else {
        switch (currentState) {
          case 'idle':
            // Warm Amber
            targetR = 0.96;
            targetG = 0.62;
            targetB = 0.04;
            coreColor = 0xf59e0b;
            speedMult = 0.6;
            break;
          case 'listening':
            // Luminous Gold
            targetR = 0.98;
            targetG = 0.75;
            targetB = 0.14;
            coreColor = 0xfbbf24;
            speedMult = 1.4;
            displacementFactor = 0.0;
            break;
          case 'debating':
            // High-Energy Orange / Cadmium Amber
            targetR = 0.92;
            targetG = 0.35;
            targetB = 0.05;
            coreColor = 0xea580c;
            speedMult = 2.0;
            displacementFactor = 0.0;
            break;
          case 'reasoning':
            // Deep Amber-Bronze
            targetR = 0.95;
            targetG = 0.55;
            targetB = 0.06;
            coreColor = 0xd97706;
            speedMult = 1.6;
            displacementFactor = 0.0;
            break;
          case 'speaking':
            // Bright Honey Gold Glow
            targetR = 1.0;
            targetG = 0.95;
            targetB = 0.78;
            coreColor = 0xfef3c7;
            speedMult = 2.2;
            displacementFactor = 0.3 + currentAmp * 0.7;
            break;
          case 'learning':
            // Golden Constellation
            targetR = 0.98;
            targetG = 0.75;
            targetB = 0.14;
            coreColor = 0xfbbf24;
            speedMult = 1.8;
            displacementFactor = 0.0;
            break;
        }
      }

      coreMat.color.setHex(coreColor);
      ringMat1.color.setHex(coreColor);

      // Rotations
      particles.rotation.y = elapsedTime * 0.25 * speedMult;
      particles.rotation.x = Math.sin(elapsedTime * 0.2) * 0.15;
      coreMesh.rotation.y = -elapsedTime * 0.4 * speedMult;
      coreMesh.rotation.z = elapsedTime * 0.15;
      ring1.rotation.z = elapsedTime * 0.3 * speedMult;
      ring2.rotation.x = -elapsedTime * 0.2 * speedMult;
      ring3.rotation.y = elapsedTime * 0.1 * speedMult;
      ring3.rotation.x = Math.sin(elapsedTime * 0.2) * 0.2;
      ring4.rotation.z = -elapsedTime * 0.4 * speedMult;

      const nucScale = 1.0 + currentAmp * 2.5;
      nucleusMesh.scale.set(nucScale, nucScale, nucScale);
      nucleusMesh.rotation.y = elapsedTime * 1.5 * speedMult;
      nucleusMesh.rotation.x = elapsedTime * 1.2 * speedMult;
      nucleusMat.color.setHex(coreColor);
      ringMat3.color.setHex(coreColor);
      ringMat4.color.setHex(coreColor);

      // Vertex Displacements
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = geometry.attributes.color as THREE.BufferAttribute;

      for (let i = 0; i < particleCount; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        // Harmonic wave displacement
        const wave = Math.sin(elapsedTime * 3.0 * speedMult + ox * 2 + oy * 2) * displacementFactor;
        const scale = 1.0 + wave;

        posAttr.setXYZ(i, ox * scale, oy * scale, oz * scale);

        // Color interpolation
        const cr = colors[i * 3] + (targetR - colors[i * 3]) * 0.05;
        const cg = colors[i * 3 + 1] + (targetG - colors[i * 3 + 1]) * 0.05;
        const cb = colors[i * 3 + 2] + (targetB - colors[i * 3 + 2]) * 0.05;

        colors[i * 3] = cr;
        colors[i * 3 + 1] = cg;
        colors[i * 3 + 2] = cb;

        colAttr.setXYZ(i, cr, cg, cb);
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      ringGeo3.dispose();
      ringMat3.dispose();
      ringGeo4.dispose();
      ringMat4.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      renderer.dispose();
    };
  }, []);

  const getStateMeta = () => {
    if (interrupted) {
      return {
        label: 'BARGE-IN PROTOCOL: FLUSHED',
        sublabel: 'Audio Buffer Cleared • Generation Aborted',
        color: 'text-coral border-coral/30 bg-coral/15 shadow-[0_0_12px_rgba(251,113,133,0.2)]',
        icon: ShieldAlert,
      };
    }
    switch (state) {
      case 'idle':
        return {
          label: 'COGNITIVE STANDBY',
          sublabel: 'Observer Listening (24/7 Context Active)',
          color: 'text-amber-300 border-amber-400/30 bg-amber-500/15 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
          icon: Radio,
        };
      case 'listening':
        return {
          label: 'NEURAL VAD STREAMING',
          sublabel: 'Silero VAD Active • 16kHz PCM Ingest',
          color: 'text-amber-400 border-amber-400/40 bg-amber-500/20 shadow-[0_0_12px_rgba(251,191,36,0.25)]',
          icon: Volume2,
        };
      case 'debating':
        return {
          label: 'DIALECTIC TRIAD DEBATE',
          sublabel: 'Teacher vs. Critic vs. Student',
          color: 'text-amber-200 border-amber-600/40 bg-amber-700/20 shadow-[0_0_12px_rgba(217,119,6,0.25)]',
          icon: Cpu,
        };
      case 'reasoning':
        return {
          label: 'SOCRATIC REASONING',
          sublabel: 'Argument Graph Synthesis (Task 1-3)',
          color: 'text-amber-300 border-amber-500/30 bg-amber-600/15 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
          icon: Sparkles,
        };
      case 'speaking':
        return {
          label: 'BUTLER VOCALIZATION',
          sublabel: '1-2 Sentence Spoken Output (Low-Latency)',
          color: 'text-slate-950 font-bold border-amber-300/60 bg-gradient-to-r from-amber-400 to-amber-600 shadow-[0_0_16px_rgba(245,158,11,0.4)]',
          icon: Volume2,
        };
      case 'learning':
        return {
          label: 'VOYAGER ACCUMULATION',
          sublabel: 'Compiling Skill to Local Vault',
          color: 'text-amber-400 border-amber-400/40 bg-amber-500/15 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
          icon: BookOpen,
        };
    }
  };

  const meta = getStateMeta();
  const IconComponent = meta.icon;

  return (
    <div
      id="holographic-orb-container"
      className="rounded-2xl p-4 sm:p-5 border border-amber-500/20 bg-[#12151c]/90 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col min-h-[460px] flex-1"
    >
      {/* Ambient Glow Blobs */}
      <div className="absolute -top-16 -left-16 w-60 h-60 bg-amber-600/10 rounded-full blur-[90px] pointer-events-none"></div>
      <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-amber-700/10 rounded-full blur-[90px] pointer-events-none"></div>

      {/* Header Reticle Label */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2 font-mono text-[11px] text-white">
          <span className="text-amber-400 text-sm">✦</span>
          <span className="uppercase tracking-wider font-bold">TENSOR FIELD VISUALIZER</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
          EPOCH 0x88F // 12ms
        </span>
      </div>

      {/* Central 3D Canvas Box */}
      <div className="relative w-full h-72 rounded-xl flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#141720] via-[#0e1016] to-[#07080a] border border-amber-500/30 shadow-[inset_0_0_50px_rgba(0,0,0,0.85)]">
        {/* Corner Reticles */}
        <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-amber-400/80 pointer-events-none z-20"></div>
        <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-amber-400/80 pointer-events-none z-20"></div>
        <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-amber-400/80 pointer-events-none z-20"></div>
        <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-amber-400/80 pointer-events-none z-20"></div>

        {/* Left Vertical Tool Mode Selector */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5 pointer-events-auto">
          {(['3D', '2D', 'Grid', 'Orbits', 'Neural'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                viewMode === m
                  ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 shadow-[0_0_14px_rgba(245,158,11,0.5)] border border-amber-300/60 scale-105'
                  : 'bg-black/50 text-slate-400 border border-white/10 hover:border-amber-400/40 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Right Vertical Telemetry HUD */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5 font-mono text-[9px] text-right pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-white/10">
            <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Epoch</span>
            <span className="text-amber-300 font-bold">0x88F</span>
          </div>
          <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-white/10">
            <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Batch</span>
            <span className="text-amber-400 font-bold">128</span>
          </div>
          <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-white/10">
            <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Dimensions</span>
            <span className="text-amber-200 font-bold">3072</span>
          </div>
          <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-white/10">
            <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Synapses</span>
            <span className="text-amber-400 font-bold">1.2M</span>
          </div>
        </div>

        {/* 3D WebGL Canvas Viewport */}
        <div ref={mountRef} className="w-full h-full relative z-10 cursor-pointer" />
      </div>

      {/* Status Overlay HUD */}
      <div className="relative z-20 mt-3.5 flex flex-col items-center gap-1.5 text-center">
        <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-bold tracking-wider font-mono uppercase border ${meta.color}`}>
          <IconComponent className="w-3.5 h-3.5 animate-pulse" />
          <span>{meta.label}</span>
        </div>
        <p className="text-[11px] font-mono text-slate-400 max-w-xs">{meta.sublabel}</p>
      </div>

      {/* Real-Time Telemetry Cards */}
      <div className="w-full mt-3.5 pt-3 border-t border-amber-500/15 grid grid-cols-3 gap-2.5 text-center text-[10px] font-mono">
        <div className="rounded-xl p-2.5 bg-[#161920]/80 border border-amber-500/15">
          <span className="text-slate-400 block uppercase tracking-wider text-[9px]">AUDIO AMP</span>
          <span className="text-amber-400 font-bold text-xs mt-0.5 block">{(audioAmplitude * 100).toFixed(0)}%</span>
        </div>
        <div className="rounded-xl p-2.5 bg-[#161920]/80 border border-amber-500/15">
          <span className="text-slate-400 block uppercase tracking-wider text-[9px]">VAD LATENCY</span>
          <span className="text-amber-300 font-bold text-xs mt-0.5 block">&lt; 180 ms</span>
        </div>
        <div className="rounded-xl p-2.5 bg-[#161920]/80 border border-amber-500/15">
          <span className="text-slate-400 block uppercase tracking-wider text-[9px]">BARGE-IN</span>
          <span className={`font-bold text-xs mt-0.5 block ${interrupted ? 'text-rose-400' : 'text-amber-400'}`}>
            {interrupted ? 'TRIGGERED' : 'ARMED'}
          </span>
        </div>
      </div>
    </div>
  );
};
