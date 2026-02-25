import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Three.js 3D background layer — renders rotating spaceships, alien shapes,
 * and a glowing nebula behind the Phaser canvas. Transparent background
 * so the React starfield shows through.
 */
export function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // ── Scene setup ──
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── Lighting ──
    const ambientLight = new THREE.AmbientLight(0x222244, 0.5);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x4a9eff, 1.5, 100);
    blueLight.position.set(-15, 8, 10);
    scene.add(blueLight);

    const redLight = new THREE.PointLight(0xe04060, 1.2, 100);
    redLight.position.set(15, -5, 10);
    scene.add(redLight);

    const goldLight = new THREE.PointLight(0xffd700, 0.6, 80);
    goldLight.position.set(0, 12, 5);
    scene.add(goldLight);

    // ── Materials ──
    const wireframeMat = (color: number, opacity: number) =>
      new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity });

    const glowMat = (color: number, opacity: number) =>
      new THREE.MeshPhongMaterial({
        color, emissive: color, emissiveIntensity: 0.4,
        transparent: true, opacity, shininess: 80,
      });

    // ── Objects array for animation ──
    const objects: { mesh: THREE.Object3D; rotSpeed: THREE.Vector3; driftSpeed: THREE.Vector3; baseY: number }[] = [];

    // ════════════════════════════════════════
    //  SPACESHIPS (geometric arrow shapes)
    // ════════════════════════════════════════
    const createSpaceship = (x: number, y: number, z: number, color: number, scale: number) => {
      const group = new THREE.Group();

      // Fuselage (elongated octahedron)
      const fuselage = new THREE.Mesh(
        new THREE.OctahedronGeometry(1, 0),
        glowMat(color, 0.35)
      );
      fuselage.scale.set(0.5, 0.5, 2);
      group.add(fuselage);

      // Wireframe outline
      const wireframe = new THREE.Mesh(
        new THREE.OctahedronGeometry(1.05, 0),
        wireframeMat(color, 0.2)
      );
      wireframe.scale.set(0.5, 0.5, 2);
      group.add(wireframe);

      // Wings (two flat tetrahedrons)
      const wingGeo = new THREE.TetrahedronGeometry(0.8, 0);
      const wingMat = glowMat(color, 0.25);
      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.set(-0.8, 0, -0.3);
      leftWing.scale.set(1.2, 0.15, 0.8);
      group.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeo, wingMat.clone());
      rightWing.position.set(0.8, 0, -0.3);
      rightWing.scale.set(1.2, 0.15, 0.8);
      group.add(rightWing);

      // Engine glow (small sphere at back)
      const engine = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.7 })
      );
      engine.position.set(0, 0, -1.2);
      group.add(engine);

      group.position.set(x, y, z);
      group.scale.setScalar(scale);
      scene.add(group);

      objects.push({
        mesh: group,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.003,
        ),
        driftSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.005,
          0,
        ),
        baseY: y,
      });
    };

    createSpaceship(-18, 6, -10, 0x4a9eff, 1.2);
    createSpaceship(20, -4, -15, 0x3a5a8a, 0.9);
    createSpaceship(-8, -8, -20, 0x5a3a6a, 0.7);
    createSpaceship(14, 9, -12, 0x4a6a5a, 1.0);

    // ════════════════════════════════════════
    //  ALIENS (geometric crystal beings)
    // ════════════════════════════════════════
    const createAlien = (x: number, y: number, z: number, color: number, scale: number) => {
      const group = new THREE.Group();

      // Head (icosahedron — faceted alien skull)
      const head = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.6, 0),
        glowMat(color, 0.35)
      );
      head.position.y = 0.8;
      group.add(head);

      // Head wireframe
      const headWire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.65, 0),
        wireframeMat(color, 0.2)
      );
      headWire.position.y = 0.8;
      group.add(headWire);

      // Eyes (two small glowing spheres)
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
      const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), eyeMat);
      leftEye.position.set(-0.2, 0.85, 0.5);
      group.add(leftEye);
      const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), eyeMat);
      rightEye.position.set(0.2, 0.85, 0.5);
      group.add(rightEye);

      // Body (dodecahedron)
      const body = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.5, 0),
        glowMat(color, 0.3)
      );
      group.add(body);

      // Antennae (thin cones)
      const antennaMat = glowMat(color, 0.4);
      const antennaGeo = new THREE.ConeGeometry(0.04, 0.8, 4);
      const leftAntenna = new THREE.Mesh(antennaGeo, antennaMat);
      leftAntenna.position.set(-0.3, 1.5, 0);
      leftAntenna.rotation.z = 0.3;
      group.add(leftAntenna);
      const rightAntenna = new THREE.Mesh(antennaGeo, antennaMat.clone());
      rightAntenna.position.set(0.3, 1.5, 0);
      rightAntenna.rotation.z = -0.3;
      group.add(rightAntenna);

      // Antenna tips (glowing spheres)
      const tipMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
      const leftTip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), tipMat);
      leftTip.position.set(-0.5, 1.9, 0);
      group.add(leftTip);
      const rightTip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), tipMat.clone());
      rightTip.position.set(0.5, 1.9, 0);
      group.add(rightTip);

      group.position.set(x, y, z);
      group.scale.setScalar(scale);
      scene.add(group);

      objects.push({
        mesh: group,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.004,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.003,
        ),
        driftSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.006,
          (Math.random() - 0.5) * 0.004,
          0,
        ),
        baseY: y,
      });
    };

    createAlien(12, 5, -8, 0x4eca78, 1.1);
    createAlien(-16, -6, -12, 0x8b7ec8, 0.8);
    createAlien(6, -10, -18, 0xe04060, 0.6);

    // ════════════════════════════════════════
    //  FLOATING CRYSTAL / ASTEROID
    // ════════════════════════════════════════
    const createCrystal = (x: number, y: number, z: number, color: number, scale: number) => {
      const geo = new THREE.OctahedronGeometry(1, 0);
      const mesh = new THREE.Mesh(geo, glowMat(color, 0.2));
      mesh.position.set(x, y, z);
      mesh.scale.setScalar(scale);
      scene.add(mesh);

      const wire = new THREE.Mesh(
        new THREE.OctahedronGeometry(1.05, 0),
        wireframeMat(color, 0.15)
      );
      wire.position.copy(mesh.position);
      wire.scale.setScalar(scale);
      scene.add(wire);

      objects.push({
        mesh,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.006,
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.004,
        ),
        driftSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.003,
          0,
        ),
        baseY: y,
      });

      // Wire follows crystal
      objects.push({
        mesh: wire,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.006,
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.004,
        ),
        driftSpeed: new THREE.Vector3(0, 0, 0),
        baseY: y,
      });
    };

    createCrystal(-22, 0, -25, 0xffd700, 1.5);
    createCrystal(22, -8, -30, 0x8b7ec8, 2.0);
    createCrystal(0, 12, -22, 0xe04060, 1.0);

    // ── Particle field (tiny stars) ──
    const starCount = 100;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 80;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 20;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.3 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ── Mouse parallax (updated in rAF, no per-event work) ──
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / width - 0.5) * 2;
      mouseY = (e.clientY / height - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // ── Animation loop ──
    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Animate objects
      for (const obj of objects) {
        obj.mesh.rotation.x += obj.rotSpeed.x;
        obj.mesh.rotation.y += obj.rotSpeed.y;
        obj.mesh.rotation.z += obj.rotSpeed.z;

        // Gentle floating drift
        obj.mesh.position.x += obj.driftSpeed.x;
        obj.mesh.position.y = obj.baseY + Math.sin(t * 0.5 + obj.baseY) * 0.5;

        // Wrap around edges
        if (obj.mesh.position.x > 28) obj.mesh.position.x = -28;
        if (obj.mesh.position.x < -28) obj.mesh.position.x = 28;
      }

      // Rotate star field slowly
      stars.rotation.y = t * 0.01;
      stars.rotation.x = t * 0.005;

      // Camera parallax from mouse
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, -10);

      // Pulse lights subtly
      blueLight.intensity = 1.5 + Math.sin(t * 0.8) * 0.3;
      redLight.intensity = 1.2 + Math.sin(t * 0.6 + 1) * 0.3;

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize handler ──
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    />
  );
}
