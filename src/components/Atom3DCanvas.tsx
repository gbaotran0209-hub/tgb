import React, { useEffect, useRef, useState } from 'react';
import { ChemicalElement } from '../data/elements';
import { Play, Pause, RotateCcw, Sparkles, Compass, Orbit, Flame } from 'lucide-react';

interface Atom3DCanvasProps {
  element: ChemicalElement;
}

const SHELL_NAMES = ['K (n=1)', 'L (n=2)', 'M (n=3)', 'N (n=4)', 'O (n=5)', 'P (n=6)', 'Q (n=7)'];

interface NucleonPoint {
  x: number;
  y: number;
  z: number;
  isProton: boolean;
  phase: number;
}

interface DynamicCloudParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  shellIdx: number;
  shellR: number;
  isOuter: boolean;
  orbitalType: 's' | 'px' | 'py' | 'pz' | 'd';
  baseAlpha: number;
  size: number;
  phase: number;
  pulseSpeed: number;
  life: number;
  maxLife: number;
}

interface QuantumElectronState {
  shellIdx: number;
  shellR: number;
  isOuter: boolean;
  orbitalType: 's' | 'px' | 'py' | 'pz' | 'd';
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  history: { x: number; y: number; z: number }[];
  retargetTimer: number;
  flashAlpha: number;
}

type ModelMode = 'modern_cloud' | 'modern_ao' | 'bohr_compare';
type CloudDensityPreset = 'normal' | 'high';

