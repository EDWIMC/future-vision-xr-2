
import * as THREE from "three";

export const smartphoneParts = [
  {
    id: "screen",
    es: "Pantalla OLED",
    en: "OLED Display",
    description: "Panel encargado de mostrar imágenes, colores e información mediante píxeles OLED.",
    descriptionEn: "Display panel responsible for producing images, colors and information using OLED pixels.",
    function: "Visualización e interacción",
    functionEn: "Display and interaction",
    technical: "Panel orgánico de emisión de luz",
    technicalEn: "Organic light-emitting diode panel",
    relation: "Se conecta a la placa principal mediante circuitos flexibles.",
    relationEn: "Connected to the motherboard through flexible circuits."
  },
  {
    id: "battery",
    es: "Batería",
    en: "Battery",
    description: "Almacena energía eléctrica para alimentar los diferentes sistemas del smartphone.",
    descriptionEn: "Stores electrical energy to power the different smartphone systems.",
    function: "Suministro energético",
    functionEn: "Power supply",
    technical: "Batería recargable de ion-litio",
    technicalEn: "Rechargeable lithium-ion battery",
    relation: "Alimenta la placa principal y los demás componentes.",
    relationEn: "Powers the motherboard and other components."
  },
  {
    id: "motherboard",
    es: "Placa principal",
    en: "Motherboard",
    description: "Conecta los circuitos y permite la comunicación entre los componentes electrónicos.",
    descriptionEn: "Connects electronic circuits and enables communication between components.",
    function: "Interconexión electrónica",
    functionEn: "Electronic interconnection",
    technical: "Circuito impreso multicapa",
    technicalEn: "Multilayer printed circuit board",
    relation: "Integra el procesador, memorias y conexiones.",
    relationEn: "Integrates the processor, memory and connections."
  },
  {
    id: "cpu",
    es: "Procesador",
    en: "Processor",
    description: "Ejecuta instrucciones y coordina las operaciones principales del dispositivo.",
    descriptionEn: "Executes instructions and coordinates the device's main operations.",
    function: "Procesamiento de datos",
    functionEn: "Data processing",
    technical: "System on a Chip (SoC)",
    technicalEn: "System on a Chip (SoC)",
    relation: "Se comunica con la memoria y los circuitos de la placa principal.",
    relationEn: "Communicates with memory and motherboard circuits."
  },
  {
    id: "cameras",
    es: "Módulo de cámaras",
    en: "Camera Module",
    description: "Captura imágenes y vídeos mediante sensores ópticos y lentes.",
    descriptionEn: "Captures images and videos using optical sensors and lenses.",
    function: "Captura de imágenes",
    functionEn: "Image capture",
    technical: "Sensores CMOS y lentes ópticas",
    technicalEn: "CMOS sensors and optical lenses",
    relation: "Se comunica con el procesador para procesar las imágenes.",
    relationEn: "Communicates with the processor to process images."
  },
  {
    id: "speaker",
    es: "Altavoz",
    en: "Speaker",
    description: "Convierte señales eléctricas en sonido para reproducir audio.",
    descriptionEn: "Converts electrical signals into sound for audio playback.",
    function: "Reproducción de sonido",
    functionEn: "Sound reproduction",
    technical: "Transductor electroacústico",
    technicalEn: "Electroacoustic transducer",
    relation: "Recibe señales de audio desde los circuitos electrónicos.",
    relationEn: "Receives audio signals from electronic circuits."
  },
  {
    id: "frame",
    es: "Estructura metálica",
    en: "Metal Frame",
    description: "Proporciona soporte estructural y protección a los componentes internos.",
    descriptionEn: "Provides structural support and protection for internal components.",
    function: "Protección estructural",
    functionEn: "Structural protection",
    technical: "Aleación metálica",
    technicalEn: "Metal alloy",
    relation: "Sostiene y alinea los diferentes componentes.",
    relationEn: "Supports and aligns the different components."
  },
  {
    id: "back",
    es: "Cubierta posterior",
    en: "Back Cover",
    description: "Cubre la parte posterior del dispositivo y protege sus elementos internos.",
    descriptionEn: "Covers the rear of the device and protects its internal components.",
    function: "Protección exterior",
    functionEn: "External protection",
    technical: "Vidrio o material compuesto",
    technicalEn: "Glass or composite material",
    relation: "Se acopla a la estructura exterior del smartphone.",
    relationEn: "Attaches to the external smartphone frame."
  }
];

