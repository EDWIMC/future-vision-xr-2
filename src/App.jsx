
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

function XRScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#07111f");

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );

    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const geometry = new THREE.IcosahedronGeometry(1.35, 2);

    const material = new THREE.MeshStandardMaterial({
      color: "#16baff",
      metalness: 0.75,
      roughness: 0.22,
      wireframe: true
    });

    const object = new THREE.Mesh(geometry, material);
    group.add(object);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2, 0.012, 12, 120),
      new THREE.MeshBasicMaterial({ color: "#00e5ff" })
    );

    ring.rotation.x = Math.PI / 2.8;
    group.add(ring);

    scene.add(new THREE.AmbientLight("#ffffff", 1.8));

    const light = new THREE.PointLight("#00bfff", 35);
    light.position.set(3, 4, 5);
    scene.add(light);

    const clock = new THREE.Clock();
    let frameId;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      group.rotation.y = elapsed * 0.25;
      group.rotation.x = Math.sin(elapsed * 0.3) * 0.12;

      renderer.render(scene, camera);
    };

    animate();

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      geometry.dispose();
      material.dispose();
      ring.geometry.dispose();
      ring.material.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div className="xr-scene" ref={containerRef} />;
}

export default function App() {
  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">FV</div>
          <div>
            <h1>FUTURE VISION <span>XR</span></h1>
            <p>IMMERSIVE EDUCATIONAL LABORATORY</p>
          </div>
        </div>

        <div className="version">VERSION 2.0</div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">THE NEXT GENERATION OF LEARNING</span>

          <h2>
            THE FUTURE IS
            <br />
            <span>IN YOUR HANDS.</span>
          </h2>

          <p>
            Explora, descubre y comprende la tecnología
            mediante experiencias tridimensionales
            e interactivas.
          </p>

          <div className="status">
            <span className="status-dot" />
            MOTOR 3D INICIALIZADO
          </div>
        </div>

        <div className="visual-panel">
          <XRScene />
          <div className="scene-label">
            <span>XR ENGINE</span>
            <span>THREE.JS</span>
          </div>
        </div>
      </section>

      <section className="laboratory">
        <div className="section-heading">
          <div>
            <span className="eyebrow">EXPLORATION MODULES</span>
            <h2>Laboratorio tecnológico</h2>
          </div>
          <span className="module-count">04 MODULES</span>
        </div>

        <div className="module-grid">
          {[
            ["01", "SMARTPHONE", "Arquitectura de dispositivos móviles"],
            ["02", "LAPTOP", "Componentes de computadoras"],
            ["03", "DRONE", "Sistemas de vuelo y sensores"],
            ["04", "HUMANOID ROBOT", "Robótica e inteligencia artificial"]
          ].map(([number, name, description]) => (
            <article className="module-card" key={number}>
              <span>{number}</span>
              <h3>{name}</h3>
              <p>{description}</p>
              <div className="module-line" />
            </article>
          ))}
        </div>
      </section>

      <footer>
        <span>FUTURE VISION XR 2.0</span>
        <span>EDUCATION · TECHNOLOGY · INNOVATION</span>
      </footer>
    </main>
  );
}
