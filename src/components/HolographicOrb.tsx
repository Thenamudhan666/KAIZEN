import React, { useEffect, useRef } from 'react';
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
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  const ampRef = useRef(audioAmplitude);
  const interruptedRef = useRef(interrupted);

  stateRef.current = state;
  ampRef.current = audioAmplitude;
  interruptedRef.current = interrupted;

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

      // Initial Cyan Tint
      colors[i * 3] = 0.1;
      colors[i * 3 + 1] = 0.8;
      colors[i * 3 + 2] = 0.95;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const material = new THREE.PointsMaterial({
      size: 0.065,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Inner Core Sphere
    const coreGeo = new THREE.IcosahedronGeometry(1.0, 3);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Orbital Rings
    const ringGeo1 = new THREE.TorusGeometry(2.6, 0.015, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(3.0, 0.012, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.25,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);
    // Extra Ring 3
    const ringGeo3 = new THREE.TorusGeometry(3.4, 0.008, 16, 100);
    const ringMat3 = new THREE.MeshBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.3 });
    const ring3 = new THREE.Mesh(ringGeo3, ringMat3);
    ring3.rotation.z = Math.PI / 6;
    scene.add(ring3);

    // Extra Ring 4
    const ringGeo4 = new THREE.TorusGeometry(1.5, 0.02, 16, 100);
    const ringMat4 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5, wireframe: true });
    const ring4 = new THREE.Mesh(ringGeo4, ringMat4);
    ring4.rotation.x = Math.PI / 2;
    scene.add(ring4);

    
    // Inner Nucleus (reacts strongly to audio)
    const nucleusGeo = new THREE.IcosahedronGeometry(0.5, 2);
    const nucleusMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
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



      // Color palettes by cognitive state
      let targetR = 0.1;
      let targetG = 0.8;
      let targetB = 0.95;
      let coreColor = 0x06b6d4;
      let speedMult = 1.0;
      let displacementFactor = 0.0;

      if (isInterrupted) {
        // Red / Crimson shockwave
        targetR = 0.95;
        targetG = 0.15;
        targetB = 0.2;
        coreColor = 0xef4444;
        speedMult = 3.0;
        displacementFactor = 0.0;
      } else {
        switch (currentState) {
          case 'idle':
            targetR = 0.1;
            targetG = 0.7;
            targetB = 0.9;
            coreColor = 0x0ea5e9;
            speedMult = 0.6;
            break;
          case 'listening':
            targetR = 0.1;
            targetG = 0.95;
            targetB = 0.7;
            coreColor = 0x10b981;
            speedMult = 1.4;
            displacementFactor = 0.0;
            break;
          case 'debating':
            // Electric Violet
            targetR = 0.75;
            targetG = 0.25;
            targetB = 0.95;
            coreColor = 0x9333ea;
            speedMult = 2.0;
            displacementFactor = 0.0;
            break;
          case 'reasoning':
            // Amber / Gold
            targetR = 0.95;
            targetG = 0.75;
            targetB = 0.1;
            coreColor = 0xf59e0b;
            speedMult = 1.6;
            displacementFactor = 0.0;
            break;
          case 'speaking':
            // Bright Cyan / Electric Blue
            targetR = 0.2;
            targetG = 0.85;
            targetB = 1.0;
            coreColor = 0x06b6d4;
            speedMult = 2.2;
            displacementFactor = 0.3 + currentAmp * 0.7;
            break;
          case 'learning':
            // Emerald Constellation
            targetR = 0.05;
            targetG = 0.95;
            targetB = 0.55;
            coreColor = 0x10b981;
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
      
      
      const nucScale = 1.0 + (currentAmp * 2.5);
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
        label: 'BARGE-IN FLUSH',
        sublabel: 'Audio Buffer Cleared • Context Reconciled',
        color: 'text-rose-400 border-rose-500/30 bg-rose-950/40',
        icon: ShieldAlert,
      };
    }
    switch (state) {
      case 'idle':
        return {
          label: 'COGNITIVE STANDBY',
          sublabel: 'Observer Listening (24/7 Context Active)',
          color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40',
          icon: Radio,
        };
      case 'listening':
        return {
          label: 'NEURAL VAD CAPTURE',
          sublabel: 'Silero VAD Active • WebRTC Streaming',
          color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
          icon: Volume2,
        };
      case 'debating':
        return {
          label: 'MULTI-AGENT DEBATE',
          sublabel: 'Teacher vs. Critic vs. Student',
          color: 'text-purple-400 border-purple-500/30 bg-purple-950/40',
          icon: Cpu,
        };
      case 'reasoning':
        return {
          label: 'SOCRATIC REASONING',
          sublabel: 'Argument Graph Synthesis (Task 1-3)',
          color: 'text-amber-400 border-amber-500/30 bg-amber-950/40',
          icon: Sparkles,
        };
      case 'speaking':
        return {
          label: 'BUTLER VOCALIZATION',
          sublabel: '1-2 Sentence Spoken Output (Low-Latency)',
          color: 'text-sky-400 border-sky-500/30 bg-sky-950/40',
          icon: Volume2,
        };
      case 'learning':
        return {
          label: 'VOYAGER ACCUMULATION',
          sublabel: 'Compiling Skill to Vault Knowledge Base',
          color: 'text-emerald-300 border-emerald-400/40 bg-emerald-950/50',
          icon: BookOpen,
        };
    }
  };

  const meta = getStateMeta();
  const IconComponent = meta.icon;

  return (
    <div id="holographic-orb-container" className="relative flex flex-col items-center justify-center p-4 bg-slate-950/80 border border-slate-800 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden min-h-[480px] flex-1">
      {/* Background Holographic Grid Accent */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00f0ff 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>
      <div className="absolute w-[300px] h-[300px] border border-cyan-400/10 rounded-full pointer-events-none"></div>
      <div className="absolute w-[240px] h-[240px] border border-cyan-400/20 rounded-full pointer-events-none"></div>
      <div className="absolute w-[180px] h-[180px] border border-cyan-400/40 rounded-full pointer-events-none"></div>

      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="w-[120%] h-80 sm:h-96 -ml-[10%] max-w-[480px] max-h-[480px] relative z-10 cursor-pointer" />

      {/* Status Overlay HUD */}
      <div className="relative z-20 mt-2 flex flex-col items-center gap-1.5 text-center">
        <div className={`inline-flex items-center gap-2 px-3 py-1 border text-[10px] font-bold tracking-[0.3em] font-mono uppercase ${meta.color.replace('rounded-full', 'rounded-none')}`}>
          <IconComponent className="w-3.5 h-3.5 animate-pulse" />
          <span>{meta.label}</span>
        </div>
        <p className="text-[11px] font-mono text-slate-400 max-w-xs">{meta.sublabel}</p>
      </div>

      {/* Real-Time Telemetry Ring Stats */}
      <div className="w-full mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-slate-400">
        <div className="bg-slate-950 p-1.5 border border-slate-800">
          <span className="text-slate-500 block">AUDIO AMP</span>
          <span className="text-cyan-400 font-bold">{(audioAmplitude * 100).toFixed(0)}%</span>
        </div>
        <div className="bg-slate-950 p-1.5 border border-slate-800">
          <span className="text-slate-500 block">VAD LATENCY</span>
          <span className="text-emerald-400 font-bold">&lt;180ms</span>
        </div>
        <div className="bg-slate-950 p-1.5 border border-slate-800">
          <span className="text-slate-500 block">BARGE-IN</span>
          <span className={interrupted ? "text-rose-400 font-bold" : "text-slate-300"}>
            {interrupted ? "TRIGGERED" : "ARMED"}
          </span>
        </div>
      </div>
    </div>
  );
};