export const Atom3DCanvas: React.FC<Atom3DCanvasProps> = ({ element }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [modelMode, setModelMode] = useState<ModelMode>('modern_cloud');
  const [cloudDensity, setCloudDensity] = useState<CloudDensityPreset>('high');
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
  // Dynamic 3D Electron Cloud probability density swarm particles
  const cloudParticlesRef = useRef<DynamicCloudParticle[]>([]);
  // High-energy Quantum Electrons with wave-packet trails (moving without fixed orbits)
  const quantumElectronsRef = useRef<QuantumElectronState[]>([]);

  // Sample a 3D point inside an s-orbital (spherical), p-orbital (figure-8 dumbbell), or d-orbital (cloverleaf)
  // representing the quantum probability density |ψ(r, θ, φ)|²
  const sampleOrbitalPosition = (
    shellR: number,
    orbitalType: 's' | 'px' | 'py' | 'pz' | 'd'
  ): { x: number; y: number; z: number } => {
    // Box-Muller Gaussian radial spread around shellR (90% probability density shell)
    const u1 = Math.max(0.0001, Math.random());
    const u2 = Math.random();
    const normalRand = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

    if (orbitalType === 's') {
      // Spherical wave-function cloud (AO s hình cầu)
      const r = Math.max(11, shellR * (0.82 + normalRand * 0.18));
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
      // Figure-8 dumbbell lobe (AO p hình số 8 nổi theo trục X, Y hoặc Z)
      const sign = Math.random() < 0.5 ? 1 : -1;
      // Angular distribution weighted by cos²(θ)
      const lobeAngle = (Math.random() - 0.5) * 0.82;
      const phi = Math.random() * 2 * Math.PI;
      const dist = Math.max(10, shellR * (0.58 + Math.random() * 0.52));
      const axial = sign * dist * Math.cos(lobeAngle);
      const perp1 = dist * Math.sin(lobeAngle) * Math.cos(phi) * 0.48;
      const perp2 = dist * Math.sin(lobeAngle) * Math.sin(phi) * 0.48;

      if (orbitalType === 'px') return { x: axial, y: perp1, z: perp2 };
      if (orbitalType === 'py') return { x: perp1, y: axial, z: perp2 };
      return { x: perp1, y: perp2, z: axial };
    }

    // d/f 4-lobe cloverleaf probability distribution
    const r = Math.max(13, shellR * (0.78 + normalRand * 0.16));
    const quadAngle = (Math.floor(Math.random() * 4) * Math.PI) / 2 + (Math.random() - 0.5) * 0.55;
    const zSpread = (Math.random() - 0.5) * shellR * 0.45;
    return {
      x: r * Math.cos(quadAngle),
      y: r * Math.sin(quadAngle),
      z: zSpread,
    };
  };

  useEffect(() => {
    // 1. Build 3D Nucleus with subtle thermal/quantum vibration phase
    const count = Math.min(36, Math.max(6, element.atomicNumber * 2));
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
        phase: Math.random() * Math.PI * 2,
      });
    }
    nucleonsRef.current = points;

    // 2. Build Dynamic 3D Electron Cloud Particle Swarm & Quantum Electrons
    const shells = element.shells;
    const maxShells = Math.max(shells.length, 1);
    const minRadius = 30;
    const maxRadius = 92;
    const radiusStep = maxShells > 1 ? (maxRadius - minRadius) / (maxShells - 1) : 0;

    const cloudSwarm: DynamicCloudParticle[] = [];
    const qElectrons: QuantumElectronState[] = [];
    const densityFactor = cloudDensity === 'high' ? 1.45 : 1.0;

    shells.forEach((elecCount, sIdx) => {
      const shellR = maxShells === 1 ? 58 : minRadius + sIdx * radiusStep;
      const isOuter = sIdx === shells.length - 1;

      const getOrbitalForIndex = (idx: number): 's' | 'px' | 'py' | 'pz' | 'd' => {
        if (sIdx === 0 || idx < 2) return 's';
        if (idx < 8) {
          const pAxes: ('px' | 'py' | 'pz')[] = ['px', 'py', 'pz'];
          return pAxes[(idx - 2) % 3];
        }
        return 'd';
      };

      // Generate moving probability cloud micro-particles for this shell
      const baseDots = Math.min(200, Math.round((56 + elecCount * 10) * densityFactor));
      for (let d = 0; d < baseDots; d++) {
        const orb = getOrbitalForIndex(d % Math.max(1, elecCount));
        const pos = sampleOrbitalPosition(shellR, orb);
        // Tangential swirl velocity + radial quantum fluctuation
        const speed = 14 + Math.random() * 26;
        cloudSwarm.push({
          x: pos.x,
          y: pos.y,
          z: pos.z,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          vz: (Math.random() - 0.5) * speed,
          shellIdx: sIdx,
          shellR,
          isOuter,
          orbitalType: orb,
          baseAlpha: isOuter ? 0.42 + Math.random() * 0.42 : 0.22 + Math.random() * 0.26,
          size: isOuter ? 1.3 + Math.random() * 1.2 : 0.9 + Math.random() * 0.8,
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: 2.5 + Math.random() * 3.5,
          life: Math.random() * 1.8,
          maxLife: 1.4 + Math.random() * 1.8,
        });
      }

      // Generate primary quantum electrons moving continuously through the probability cloud
      for (let eIdx = 0; eIdx < elecCount; eIdx++) {
        const orb = getOrbitalForIndex(eIdx);
        const startPos = sampleOrbitalPosition(shellR, orb);
        const targetPos = sampleOrbitalPosition(shellR, orb);
        qElectrons.push({
          shellIdx: sIdx,
          shellR,
          isOuter,
          orbitalType: orb,
          x: startPos.x,
          y: startPos.y,
          z: startPos.z,
          vx: (Math.random() - 0.5) * 90,
          vy: (Math.random() - 0.5) * 90,
          vz: (Math.random() - 0.5) * 90,
          targetX: targetPos.x,
          targetY: targetPos.y,
          targetZ: targetPos.z,
          history: [{ x: startPos.x, y: startPos.y, z: startPos.z }],
          retargetTimer: 0.08 + Math.random() * 0.14,
          flashAlpha: 0,
        });
      }
    });

    cloudParticlesRef.current = cloudSwarm;
    quantumElectronsRef.current = qElectrons;
  }, [element, cloudDensity]);

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
          rotationRef.current.rotY += dt * 0.24 * speedMultiplier;
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
      const minRadius = 30;
      const maxRadius = 92;
      const radiusStep = maxShells > 1 ? (maxRadius - minRadius) / (maxShells - 1) : 0;

      // 1. Volumetric Radial Probability Density Halo (No static hard circle lines in cloud mode!)
      const outerR = maxShells === 1 ? 68 : maxRadius + 18;
      const bgGlow = ctx.createRadialGradient(cx, cy, 3, cx, cy, outerR);
      if (modelMode === 'modern_cloud') {
        bgGlow.addColorStop(0, 'rgba(56, 189, 248, 0.38)');
        bgGlow.addColorStop(0.35, 'rgba(56, 189, 248, 0.16)');
        bgGlow.addColorStop(0.7, 'rgba(99, 102, 241, 0.08)');
        bgGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else if (modelMode === 'modern_ao') {
        bgGlow.addColorStop(0, 'rgba(168, 85, 247, 0.32)');
        bgGlow.addColorStop(0.45, 'rgba(56, 189, 248, 0.14)');
        bgGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else {
        bgGlow.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
        bgGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
      }
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Soft volumetric shell probability bands when hovering a specific shell
      if (modelMode !== 'bohr_compare' && highlightedShell !== null) {
        const targetR = maxShells === 1 ? 58 : minRadius + highlightedShell * radiusStep;
        const bandGrad = ctx.createRadialGradient(
          cx,
          cy,
          Math.max(4, targetR - 14),
          cx,
          cy,
          targetR + 14
        );
        bandGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        bandGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.22)');
        bandGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = bandGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw 3D Cartesian axes (X, Y, Z) in Modern Cloud & AO modes to anchor 3D perception
      if (modelMode === 'modern_cloud' || modelMode === 'modern_ao') {
        const axisLen = 104;
        const axes = [
          { x: axisLen, y: 0, z: 0, label: 'x', color: 'rgba(248, 113, 113, 0.42)' },
          { x: 0, y: -axisLen, z: 0, label: 'z', color: 'rgba(56, 189, 248, 0.42)' },
          { x: 0, y: 0, z: axisLen, label: 'y', color: 'rgba(52, 211, 153, 0.42)' },
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
          ctx.fillStyle = ax.color.replace('0.42', '0.88');
          ctx.fillText(ax.label, cx + pPos.x * sPos + 4, cy + pPos.y * sPos - 3);
        });
      }

      // In AO mode, draw soft translucent 3D figure-8 lobes (AO p)
      if (modelMode === 'modern_ao' && element.atomicNumber >= 5) {
        const lobeLen = maxRadius * 0.96;
        const pAxes: { dir: [number, number, number]; color: string }[] = [
          { dir: [1, 0, 0], color: 'rgba(251, 146, 60, 0.28)' }, // px (amber)
          { dir: [0, 1, 0], color: 'rgba(168, 85, 247, 0.28)' }, // pz (purple)
          { dir: [0, 0, 1], color: 'rgba(52, 211, 153, 0.28)' }, // py (emerald)
        ];

        pAxes.forEach(({ dir, color }) => {
          [-1, 1].forEach((sign) => {
            const steps = 36;
            ctx.beginPath();
            for (let i = 0; i <= steps; i++) {
              const t = (i / steps) * Math.PI;
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
            ctx.fillStyle = color.replace('0.28', '0.07');
            ctx.fill();
          });
        });
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
        size?: number;
        isProton?: boolean;
        trail2d?: { x: number; y: number }[];
        flashAlpha?: number;
      }

      const particles: RenderParticle[] = [];

      if (modelMode === 'modern_cloud' || modelMode === 'modern_ao') {
        // 1. Update & add Dynamic 3D Probability Cloud Micro-Particles
        cloudParticlesRef.current.forEach((pt) => {
          if (isPlaying) {
            const effDt = dt * speedMultiplier;
            pt.life += effDt;

            // Quantum scintillation & stochastic respawn inside the orbital probability volume
            if (pt.life >= pt.maxLife) {
              const nextPos = sampleOrbitalPosition(
                pt.shellR,
                modelMode === 'modern_ao' ? pt.orbitalType : 's'
              );
              pt.x = nextPos.x;
              pt.y = nextPos.y;
              pt.z = nextPos.z;
              pt.life = 0;
              pt.maxLife = 1.2 + Math.random() * 1.8;
            } else {
              // Continuous 3D tangential swirl + harmonic radial wave-function breathing
              const swirlSpeed = (pt.isOuter ? 0.95 : 1.35) * effDt;
              const cosS = Math.cos(swirlSpeed);
              const sinS = Math.sin(swirlSpeed);
              const nx = pt.x * cosS - pt.z * sinS;
              const nz = pt.x * sinS + pt.z * cosS;
              pt.x = nx + pt.vx * effDt * 0.35;
              pt.y = pt.y + pt.vy * effDt * 0.35;
              pt.z = nz + pt.vz * effDt * 0.35;

              // Gently pull back toward the shell's maximum probability density radius
              const dist = Math.sqrt(pt.x * pt.x + pt.y * pt.y + pt.z * pt.z) || 1;
              const radialCorrection = (pt.shellR * 0.86 - dist) * 1.8 * effDt;
              pt.x += (pt.x / dist) * radialCorrection;
              pt.y += (pt.y / dist) * radialCorrection;
              pt.z += (pt.z / dist) * radialCorrection;
            }
          }

          const isHighlighted = highlightedShell === null || highlightedShell === pt.shellIdx;
          const world = rotate3D(pt.x, pt.y, pt.z, camRx, camRy, 0);
          const pScale = focalLength / (focalLength + world.z);

          // Smooth fade-in and fade-out envelope over particle quantum lifetime
          const lifeRatio = pt.life / pt.maxLife;
          const envelope = Math.sin(lifeRatio * Math.PI);
          const shimmer = 0.7 + 0.3 * Math.sin(timeRef.current * pt.pulseSpeed + pt.phase);

          particles.push({
            type: 'cloud_dot',
            x2d: cx + world.x * pScale,
            y2d: cy + world.y * pScale,
            z3d: world.z,
            scale: pScale,
            shellIdx: pt.shellIdx,
            orbitalType: pt.orbitalType,
            isOuter: pt.isOuter,
            size: pt.size,
            alpha: isHighlighted ? pt.baseAlpha * envelope * shimmer : 0.03,
          });
        });

        // 2. Update & add High-Velocity Stochastic Quantum Electrons (with smooth 3D wave trails)
        quantumElectronsRef.current.forEach((qe) => {
          if (isPlaying) {
            const effDt = dt * speedMultiplier;
            qe.retargetTimer -= effDt;
            qe.flashAlpha = Math.max(0, qe.flashAlpha - effDt * 2.5);

            if (qe.retargetTimer <= 0) {
              const target = sampleOrbitalPosition(
                qe.shellR,
                modelMode === 'modern_ao' ? qe.orbitalType : 's'
              );
              qe.targetX = target.x;
              qe.targetY = target.y;
              qe.targetZ = target.z;
              qe.retargetTimer = 0.06 + Math.random() * 0.11;
              qe.flashAlpha = 0.9;
            }

            // Smooth spring-like quantum acceleration toward target wave-packet lobe
            const pull = 14.0;
            qe.vx = qe.vx * 0.82 + (qe.targetX - qe.x) * pull * effDt * 12;
            qe.vy = qe.vy * 0.82 + (qe.targetY - qe.y) * pull * effDt * 12;
            qe.vz = qe.vz * 0.82 + (qe.targetZ - qe.z) * pull * effDt * 12;

            qe.x += qe.vx * effDt;
            qe.y += qe.vy * effDt;
            qe.z += qe.vz * effDt;

            qe.history.push({ x: qe.x, y: qe.y, z: qe.z });
            if (qe.history.length > 7) {
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
            flashAlpha: qe.flashAlpha,
          });
        });
      } else {
        // Mode 3: Classical Rutherford-Bohr 3D orbits for comparison only
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

      // 3. Add 3D Nucleus Cluster Particles with subtle zero-point vibration
      nucleonsRef.current.forEach((n) => {
        const vib = isPlaying ? 0.35 * Math.sin(timeRef.current * 9 + n.phase) : 0;
        const world = rotate3D(n.x + vib, n.y - vib, n.z + vib, camRx, camRy, 0);
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
          const baseSize = p.size ?? (p.isOuter ? 1.8 : 1.2);
          const dotR = Math.max(0.8, baseSize * p.scale);
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
          const baseR = p.isOuter ? 4.0 : 2.9;
          const r = Math.max(1.8, baseR * p.scale);
          const alpha = !isHighlighted
            ? 0.14
            : Math.min(1, Math.max(0.42, 0.85 - p.z3d / 220));

          // Draw stochastic quantum wave-packet motion trail
          if (isHighlighted && p.trail2d && p.trail2d.length > 1) {
            ctx.beginPath();
            p.trail2d.forEach((pt, idx) => {
              if (idx === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            });
            ctx.strokeStyle = p.isOuter
              ? `rgba(56, 189, 248, ${alpha * 0.48})`
              : `rgba(226, 232, 240, ${alpha * 0.28})`;
            ctx.lineWidth = p.isOuter ? 1.6 : 1.1;
            ctx.stroke();
          }

          // Quantum jump probability ripple
          if (p.isOuter && isHighlighted && (p.flashAlpha ?? 0) > 0.05) {
            ctx.beginPath();
            ctx.arc(p.x2d, p.y2d, r * (2.2 + (1 - (p.flashAlpha ?? 0)) * 2.0), 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(125, 211, 252, ${(p.flashAlpha ?? 0) * 0.45})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          if (p.isOuter && isHighlighted) {
            ctx.beginPath();
            ctx.arc(p.x2d, p.y2d, r * 2.3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.38})`;
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
                : 'text-slate-200 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Đám mây hạt 3D</span>
          </button>
          <button
            type="button"
            onClick={() => setModelMode('modern_ao')}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              modelMode === 'modern_ao'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'text-slate-200 hover:text-white'
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
                : 'text-slate-200 hover:text-white'
            }`}
          >
            <Orbit className="w-3 h-3" />
            <span>Bohr</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {modelMode !== 'bohr_compare' && (
            <button
              type="button"
              onClick={() =>
                setCloudDensity((prev) => (prev === 'high' ? 'normal' : 'high'))
              }
              title="Đổi mật độ hạt đám mây xác suất electron"
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer border ${
                cloudDensity === 'high'
                  ? 'bg-sky-500/25 border-sky-400/60 text-sky-200'
                  : 'bg-white/10 border-white/10 text-slate-200'
              }`}
            >
              {cloudDensity === 'high' ? 'Mật độ: Cao' : 'Mật độ: Chuẩn'}
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              setSpeedMultiplier((prev) => (prev === 1 ? 2 : prev === 2 ? 0.5 : 1))
            }
            title="Đổi tốc độ chuyển động đám mây hạt electron"
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
            aria-label={`Mô hình đám mây xác suất electron 3D của ${element.name}`}
          />
          <span className="text-[10px] text-slate-300 -mt-1">
            Kéo chuột trên hình để xoay đám mây electron 3D 360°
          </span>
        </div>

        {/* Interactive Shell Probability Cloud List */}
        <div className="flex-1 w-full space-y-1.5 text-xs">
          <div className="font-semibold text-sky-300 text-[11px]">
            {modelMode === 'bohr_compare'
              ? `${element.shells.length} lớp quỹ đạo Bohr:`
              : `Mật độ xác suất |ψ|² (${element.shells.length} lớp):`}
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
                      : 'bg-white/5 hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <span>
                    {SHELL_NAMES[i]} {isOuter ? '(Hóa trị)' : ''}
                  </span>
                  <span className="font-mono tabular-nums font-bold">{count}e</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SGK Hoa 10 Explanation Note for Modern Atomic Model */}
      <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-200 leading-relaxed">
        {modelMode === 'modern_cloud' && (
          <span>
            <strong className="text-sky-300">Đám mây xác suất electron (|ψ|²):</strong> Các hạt vi mô chuyển động hỗn loạn 3D không theo quỹ đạo tĩnh; vùng hạt sáng càng dày đặc biểu thị xác suất tìm thấy electron càng lớn (≈ 90%).
          </span>
        )}
        {modelMode === 'modern_ao' && (
          <span>
            <strong className="text-sky-300">Orbital nguyên tử (AO):</strong>{' '}
            <strong className="text-sky-300">AO s</strong> có đám mây hạt hình cầu; các{' '}
            <strong className="text-amber-300">AO p (px, py, pz)</strong> có mật độ hạt tập trung thành hình số 8 nổi theo 3 trục <span className="font-mono">x, y, z</span>.
          </span>
        )}
        {modelMode === 'bohr_compare' && (
          <span>
            <strong className="text-sky-300">Mô hình Rutherford–Bohr (Đối chiếu):</strong> Biểu diễn cổ điển với các electron chuyển động trên quỹ đạo tròn xác định theo từng lớp <span className="font-mono">K, L, M...</span>
          </span>
        )}
      </div>
    </div>
  );
};