function roundedShape(width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const s = new THREE.Shape();

  s.moveTo(x + radius, y);
  s.lineTo(x + width - radius, y);
  s.quadraticCurveTo(x + width, y, x + width, y + radius);
  s.lineTo(x + width, y + height - radius);
  s.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  s.lineTo(x + radius, y + height);
  s.quadraticCurveTo(x, y + height, x, y + height - radius);
  s.lineTo(x, y + radius);
  s.quadraticCurveTo(x, y, x + radius, y);

  return s;
}

function createPanel(width, height, depth, color, options = {}) {
  const geometry = new THREE.ExtrudeGeometry(
    roundedShape(width, height, options.radius ?? 0.12),
    {
      depth,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: options.bevel ?? 0.015,
      bevelThickness: options.bevel ?? 0.015,
      curveSegments: 8
    }
  );

  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: options.metalness ?? 0.3,
    roughness: options.roughness ?? 0.3,
    emissive: options.emissive ?? "#000000",
    emissiveIntensity: 0.25
  });

  return new THREE.Mesh(geometry, material);
}

function createComponent(id, base, explosion) {
  const group = new THREE.Group();

  group.userData.componentId = id;

  group.position.copy(base);

  group.userData.basePosition = base.clone();
  group.userData.explodedPosition = explosion.clone();

  return group;
}

function addComponent(root, id, base, explosion, build) {
  const group = createComponent(id, base, explosion);

  build(group);

  root.add(group);

  return group;
}

