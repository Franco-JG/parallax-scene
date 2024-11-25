import './style.css';
import * as THREE from 'three';
import { GLTFLoader, EffectComposer, ShaderPass, RenderPass, UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { createCamera } from './src/core/camera';
import { createOrbitControls } from './src/core/controls';
import { createRenderer, resizeRendererAndCamera } from './src/core/renderer';
import { createScene } from './src/core/scene'

const canvas = document.querySelector('canvas');
const scene = createScene()
const renderer = createRenderer(canvas)
renderer.setAnimationLoop(animate);
// Crear cámara y controles
const camera = createCamera()
// camera.position.set(10, 10, 10);
const controls = createOrbitControls(camera, renderer);
controls.enabled = false
// Añadir luces
const ambient = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambient);

// Crear geometría y material para las partículas
const particleCount = 2000; // Número de partículas
const particleGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3); // x, y, z por partícula

// Generar posiciones aleatorias dentro de un área
const areaWidth = 10; // Ancho del área donde aparecen las partículas
const areaHeight = 5; // Altura del área
for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = Math.random() * areaWidth - areaWidth / 2; // x
  positions[i * 3 + 1] = Math.random() * areaHeight - areaHeight / 2; // y
  positions[i * 3 + 2] = Math.random() * 15 ; // z, una pequeña profundidad
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Crear una textura circular para las partículas
const circleTexture = new THREE.TextureLoader().load('particleShape.png');

// Material de las partículas
const particleMaterial = new THREE.PointsMaterial({
  color: 0xfc7d1c, // Marrón 0x8B4513
  size: 0.08,
  transparent: true,
  opacity: 0.7,
  depthWrite: false,
  map: circleTexture, // Textura de círculo
  alphaTest: 0.5, // Descartar píxeles transparentes
  blending: THREE.NormalBlending, // Mejor efecto visual para partículas AdditiveBlending
  sizeAttenuation: true, // Escalar según la distancia
});

// Crear el objeto de partículas
const particles = new THREE.Points(particleGeometry, particleMaterial);
particles.position.z = -8

// Animar las partículas
function animateParticles() {
  const positions = particleGeometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] += 0.04; // Mover hacia la derecha (eje X)

    // Reiniciar posición cuando sale del área
    if (positions[i * 3] > areaWidth / 2) {
      positions[i * 3] = -areaWidth / 2;
    }
  }
  particleGeometry.attributes.position.needsUpdate = true; // Notificar a Three.js que se actualizó
}

// scene.add(new THREE.AxesHelper(10))

//*Postprocesado

const composer = new EffectComposer(renderer)
const renderPass =  new RenderPass(scene, camera)

const bloomPass =  new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight),1,0.9,0.1);

composer.addPass(renderPass)
composer.addPass(bloomPass)

//*End Postprocesado
let mixer;

// Cargar el modelo GLTF
const loader = new GLTFLoader();
loader.load(
  'parallax1.final.gltf',
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);
    scene.add(particles);


    // Configurar sombras en las mallas del modelo
    model.traverse((child) => {
      if (child.isMesh && child.name == "sun") {
        child.material.emissive = new THREE.Color().setRGB( 0.7, 0.6, 0.4).multiplyScalar(0.3)
        // child.material.emissive = new THREE.Color().setRGB( 0.8, 0.1, 0.8).multiplyScalar(0.5)
      }else{
        // child.castShadow = true;
      }
    });

    // Crear el AnimationMixer
    mixer = new THREE.AnimationMixer(model);
    const clips = gltf.animations;
    
    // Configurar cada clip de animación en bucle y reproducirlo
    clips.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.loop = THREE.LoopRepeat;  // Configurar para que se repita
      action.clampWhenFinished = false; // Continuar animando al final del ciclo
      action.play(); // Reproducir la animación
    });

    // Si el GLTF tiene una cámara, configurar la cámara de Three.js
    const gltfCamera = gltf.cameras?.[0];
    if (gltfCamera) {
      const parent = gltfCamera.parent;

      // Configurar la cámara de Three.js usando la posición, rotación y escala del objeto padre
      camera.position.copy(parent.position);
      camera.quaternion.copy(parent.quaternion);
      camera.scale.copy(parent.scale);

      // También copiar los parámetros de la cámara del GLTF
      camera.fov = gltfCamera.fov;
      camera.near = gltfCamera.near;
      camera.far = gltfCamera.far;
      camera.aspect = gltfCamera.aspect;
      camera.updateProjectionMatrix();  // Actualizar la matriz de proyección

    }
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% cargado');
  },
  (error) => {
    console.log('Ocurrió un error al cargar el GLTF:', error);
  }
);


window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'g') { // Detectar la tecla 'g' sin importar mayúsculas o minúsculas
    controls.enabled = !controls.enabled; // Alternar el estado de los controles
    console.log(`OrbitControls ${controls.enabled ? 'activado' : 'desactivado'}`);
  }
});


// Animación
function animate() {
  resizeRendererAndCamera(renderer, camera)
  const delta = 0.009
  // Actualizar el mixer de animación si existe
  if (mixer) {
    mixer.update(delta);
  }

  // renderer.render(scene, camera);
  animateParticles()
  composer.render()
  controls.update();
}


