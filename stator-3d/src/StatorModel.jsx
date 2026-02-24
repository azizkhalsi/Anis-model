import { useRef, useEffect } from 'react';

const THREE = window.THREE;

// ── Materials ──────────────────────────────────────────────────────────
function createMaterials() {
  const black = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.85,
    metalness: 0.05,
  });

  const copper = new THREE.MeshStandardMaterial({
    color: 0xb87333,
    metalness: 0.92,
    roughness: 0.22,
  });

  const silver = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    metalness: 0.95,
    roughness: 0.1,
  });

  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x555555,
    metalness: 0.8,
    roughness: 0.35,
  });

  const white = new THREE.MeshStandardMaterial({
    color: 0xeeeeee,
    roughness: 0.6,
    metalness: 0.0,
  });

  return { black, copper, silver, darkMetal, white };
}

// ── Coil generator ────────────────────────────────────────────────────
// Creates a helical solenoidal winding around the Y-axis
function createCoilGeometry(innerRadius, length, turns, wireRadius) {
  const points = [];
  const totalPoints = turns * 32;

  for (let i = 0; i <= totalPoints; i++) {
    const t = i / totalPoints;
    const angle = t * turns * Math.PI * 2;
    const y = (t - 0.5) * length;
    const x = innerRadius * Math.cos(angle);
    const z = innerRadius * Math.sin(angle);
    points.push(new THREE.Vector3(x, y, z));
  }

  const curve = new THREE.CatmullRomCurve3(points, false);
  return new THREE.TubeBufferGeometry(curve, totalPoints * 2, wireRadius, 8, false);
}

// ── Central Hub ───────────────────────────────────────────────────────
function createHub(materials) {
  const group = new THREE.Group();

  // Main hub body — slightly rounded box shape
  const hubSize = 0.55;
  const hubGeo = new THREE.BoxBufferGeometry(hubSize, hubSize * 0.7, hubSize);
  const hub = new THREE.Mesh(hubGeo, materials.black);
  group.add(hub);

  // Rounded edges — small cylinders at edges for visual softness
  const edgeGeo = new THREE.CylinderBufferGeometry(hubSize * 0.52, hubSize * 0.52, hubSize * 0.68, 6);
  const edgeMesh = new THREE.Mesh(edgeGeo, materials.black);
  edgeMesh.rotation.x = Math.PI / 2;
  edgeMesh.rotation.z = Math.PI / 6;
  group.add(edgeMesh);

  return group;
}

// ── Ball Bearing ──────────────────────────────────────────────────────
function createBearing(materials) {
  const group = new THREE.Group();

  // Outer ring
  const outerRing = new THREE.Mesh(
    new THREE.TorusBufferGeometry(0.22, 0.04, 16, 32),
    materials.silver
  );
  group.add(outerRing);

  // Inner ring
  const innerRing = new THREE.Mesh(
    new THREE.TorusBufferGeometry(0.12, 0.03, 16, 32),
    materials.silver
  );
  group.add(innerRing);

  // Center disc (bearing shield)
  const shield = new THREE.Mesh(
    new THREE.CylinderBufferGeometry(0.2, 0.2, 0.04, 32),
    materials.darkMetal
  );
  shield.rotation.x = Math.PI / 2;
  group.add(shield);

  return group;
}

// ── Shaft ─────────────────────────────────────────────────────────────
function createShaft(materials) {
  const shaftGeo = new THREE.CylinderBufferGeometry(0.05, 0.05, 1.4, 16);
  const shaft = new THREE.Mesh(shaftGeo, materials.darkMetal);
  shaft.rotation.x = Math.PI / 2;
  shaft.position.z = -0.5;
  return shaft;
}

// ── Single Arm with Bobbin ────────────────────────────────────────────
function createArm(materials) {
  const group = new THREE.Group();

  // Arm shaft (rectangular)
  const armGeo = new THREE.BoxBufferGeometry(0.22, 0.28, 0.9);
  const arm = new THREE.Mesh(armGeo, materials.black);
  arm.position.z = 0.7;
  group.add(arm);

  // Inner flange (near hub)
  const flangeInner = new THREE.Mesh(
    new THREE.BoxBufferGeometry(0.4, 0.45, 0.06),
    materials.black
  );
  flangeInner.position.z = 0.3;
  group.add(flangeInner);

  // Outer flange (tip)
  const flangeOuter = new THREE.Mesh(
    new THREE.BoxBufferGeometry(0.4, 0.45, 0.06),
    materials.black
  );
  flangeOuter.position.z = 1.1;
  group.add(flangeOuter);

  return group;
}

// ── Single Arm with Coil (combined group) ────────────────────────────
function createArmWithCoil(materials) {
  const group = new THREE.Group();

  // Arm structure
  const arm = createArm(materials);
  group.add(arm);

  // Coil on arm
  const coilGeo = createCoilGeometry(0.22, 0.72, 18, 0.032);
  const coil = new THREE.Mesh(coilGeo, materials.copper);
  coil.rotation.x = Math.PI / 2;
  coil.position.z = 0.7;
  group.add(coil);

  return group;
}