export function createSmartphone() {
  const root = new THREE.Group();
  const components = [];

  const frame = addComponent(
    root,
    "frame",
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    group => {
      const body = createPanel(
        1.38, 2.65, 0.14, "#8595a5",
        { metalness: 0.9, roughness: 0.22, radius: 0.16 }
      );
      body.position.z = -0.07;
      group.add(body);

      const inner = createPanel(
        1.20, 2.43, 0.025, "#101c2a",
        { radius: 0.10 }
      );
      inner.position.z = 0.075;
      group.add(inner);

      for (const side of [-1, 1]) {
        const button = new THREE.Mesh(
          new THREE.BoxGeometry(0.035, 0.20, 0.055),
          new THREE.MeshStandardMaterial({
            color: "#b6c9d6",
            metalness: 0.8
          })
        );

        button.position.set(side * 0.70, 0.45, 0);
        group.add(button);
      }
    }
  );

  components.push(frame);

  const screen = addComponent(
    root,
    "screen",
    new THREE.Vector3(0, 0, 0.12),
    new THREE.Vector3(0, 1.65, 0.55),
    group => {
      const glass = createPanel(
        1.22, 2.48, 0.025, "#07111c",
        { roughness: 0.08, metalness: 0.35, radius: 0.12 }
      );

      group.add(glass);

      const display = createPanel(
        1.13, 2.31, 0.006, "#071c35",
        { roughness: 0.1, radius: 0.08 }
      );

      display.position.z = 0.03;
      group.add(display);

      const cameraDot = new THREE.Mesh(
        new THREE.CircleGeometry(0.035, 24),
        new THREE.MeshBasicMaterial({ color: "#02060a" })
      );

      cameraDot.position.set(0, 1.09, 0.04);
      group.add(cameraDot);
    }
  );

  components.push(screen);

  const battery = addComponent(
    root,
    "battery",
    new THREE.Vector3(0, -0.10, 0.015),
    new THREE.Vector3(-1.35, -0.15, 0.55),
    group => {
      const cell = createPanel(
        0.77, 1.40, 0.045, "#293747",
        { metalness: 0.55, roughness: 0.35, radius: 0.07 }
      );

      group.add(cell);

      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.025, 0.008),
        new THREE.MeshBasicMaterial({ color: "#00bfe9" })
      );

      stripe.position.set(0, 0, 0.06);
      group.add(stripe);

      for (let i = 0; i < 4; i++) {
        const line = new THREE.Mesh(
          new THREE.BoxGeometry(0.50, 0.009, 0.008),
          new THREE.MeshBasicMaterial({ color: "#738b9c" })
        );

        line.position.set(0, -0.23 + i * 0.15, 0.06);
        group.add(line);
      }
    }
  );

  components.push(battery);

  const motherboard = addComponent(
    root,
    "motherboard",
    new THREE.Vector3(0, 0.83, 0.015),
    new THREE.Vector3(1.40, 0.80, 0.45),
    group => {
      const pcb = createPanel(
        0.85, 0.78, 0.045, "#126247",
        { metalness: 0.3, roughness: 0.65, radius: 0.06 }
      );

      group.add(pcb);

      for (let i = 0; i < 5; i++) {
        const trace = new THREE.Mesh(
          new THREE.BoxGeometry(0.68, 0.012, 0.008),
          new THREE.MeshBasicMaterial({ color: "#c0a76c" })
        );

        trace.position.set(0, -0.24 + i * 0.12, 0.06);
        group.add(trace);
      }

      for (let i = 0; i < 6; i++) {
        const contact = new THREE.Mesh(
          new THREE.BoxGeometry(0.045, 0.045, 0.012),
          new THREE.MeshStandardMaterial({
            color: "#d7b86b",
            metalness: 0.9
          })
        );

        contact.position.set(-0.34 + (i % 3) * 0.12, -0.31 + Math.floor(i / 3) * 0.12, 0.07);
        group.add(contact);
      }
    }
  );

  components.push(motherboard);

  const cpu = addComponent(
    root,
    "cpu",
    new THREE.Vector3(0.02, 0.80, 0.09),
    new THREE.Vector3(0, 1.55, 1.05),
    group => {
      const chip = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.34, 0.075),
        new THREE.MeshStandardMaterial({
          color: "#b4c4ce",
          metalness: 0.9,
          roughness: 0.18
        })
      );

      group.add(chip);

      const core = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.22, 0.012),
        new THREE.MeshStandardMaterial({
          color: "#243b50",
          metalness: 0.65,
          roughness: 0.25
        })
      );

      core.position.z = 0.045;
      group.add(core);
    }
  );

  components.push(cpu);

  const cameras = addComponent(
    root,
    "cameras",
    new THREE.Vector3(0.36, 1.05, -0.02),
    new THREE.Vector3(1.42, 1.75, 0.85),
    group => {
      const module = createPanel(
        0.37, 0.66, 0.08, "#202c3b",
        { metalness: 0.8, radius: 0.08 }
      );

      group.add(module);

      for (let i = 0; i < 3; i++) {
        const lens = new THREE.Mesh(
          new THREE.CylinderGeometry(0.075, 0.075, 0.035, 32),
          new THREE.MeshStandardMaterial({
            color: "#050b16",
            metalness: 0.9,
            roughness: 0.1
          })
        );

        lens.rotation.x = Math.PI / 2;
        lens.position.set(0, 0.20 - i * 0.20, 0.09);
        group.add(lens);

        const glass = new THREE.Mesh(
          new THREE.CircleGeometry(0.045, 32),
          new THREE.MeshPhysicalMaterial({
            color: "#126c9d",
            metalness: 0.4,
            roughness: 0.08,
            clearcoat: 1
          })
        );

        glass.position.set(0, 0.20 - i * 0.20, 0.112);
        group.add(glass);
      }
    }
  );

  components.push(cameras);

  const speaker = addComponent(
    root,
    "speaker",
    new THREE.Vector3(0, -1.04, 0.02),
    new THREE.Vector3(0, -1.85, 0.65),
    group => {
      const housing = createPanel(
        0.55, 0.18, 0.06, "#374554",
        { metalness: 0.8, radius: 0.05 }
      );

      group.add(housing);

      for (let i = 0; i < 7; i++) {
        const hole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.018, 0.012, 12),
          new THREE.MeshBasicMaterial({ color: "#050a10" })
        );

        hole.rotation.x = Math.PI / 2;
        hole.position.set(-0.21 + i * 0.07, 0, 0.07);
        group.add(hole);
      }
    }
  );

  components.push(speaker);

  const back = addComponent(
    root,
    "back",
    new THREE.Vector3(0, 0, -0.15),
    new THREE.Vector3(0, -1.60, -0.65),
    group => {
      const cover = createPanel(
        1.29, 2.53, 0.035, "#243a50",
        { metalness: 0.8, roughness: 0.23, radius: 0.14 }
      );

      group.add(cover);

      const logo = new THREE.Mesh(
        new THREE.CircleGeometry(0.12, 32),
        new THREE.MeshStandardMaterial({
          color: "#93b4cb",
          metalness: 0.9,
          roughness: 0.25
        })
      );

      logo.position.set(0, -0.45, 0.045);
      group.add(logo);
    }
  );

  components.push(back);

  root.scale.setScalar(0.92);

  return { root, components };
}

export function updateSmartphoneAssembly(components, progress) {
  const amount = THREE.MathUtils.clamp(progress, 0, 1);

  for (const component of components) {
    component.position.lerpVectors(
      component.userData.basePosition,
      component.userData.explodedPosition,
      amount
    );
  }
}

export function disposeSmartphone(root) {
  root.traverse(object => {
    if (object.geometry) object.geometry.dispose();

    if (object.material) {
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach(material => material.dispose());
    }
  });
}
