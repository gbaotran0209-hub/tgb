import React, { useEffect, useRef, useState } from 'react';
import { ChemicalElement } from '../data/elements';
import { Play, Pause, RotateCcw, Sparkles, Compass, Orbit } from 'lucide-react';

interface Atom3DCanvasProps {
  element: ChemicalElement;
}

const SHELL_NAMES = ['K (n=1)', 'L (n=2)', 'M (n=3)', 'N (n=4)', 'O (n=5)', 'P (n=6)', 'Q (n=7)'];

interface NucleonPoint {
  x: number;
  y: number;
  z: number;
  isProton: boolean;
}

interface CloudSamplePoint {
  x: number;
  y: number;
  z: number;
  shellIdx: number;
  orbitalType: 's' | 'px' | 'py' | 'pz' | 'd';
  baseAlpha: number;
  phase: number;
}

interface QuantumElectronState {
  shellIdx: number;
  isOuter: boolean;
  orbitalType: 's' | 'px' | 'py' | 'pz' | 'd';
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  history: { x: number; y: number; z: number }[];
  jumpTimer: number;
}

type ModelMode = 'modern_cloud' | 'modern_ao' | 'bohr_compare';

export const Atom3DCanvas: React.FC<Atom3DCanvasProps> = ({ element }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [modelMode, setModelMode] = useState<ModelMode>('modern_cloud');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [highlightedShell, setHoveredShell] = useState<number | null>(null);

  // Camera rotation angles controlled by mouse/touch drag
  const rotationRef = useRef<{ rotX: number; rotY: number }>({
    rotX: 0.42,
    rotY: -0.45,
  });
  const isDraggingRef = useRef<boolean>(false);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const timeRef = useRef<number>(0);

  // 3D Nucleus cluster points
  const nucleonsRef = useRef<NucleonPoint[]>([]);
  // 3D Electron Cloud probability density samples
  const cloudPointsRef = useRef<CloudSamplePoint[]>([]);
  // Stochastic Quantum Electrons (moving without fixed orbits)
  const quantumElectronsRef = useRef<QuantumElectronState[]>([]);

  // Sample a 3D point inside an s-orbital (spherical) or p-orbital (figure-8 dumbbell along x/y/z)
  const sampleOrbitalPosition = (
    shellR: number,
    orbitalType: 's' | 'px' | 'py' | 'pz' | 'd'
  ): { x: number; y: number; z: number } => {
    // Gaussian-like radial spread around shellR (representing ~90% probability density region)
    const u1 = Math.max(0.0001, Math.random());
    const u2 = Math.random();
    const normalRand = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

    if (orbitalType === 's') {
      // Spherical cloud (hình cầu)
      const r = Math.max(12, shellR * (0.78 + normalRand * 0.16));
      const cosTheta = 2 * Math.random() - 1;
      const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
      const phi = Math.random() * 2 * Math.PI;
      return {
        x: r * sinTheta * Math.cos(phi),
        y: r * sinTheta * Math.sin(phi),
        z: r * cosTheta,
      };
    }

    if (orbitalType === 'px' || orbitalType === 'py' || orbitalType === 'pz') {
      // Figure-8 dumbbell lobe (hình số 8 nổi theo trục X, Y hoặc Z)
      const sign = Math.random() < 0.5 ? 1 : -1;
      // Bias cosTheta toward 1 for dumbbell lobes (cos^2 theta angular probability)
      const lobeAngle = (Math.random() - 0.5) * 0.85;
      const phi = Math.random() * 2 * Math.PI;
      const dist = Math.max(10, shellR * (0.62 + Math.random() * 0.48));
      const axial = sign * dist * Math.cos(lobeAngle);
      const perp1 = dist * Math.sin(lobeAngle) * Math.cos(phi) * 0.52;
      const perp2 = dist * Math.sin(lobeAngle) * Math.sin(phi) * 0.52;

      if (orbitalType === 'px') return { x: axial, y: perp1, z: perp2 };
      if (orbitalType === 'py') return { x: perp1, y: axial, z: perp2 };
      return { x: perp1, y: perp2, z: axial };
    }

    // d/f cloverleaf 3D distribution
    const r = Math.max(14, shellR * (0.75 + normalRand * 0.15));
    const cosTheta = 2 * Math.random() - 1;
    const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
    const phi = Math.random() * 2 * Math.PI;
    return {
      x: r * sinTheta * Math.cos(phi),
      y: r * sinTheta * Math.sin(phi),
      z: r * cosTheta,
    };
  };

  useEffect(() => {
    // 1. Build 3D Nucleus
    const count = Math.min(34, Math.max(6, element.atomicNumber * 2));
    const points: NucleonPoint[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / Math.max(1, count - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      const rScale = 6 + Math.min(7, Math.cbrt(element.atomicNumber) * 1.6);
      points.push({
        x: Math.cos(theta) * radiusAtY * rScale * 0.75,
        y: y * rScale * 0.75,
        z: Math.sin(theta) * radiusAtY * rScale * 0.75,
        isProton: i % 2 === 0,
      });
    }
    nucleonsRef.current = points;

    // 2. Build 3D Electron Cloud probability density particles & non-orbital quantum electrons
    const shells = element.shells;
    const maxShells = Math.max(shells.length, 1);
    const minRadius = 32;
    const maxRadius = 92;
    const radiusStep = maxShells > 1 ? (maxRadius - minRadius) / (maxShells - 1) : 0;

    const cloudSamples: CloudSamplePoint[] = [];
    const qElectrons: QuantumElectronState[] = [];

    shells.forEach((elecCount, sIdx) => {
      const shellR = maxShells === 1 ? 58 : minRadius + sIdx * radiusStep;
      const isOuter = sIdx === shells.length - 1;

      // Determine orbital types present in this shell (first 2 electrons in s, next up to 6 in px, py, pz)
      const getOrbitalForIndex = (idx: number): 's' | 'px' | 'py' | 'pz' | 'd' => {
        if (sIdx === 0 || idx < 2) return 's';
        if (idx < 8) {
          const pAxes: ('px' | 'py' | 'pz')[] = ['px', 'py', 'pz'];
          return pAxes[(idx - 2) % 3];
        }
        return 'd';
      };

      // Generate probability cloud dots for this shell
      const dotsForShell = Math.min(140, 42 + elecCount * 8);
      for (let d = 0; d < dotsForShell; d++) {
        const orb = getOrbitalForIndex(d % Math.max(1, elecCount));
        const pos = sampleOrbitalPosition(shellR, orb);
        cloudSamples.push({
          x: pos.x,
          y: pos.y,
          z: pos.z,
          shellIdx: sIdx,
          orbitalType: orb,
          baseAlpha: isOuter ? 0.35 + Math.random() * 0.35 : 0.18 + Math.random() * 0.22,
          phase: Math.random() * Math.PI * 2,
        });
      }

      // Generate actual stochastic electrons for this shell (no fixed tracks!)
      for (let eIdx = 0; eIdx < elecCount; eIdx++) {
        const orb = getOrbitalForIndex(eIdx);
        const startPos = sampleOrbitalPosition(shellR, orb);
        qElectrons.push({
          shellIdx: sIdx,
          isOuter,
          orbitalType: orb,
          x: startPos.x,
          y: startPos.y,
          z: startPos.z,
          vx: (Math.random() - 0.5) * 160,
          vy: (Math.random() - 0.5) * 160,
          vz: (Math.random() - 0.5) * 160,
          history: [{ x: startPos.x, y: startPos.y, z: startPos.z }],
          jumpTimer: Math.random() * 0.15,
        });
      }
    });

    cloudPointsRef.current = cloudSamples;
    quantumElectronsRef.current = qElectrons;
  }, [element]);

  const handleResetCamera = () => {
    rotationRef.current = { rotX: 0.42, rotY: -0.45 };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const rotate3D = (
      x: number,
      y: number,
      z: number,
      rx: number,
      ry: number,
      rz: number
    ) => {
      const x1 = x * Math.cos(rz) - y * Math.sin(rz);
      const y1 = x * Math.sin(rz) + y * Math.cos(rz);
      const z1 = z;

      const y2 = y1 * Math.cos(rx) - z1 * Math.sin(rx);
      const z2 = y1 * Math.sin(rx) + z1 * Math.cos(rx);
      const x2 = x1;

      const x3 = x2 * Math.cos(ry) + z2 * Math.sin(ry);
      const z3 = -x2 * Math.sin(ry) + z2 * Math.cos(ry);
      const y3 = y2;

      return { x: x3, y: y3, z: z3 };
    };

    const renderFrame = (now: number) => {
      const dt = Math.min(0.05, (now - lastTimestamp) / 1000);
      lastTimestamp = now;

      if (isPlaying) {
        timeRef.current += dt * speedMultiplier;
        if (!isDraggingRef.current) {
          rotationRef.current.rotY += dt * 0.22 * speedMultiplier;
        }
      }

      const dpr = window.devicePixelRatio || 1;
      const width = 265;
      const height = 240;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const focalLength = 340;

      const camRx = rotationRef.current.rotX;
      const camRy = rotationRef.current.rotY;

      const shells = element.shells;
      const maxShells = Math.max(shells.length, 1);
      const minRadius = 32;
      const maxRadius = 92;
      const radiusStep = maxShells > 1 ? (maxRadius - minRadius) / (maxShells - 1) : 0;

      // Ambient quantum probability glow around nucleus
      const outerR = maxShells === 1 ? 65 : maxRadius + 14;
      const bgGlow = ctx.createRadialGradient(cx, cy, 4, cx, cy, outerR);
      if (modelMode === 'modern_cloud') {
        bgGlow.addColorStop(0, 'rgba(56, 189, 248, 0.34)');
        bgGlow.addColorStop(0.45, 'rgba(56, 189, 248, 0.14)');
        bgGlow.addColorStop(0.8, 'rgba(99, 102, 241, 0.06)');
        bgGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else if (modelMode === 'modern_ao') {
        bgGlow.addColorStop(0, 'rgba(168, 85, 247, 0.28)');
        bgGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.12)');
        bgGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else {
        bgGlow.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
        bgGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
      }
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Draw 3D Cartesian axes (X, Y, Z) in Modern Cloud & AO modes to emphasize 3D space
      if (modelMode === 'modern_cloud' || modelMode === 'modern_ao') {
        const axisLen = 104;
        const axes = [
          { x: axisLen, y: 0, z: 0, label: 'x', color: 'rgba(248, 113, 113, 0.45)' },
          { x: 0, y: -axisLen, z: 0, label: 'z', color: 'rgba(56, 189, 248, 0.45)' },
          { x: 0, y: 0, z: axisLen, label: 'y', color: 'rgba(52, 211, 153, 0.45)' },
        ];
        axes.forEach((ax) => {
          const pPos = rotate3D(ax.x, ax.y, ax.z, camRx, camRy, 0);
          const pNeg = rotate3D(-ax.x, -ax.y, -ax.z, camRx, camRy, 0);
          const sPos = focalLength / (focalLength + pPos.z);
          const sNeg = focalLength / (focalLength + pNeg.z);

          ctx.beginPath();
          ctx.setLineDash([2, 3]);
          ctx.moveTo(cx + pNeg.x * sNeg, cy + pNeg.y * sNeg);
          ctx.lineTo(cx + pPos.x * sPos, cy + pPos.y * sPos);
          ctx.strokeStyle = ax.color;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.font = '700 9px "JetBrains Mono", monospace';
          ctx.fillStyle = ax.color.replace('0.45', '0.85');
          ctx.fillText(ax.label, cx + pPos.x * sPos + 4, cy + pPos.y * sPos - 3);
        });
      }

      // Draw soft 90% probability boundary halo in Modern Cloud / AO mode
      if (modelMode === 'modern_cloud') {
        shells.forEach((_, sIdx) => {
          const isHighlighted = highlightedShell === null || highlightedShell === sIdx;
          if (!isHighlighted) return;
          const shellR = maxShells === 1 ? 58 : minRadius + sIdx * radiusStep;
          const isOuter = sIdx === shells.length - 1;
          ctx.beginPath();
          ctx.arc(cx, cy, shellR, 0, Math.PI * 2);
          ctx.strokeStyle = isOuter
            ? 'rgba(56, 189, 248, 0.22)'
            : 'rgba(148, 163, 184, 0.09)';
          ctx.setLineDash([1, 5]);
          ctx.lineWidth = isOuter ? 1.2 : 0.8;
          ctx.stroke();
          ctx.setLineDash([]);
        });
      }

      // In AO mode, draw 3D figure-8 lobes (AO p) and spherical AO s boundary
      if (modelMode === 'modern_ao') {
        // Draw AO s spherical contour
        const sRadius = maxShells === 1 ? 56 : minRadius + (shells.length - 1) * radiusStep * 0.78;
        ctx.beginPath();
        ctx.arc(cx, cy, sRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.07)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.32)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // If element has p electrons (Z > 4), draw 3D dumbbell lobes along X, Y, Z
        if (element.atomicNumber >= 5) {
          const lobeLen = maxRadius * 0.96;
          const pAxes: { dir: [number, number, number]; color: string }[] = [
            { dir: [1, 0, 0], color: 'rgba(251, 146, 60, 0.34)' }, // px (amber)
            { dir: [0, 1, 0], color: 'rgba(168, 85, 247, 0.34)' }, // pz (purple)
            { dir: [0, 0, 1], color: 'rgba(52, 211, 153, 0.34)' }, // py (emerald)
          ];

          pAxes.forEach(({ dir, color }) => {
            [-1, 1].forEach((sign) => {
              const steps = 40;
              ctx.beginPath();
              for (let i = 0; i <= steps; i++) {
                const t = (i / steps) * Math.PI;
                // Lemniscate / dumbbell polar profile
                const r = lobeLen * Math.sin(t);
                const along = sign * r * Math.sin(t);
                const perp = r * Math.cos(t) * 0.42;

                const lx = dir[0] ? along : perp;
                const ly = dir[1] ? along : dir[0] ? perp : 0;
                const lz = dir[2] ? along : dir[1] ? perp : 0;

                const world = rotate3D(lx, ly, lz, camRx, camRy, 0);
                const pScale = focalLength / (focalLength + world.z);
                const px = cx + world.x * pScale;
                const py = cy + world.y * pScale;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.closePath();
              ctx.fillStyle = color.replace('0.34', '0.09');
              ctx.fill();
              ctx.strokeStyle = color;
              ctx.lineWidth = 1.1;
              ctx.stroke();
            });
          });
        }
      }

      interface RenderParticle {
        type: 'cloud_dot' | 'electron' | 'nucleon';
        x2d: number;
        y2d: number;
        z3d: number;
        scale: number;
        isOuter?: boolean;
        shellIdx?: number;
        orbitalType?: 's' | 'px' | 'py' | 'pz' | 'd';
        alpha?: number;
        isProton?: boolean;
        trail2d?: { x: number; y: number }[];
      }

      const particles: RenderParticle[] = [];

      if (modelMode === 'modern_cloud' || modelMode === 'modern_ao') {
        // 1. Add 3D Electron Cloud probability density micro-dots
        cloudPointsRef.current.forEach((pt) => {
          const isHighlighted = highlightedShell === null || highlightedShell === pt.shellIdx;
          const world = rotate3D(pt.x, pt.y, pt.z, camRx, camRy, 0);
          const pScale = focalLength / (focalLength + world.z);
          const shimmer = 0.75 + 0.25 * Math.sin(timeRef.current * 4 + pt.phase);

          particles.push({
            type: 'cloud_dot',
            x2d: cx + world.x * pScale,
            y2d: cy + world.y * pScale,
            z3d: world.z,
            scale: pScale,
            shellIdx: pt.shellIdx,
            orbitalType: pt.orbitalType,
            isOuter: pt.shellIdx === shells.length - 1,
            alpha: isHighlighted ? pt.baseAlpha * shimmer : 0.04,
          });
        });

        // 2. Update & add stochastic quantum electrons (NO fixed circular tracks!)
        quantumElectronsRef.current.forEach((qe) => {
          const shellR = maxShells === 1 ? 58 : minRadius + qe.shellIdx * radiusStep;

          if (isPlaying) {
            qe.jumpTimer -= dt * speedMultiplier;
            if (qe.jumpTimer <= 0) {
              // Quantum jump / rapid stochastic redirection within the orbital cloud
              const target = sampleOrbitalPosition(
                shellR,
                modelMode === 'modern_ao' ? qe.orbitalType : 's'
              );
              const pullFactor = 6.5 * speedMultiplier;
              qe.vx = (target.x - qe.x) * pullFactor + (Math.random() - 0.5) * 190;
              qe.vy = (target.y - qe.y) * pullFactor + (Math.random() - 0.5) * 190;
              qe.vz = (target.z - qe.z) * pullFactor + (Math.random() - 0.5) * 190;
              qe.jumpTimer = 0.04 + Math.random() * 0.08;
            }

            qe.x += qe.vx * dt;
            qe.y += qe.vy * dt;
            qe.z += qe.vz * dt;

            // Keep inside reasonable probability cloud radius
            const currentDist = Math.sqrt(qe.x * qe.x + qe.y * qe.y + qe.z * qe.z);
            if (currentDist > shellR * 1.22 || currentDist < 12) {
              const resetPos = sampleOrbitalPosition(
                shellR,
                modelMode === 'modern_ao' ? qe.orbitalType : 's'
              );
              qe.x = resetPos.x;
              qe.y = resetPos.y;
              qe.z = resetPos.z;
            }

            qe.history.push({ x: qe.x, y: qe.y, z: qe.z });
            if (qe.history.length > 5) {
              qe.history.shift();
            }
          }

          const world = rotate3D(qe.x, qe.y, qe.z, camRx, camRy, 0);
          const pScale = focalLength / (focalLength + world.z);

          const trail2d = qe.history.map((h) => {
            const hw = rotate3D(h.x, h.y, h.z, camRx, camRy, 0);
            const hs = focalLength / (focalLength + hw.z);
            return { x: cx + hw.x * hs, y: cy + hw.y * hs };
          });

          particles.push({
            type: 'electron',
            x2d: cx + world.x * pScale,
            y2d: cy + world.y * pScale,
            z3d: world.z,
            scale: pScale,
            isOuter: qe.isOuter,
            shellIdx: qe.shellIdx,
            orbitalType: qe.orbitalType,
            trail2d,
          });
        });
      } else {
        // Mode 3: Classical Rutherford-Bohr 3D orbits for comparison
        shells.forEach((elecCount, sIdx) => {
          const shellR = maxShells === 1 ? 58 : minRadius + sIdx * radiusStep;
          const isOuter = sIdx === shells.length - 1;
          const isHighlighted = highlightedShell === null || highlightedShell === sIdx;
          const shellTiltX = (sIdx * Math.PI) / Math.max(2.6, shells.length) + 0.3;
          const shellTiltZ = ((sIdx % 3) - 1) * 0.55;

          const segments = 60;
          ctx.beginPath();
          for (let i = 0; i <= segments; i++) {
            const theta = (2 * Math.PI * i) / segments;
            const lx = shellR * Math.cos(theta);
            const ly = shellR * Math.sin(theta);
            const tilted = rotate3D(lx, ly, 0, shellTiltX, 0, shellTiltZ);
            const world = rotate3D(tilted.x, tilted.y, tilted.z, camRx, camRy, 0);
            const pScale = focalLength / (focalLength + world.z);
            const px = cx + world.x * pScale;
            const py = cy + world.y * pScale;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.strokeStyle = !isHighlighted
            ? 'rgba(148, 163, 184, 0.1)'
            : isOuter
            ? 'rgba(56, 189, 248, 0.65)'
            : 'rgba(148, 163, 184, 0.32)';
          ctx.lineWidth = isOuter ? 1.5 : 1;
          ctx.stroke();

          const angularSpeed = (1.6 - sIdx * 0.16) * (sIdx % 2 === 0 ? 1 : -1);
          for (let eIdx = 0; eIdx < elecCount; eIdx++) {
            const baseAngle = (2 * Math.PI * eIdx) / elecCount + timeRef.current * angularSpeed;
            const lx = shellR * Math.cos(baseAngle);
            const ly = shellR * Math.sin(baseAngle);
            const tilted = rotate3D(lx, ly, 0, shellTiltX, 0, shellTiltZ);
            const world = rotate3D(tilted.x, tilted.y, tilted.z, camRx, camRy, 0);
            const pScale = focalLength / (focalLength + world.z);

            particles.push({
              type: 'electron',
              x2d: cx + world.x * pScale,
              y2d: cy + world.y * pScale,
              z3d: world.z,
              scale: pScale,
              isOuter,
              shellIdx: sIdx,
            });
          }
        });
      }

      // 3. Add 3D Nucleus Cluster Particles
      nucleonsRef.current.forEach((n) => {
        const world = rotate3D(n.x, n.y, n.z, camRx, camRy, 0);
        const pScale = focalLength / (focalLength + world.z);
        particles.push({
          type: 'nucleon',
          x2d: cx + world.x * pScale,
          y2d: cy + world.y * pScale,
          z3d: world.z,
          scale: pScale,
          isProton: n.isProton,
        });
      });

      // Depth-sort back to front
      particles.sort((a, b) => b.z3d - a.z3d);

      // 4. Render all depth-sorted 3D items
      particles.forEach((p) => {
        if (p.type === 'cloud_dot') {
          const dotR = Math.max(0.9, (p.isOuter ? 1.8 : 1.3) * p.scale);
          ctx.beginPath();
          ctx.arc(p.x2d, p.y2d, dotR, 0, Math.PI * 2);

          if (modelMode === 'modern_ao') {
            if (p.orbitalType === 's') {
              ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
            } else if (p.orbitalType === 'px') {
              ctx.fillStyle = `rgba(251, 146, 60, ${p.alpha})`;
            } else if (p.orbitalType === 'py') {
              ctx.fillStyle = `rgba(52, 211, 153, ${p.alpha})`;
            } else {
              ctx.fillStyle = `rgba(192, 132, 252, ${p.alpha})`;
            }
          } else {
            ctx.fillStyle = p.isOuter
              ? `rgba(56, 189, 248, ${p.alpha})`
              : `rgba(148, 163, 184, ${p.alpha})`;
          }
          ctx.fill();
        } else if (p.type === 'nucleon') {
          const r = 3.8 * p.scale;
          const grad = ctx.createRadialGradient(
            p.x2d - r * 0.3,
            p.y2d - r * 0.3,
            r * 0.1,
            p.x2d,
            p.y2d,
            r
          );
          if (p.isProton) {
            grad.addColorStop(0, '#fca5a5');
            grad.addColorStop(0.5, '#ef4444');
            grad.addColorStop(1, '#7f1d1d');
          } else {
            grad.addColorStop(0, '#bae6fd');
            grad.addColorStop(0.5, '#0284c7');
            grad.addColorStop(1, '#1e3a8a');
          }
          ctx.beginPath();
          ctx.arc(p.x2d, p.y2d, r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        } else {
          // Electron particle
          const isHighlighted =
            highlightedShell === null || highlightedShell === p.shellIdx;
          const baseR = p.isOuter ? 4.2 : 3.0;
          const r = Math.max(1.8, baseR * p.scale);
          const alpha = !isHighlighted
            ? 0.14
            : Math.min(1, Math.max(0.4, 0.8 - p.z3d / 220));

          // Draw stochastic quantum motion flash trail (showing rapid non-orbital movement)
          if (isHighlighted && p.trail2d && p.trail2d.length > 1) {
            ctx.beginPath();
            p.trail2d.forEach((pt, idx) => {
              if (idx === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            });
            ctx.strokeStyle = p.isOuter
              ? `rgba(56, 189, 248, ${alpha * 0.42})`
              : `rgba(226, 232, 240, ${alpha * 0.25})`;
            ctx.lineWidth = p.isOuter ? 1.5 : 1;
            ctx.stroke();
          }

          if (p.isOuter && isHighlighted) {
            ctx.beginPath();
            ctx.arc(p.x2d, p.y2d, r * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.35})`;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(p.x2d, p.y2d, r, 0, Math.PI * 2);
          if (modelMode === 'modern_ao' && p.orbitalType && p.orbitalType !== 's') {
            ctx.fillStyle =
              p.orbitalType === 'px'
                ? `rgba(251, 146, 60, ${alpha})`
                : p.orbitalType === 'py'
                ? `rgba(52, 211, 153, ${alpha})`
                : `rgba(192, 132, 252, ${alpha})`;
          } else {
            ctx.fillStyle = p.isOuter
              ? `rgba(56, 189, 248, ${alpha})`
              : `rgba(241, 245, 249, ${alpha})`;
          }
          ctx.fill();
        }
      });

      // Central nuclear charge label
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 4;
      ctx.fillText(`+${element.atomicNumber}`, cx, cy);
      ctx.shadowBlur = 0;

      ctx.restore();
      animationFrameId = requestAnimationFrame(renderFrame);
    };

    animationFrameId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animationFrameId);
  }, [element, isPlaying, modelMode, speedMultiplier, highlightedShell]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    rotationRef.current.rotY += dx * 0.012;
    rotationRef.current.rotX = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, rotationRef.current.rotX + dy * 0.012)
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 relative overflow-hidden">
      {/* Top Controls Bar inside 3D Viewer */}
      <div className="flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex flex-wrap items-center gap-1 bg-white/10 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setModelMode('modern_cloud')}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              modelMode === 'modern_cloud'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Hiện đại (Đám mây e)</span>
          </button>
          <button
            type="button"
            onClick={() => setModelMode('modern_ao')}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              modelMode === 'modern_ao'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Orbital AO (s / p)</span>
          </button>
          <button
            type="button"
            onClick={() => setModelMode('bohr_compare')}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              modelMode === 'bohr_compare'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Orbit className="w-3 h-3" />
            <span>Bohr</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              setSpeedMultiplier((prev) => (prev === 1 ? 2 : prev === 2 ? 0.5 : 1))
            }
            title="Đổi tốc độ chuyển động electron"
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-mono font-bold text-sky-300 transition-colors cursor-pointer"
          >
            {speedMultiplier}x
          </button>
          <button
            type="button"
            onClick={handleResetCamera}
            title="Đặt lại góc nhìn 3D"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Tạm dừng' : 'Tiếp tục'}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Main 3D Canvas + Interactive Shell Cloud Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex flex-col items-center shrink-0">
          <canvas
            ref={canvasRef}
            width={265}
            height={240}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-[245px] h-[220px] cursor-grab active:cursor-grabbing touch-none select-none"
            aria-label={`Mô hình nguyên tử hiện đại 3D của ${element.name}`}
          />
          <span className="text-[10px] text-slate-400 -mt-1">
            Kéo chuột trên hình để xoay đám mây electron 3D 360°
          </span>
        </div>

        {/* Interactive Shell Probability Cloud List */}
        <div className="flex-1 w-full space-y-1.5 text-xs">
          <div className="font-semibold text-sky-300 text-[11px]">
            {modelMode === 'bohr_compare'
              ? `${element.shells.length} lớp quỹ đạo Bohr:`
              : `Mật độ đám mây (${element.shells.length} lớp):`}
          </div>
          <div className="space-y-1 max-h-[145px] overflow-y-auto pr-1">
            {element.shells.map((count, i) => {
              const isOuter = i === element.shells.length - 1;
              const isHovered = highlightedShell === i;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredShell(i)}
                  onMouseLeave={() => setHoveredShell(null)}
                  className={`flex items-center justify-between px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                    isHovered
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : isOuter
                      ? 'bg-sky-500/25 border border-sky-400/50 text-white font-semibold'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <span>
                    {SHELL_NAMES[i]} {isOuter ? '(Ngoài)' : ''}
                  </span>
                  <span className="font-mono tabular-nums font-bold">{count}e</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SGK Hoa 10 Explanation Note for Modern Atomic Model */}
      <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 leading-relaxed">
        {modelMode === 'modern_cloud' && (
          <span>
            <strong className="text-sky-300">Mô hình hiện đại:</strong> Các electron chuyển động{' '}
            <strong className="text-white">rất nhanh</strong> quanh hạt nhân và{' '}
            <strong className="text-white">không theo những quỹ đạo cố định</strong>, tạo thành{' '}
            <strong className="text-sky-300">đám mây electron</strong> (vùng có xác suất tìm thấy electron khoảng 90%).
          </span>
        )}
        {modelMode === 'modern_ao' && (
          <span>
            <strong className="text-sky-300">Orbital nguyên tử (AO):</strong>{' '}
            <strong className="text-sky-300">AO s</strong> có dạng hình cầu; các{' '}
            <strong className="text-amber-300">AO p (px, py, pz)</strong> có dạng hình số 8 nổi định hướng theo 3 trục không gian <span className="font-mono">x, y, z</span>.
          </span>
        )}
        {modelMode === 'bohr_compare' && (
          <span>
            <strong className="text-sky-300">Mô hình Rutherford–Bohr (So sánh):</strong> Biểu diễn đơn giản hóa các electron quay trên những quỹ đạo tròn/bầu dục xác định theo từng lớp <span className="font-mono">K, L, M...</span>
          </span>
        )}
      </div>
    </div>
  );
};