// ── Vertical Post ─────────────────────────────────────────────────────
function createVerticalPost(materials) {
  const group = new THREE.Group();

  // Post shaft
  const postGeo = new THREE.BoxBufferGeometry(0.2, 1.0, 0.2);
  const post = new THREE.Mesh(postGeo, materials.black);
  post.position.y = 0.7;
  group.add(post);

  // Lower flange
  const flangeBottom = new THREE.Mesh(
    new THREE.BoxBufferGeometry(0.38, 0.06, 0.38),
    materials.black
  );
  flangeBottom.position.y = 0.25;
  group.add(flangeBottom);

  // Upper flange
  const flangeTop = new THREE.Mesh(
    new THREE.BoxBufferGeometry(0.38, 0.06, 0.38),
    materials.black
  );
  flangeTop.position.y = 1.15;
  group.add(flangeTop);

  // Square cap on top
  const cap = new THREE.Mesh(
    new THREE.BoxBufferGeometry(0.35, 0.08, 0.35),
    materials.black
  );
  cap.position.y = 1.55;
  group.add(cap);

  return group;
}

// ── Vertical Coil ─────────────────────────────────────────────────────
function createVerticalCoil(materials) {
  const coilGeo = createCoilGeometry(0.2, 0.82, 14, 0.035);
  const coil = new THREE.Mesh(coilGeo, materials.copper);
  coil.position.y = 0.7;
  return coil;
}

// ── Backing Plate ─────────────────────────────────────────────────────
function createBackingPlate(materials) {
  const plateGeo = new THREE.CylinderBufferGeometry(0.48, 0.48, 0.06, 32);
  const plate = new THREE.Mesh(plateGeo, materials.white);
  plate.rotation.x = Math.PI / 2;
  plate.position.z = 0.12;
  return plate;
}

// ── Wire Leads ────────────────────────────────────────────────────────
function createWireLeads(materials) {
  const group = new THREE.Group();
  const wirePositions = [
    { start: [0.1, 1.4, 0], end: [0.15, 2.0, 0.1] },
    { start: [-0.05, 1.4, 0.05], end: [-0.2, 2.1, -0.05] },
    { start: [0.0, 1.4, -0.05], end: [0.05, 1.95, -0.15] },
  ];

  wirePositions.forEach(({ start, end }) => {
    const pts = [
      new THREE.Vector3(...start),
      new THREE.Vector3(
        (start[0] + end[0]) / 2 + (Math.random() - 0.5) * 0.1,
        (start[1] + end[1]) / 2,
        (start[2] + end[2]) / 2 + (Math.random() - 0.5) * 0.1
      ),
      new THREE.Vector3(...end),
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    const tubeGeo = new THREE.TubeBufferGeometry(curve, 20, 0.015, 6, false);
    const wire = new THREE.Mesh(tubeGeo, materials.copper);
    group.add(wire);
  });

  return group;
}

// ── Assemble Full Stator ──────────────────────────────────────────────
function assembleStator(materials) {
  const stator = new THREE.Group();

  // Central hub
  const hub = createHub(materials);
  stator.add(hub);

  // Backing plate
  const plate = createBackingPlate(materials);
  stator.add(plate);

  // Ball bearing (front face)
  const bearing = createBearing(materials);
  bearing.position.z = -0.2;
  stator.add(bearing);

  // Shaft
  const shaft = createShaft(materials);
  stator.add(shaft);

  // Three radial arms at 120° apart in the XZ plane
  const armAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];

  armAngles.forEach((angle) => {
    const armUnit = createArmWithCoil(materials);
    armUnit.rotation.y = angle;
    stator.add(armUnit);
  });

  // Vertical post
  const vertPost = createVerticalPost(materials);
  stator.add(vertPost);

  // Vertical coil
  const vertCoil = createVerticalCoil(materials);
  stator.add(vertCoil);

  // Wire leads from top coil
  const leads = createWireLeads(materials);
  stator.add(leads);

  return stator;
}

// ── React Component ───────────────────────────────────────────────────
export default function StatorModel() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !THREE) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(3, 2.5, 3);
    camera.lookAt(0, 0.4, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.5;
    controls.maxDistance = 12;
    controls.target.set(0, 0.4, 0);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.update();

    // Lighting
    const ambient = new THREE.AmbientLight(0x404050, 0.6);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xeeeeff, 0.35);
    fillLight.position.set(-4, 3, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffeedd, 0.25);
    rimLight.position.set(0, -2, -4);
    scene.add(rimLight);

    const pointLight = new THREE.PointLight(0xfff5e0, 0.6, 15);
    pointLight.position.set(2, 4, 1);
    scene.add(pointLight);

    // Ground plane (subtle reflection)
    const groundGeo = new THREE.PlaneBufferGeometry(20, 20);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.6;
    ground.receiveShadow = true;
    scene.add(ground);

    // Build stator model
    const materials = createMaterials();
    const stator = assembleStator(materials);
    scene.add(stator);

    // Animation loop
    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="stator-container" ref={mountRef}>
      <div className="stator-title">3-Phase Brushless Motor Stator</div>
      <div className="stator-hint">Click and drag to rotate &middot; Scroll to zoom</div>
    </div>
  );
}
