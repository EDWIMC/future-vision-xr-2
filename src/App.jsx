
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import {
  createSmartphone,
  updateSmartphoneAssembly,
  disposeSmartphone,
  smartphoneParts
} from "./models/smartphone.js";

function XRScene({ progress, selectedId, onSelect }) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const callbackRef = useRef(onSelect);

  callbackRef.current = onSelect;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#07111f");

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );

    camera.position.set(3.5, 2.3, 7.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight("#ffffff", 1.8);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight("#b5eaff", 3);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight("#00cfff", 28);
    rimLight.position.set(-4, 1, -2);
    scene.add(rimLight);

    const floor = new THREE.GridHelper(
      10, 30, "#17425a", "#102c40"
    );
    floor.position.y = -1.9;
    scene.add(floor);

    const { root, components } = createSmartphone();
    scene.add(root);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    let dragging = false;
    let moved = false;
    let lastX = 0;
    let lastY = 0;
    let frameId;

    const pointerDown = event => {
      dragging = true;
      moved = false;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const pointerMove = event => {
      if (!dragging) return;

      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;

      if (Math.abs(dx) + Math.abs(dy) > 3) {
        moved = true;
      }

      if (moved) {
        root.rotation.y += dx * 0.008;
        root.rotation.x += dy * 0.005;
        root.rotation.x = THREE.MathUtils.clamp(
          root.rotation.x, -1.1, 1.1
        );
      }

      lastX = event.clientX;
      lastY = event.clientY;
    };

    const pointerUp = event => {
      if (!dragging) return;

      dragging = false;

      if (!moved) {
        const rect = renderer.domElement.getBoundingClientRect();

        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);

        const hits = raycaster.intersectObjects(root.children, true);

        if (hits.length) {
          let object = hits[0].object;

          while (object && !object.userData.componentId) {
            object = object.parent;
          }

          if (object?.userData.componentId) {
            callbackRef.current(object.userData.componentId);
          }
        }
      }
    };

    const wheel = event => {
      camera.position.z = THREE.MathUtils.clamp(
        camera.position.z + event.deltaY * 0.005,
        4,
        12
      );
    };

    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointermove", pointerMove);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    renderer.domElement.addEventListener("pointercancel", pointerUp);
    renderer.domElement.addEventListener("wheel", wheel, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    resizeObserver.observe(container);

    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      if (!dragging) {
        root.rotation.y += clock.getDelta() * 0.035;
      } else {
        clock.getDelta();
      }

      renderer.render(scene, camera);
    };

    animate();

    apiRef.current = { root, components };

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();

      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("pointercancel", pointerUp);
      renderer.domElement.removeEventListener("wheel", wheel);

      disposeSmartphone(root);
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }

      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!apiRef.current) return;

    const { components } = apiRef.current;

    updateSmartphoneAssembly(components, progress);

    components.forEach(component => {
      component.traverse(object => {
        if (!object.isMesh || !object.material?.emissive) return;

        const material = object.material;

        if (!material.userData.originalEmissive) {
          material.userData.originalEmissive =
            material.emissive.clone();
        }

        if (component.userData.componentId === selectedId) {
          material.emissive.set("#00aaff");
          material.emissiveIntensity = 0.65;
        } else {
          material.emissive.copy(material.userData.originalEmissive);
          material.emissiveIntensity = 0.25;
        }
      });
    });
  }, [progress, selectedId]);

  return <div className="xr-scene" ref={containerRef} />;
}

export default function App() {
  const [progress, setProgress] = useState(0);
  const [selectedId, setSelectedId] = useState("screen");
  const [language, setLanguage] = useState("es");

  const selected = smartphoneParts.find(
    part => part.id === selectedId
  );

  const exploded = progress > 0.05;

  const name = part => language === "es" ? part.es : part.en;

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

      <section className="lab-header">
        <div>
          <span className="eyebrow">XR COMPONENT LABORATORY / 001</span>
          <h2>SMARTPHONE <span>EXPLORER</span></h2>
          <p>Explora la arquitectura interna de un dispositivo móvil.</p>
        </div>

        <div className="language-switch">
          <button
            className={language === "es" ? "active" : ""}
            onClick={() => setLanguage("es")}
          >
            ES
          </button>
          <button
            className={language === "en" ? "active" : ""}
            onClick={() => setLanguage("en")}
          >
            EN
          </button>
        </div>
      </section>

      <section className="workspace">
        <div className="viewer-column">
          <div className="viewer-heading">
            <span>3D INTERACTIVE VIEWER</span>
            <span className="live-indicator">
              <i /> LIVE ENGINE
            </span>
          </div>

          <div className="viewer">
            <XRScene
              progress={progress}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />

            <div className="viewer-hint">
              ARRASTRA PARA ROTAR · DESPLAZA PARA EXPLORAR
            </div>
          </div>

          <div className="assembly-panel">
            <div className="assembly-heading">
              <div>
                <span className="eyebrow">ASSEMBLY CONTROL</span>
                <h3>{exploded ? "Desensamblado" : "Ensamblado"}</h3>
              </div>

              <span className="percentage">
                {Math.round(progress * 100)}%
              </span>
            </div>

            <input
              className="assembly-slider"
              type="range"
              min="0"
              max="100"
              value={Math.round(progress * 100)}
              onChange={event =>
                setProgress(Number(event.target.value) / 100)
              }
              aria-label="Nivel de desensamblaje"
            />

            <div className="assembly-buttons">
              <button
                className="primary-button"
                onClick={() => setProgress(exploded ? 0 : 1)}
              >
                {exploded ? "ENSAMBLAR" : "DESENSAMBLAR"}
              </button>

              <button
                className="secondary-button"
                onClick={() => setProgress(0)}
              >
                RESTAURAR
              </button>
            </div>
          </div>
        </div>

        <aside className="components-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">DEVICE ARCHITECTURE</span>
              <h3>Componentes</h3>
            </div>
            <span className="component-count">08</span>
          </div>

          <div className="component-list">
            {smartphoneParts.map((part, index) => (
              <button
                key={part.id}
                className={
                  "component-item " +
                  (selectedId === part.id ? "selected" : "")
                }
                onClick={() => setSelectedId(part.id)}
              >
                <span className="component-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="component-name">
                  <strong>{name(part)}</strong>
                  <small>{part.en}</small>
                </span>
                <span className="component-arrow">↗</span>
              </button>
            ))}
          </div>

          {selected && (
            <div className="info-card">
              <span className="eyebrow">COMPONENT INFORMATION</span>

              <h3>{name(selected)}</h3>

              <p>
                {language === "es"
                  ? selected.description
                  : selected.descriptionEn}
              </p>

              <div className="info-detail">
                <span>FUNCTION</span>
                <strong>
                  {language === "es"
                    ? selected.function
                    : selected.functionEn}
                </strong>
              </div>

              <div className="info-detail">
                <span>TECHNOLOGY</span>
                <strong>
                  {language === "es"
                    ? selected.technical
                    : selected.technicalEn}
                </strong>
              </div>

              <div className="info-detail">
                <span>CONNECTION</span>
                <strong>
                  {language === "es"
                    ? selected.relation
                    : selected.relationEn}
                </strong>
              </div>
            </div>
          )}
        </aside>
      </section>

      <footer>
        <span>FUTURE VISION XR 2.0</span>
        <span>THE FUTURE IS IN YOUR HANDS.</span>
      </footer>
    </main>
  );
}
