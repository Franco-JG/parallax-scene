import './style.css';
import * as THREE from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';

const canvas = document.querySelector('canvas');
const scene = new THREE.Scene();

// Configurar el renderizador
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;  // Habilitar las sombras

// Crear cámara y controles
const camera = new THREE.PerspectiveCamera();
camera.position.set(10, 10, 10);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enableRotate = false;

// Añadir luces
const ambient = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 2);
directional.position.set(0, 5, 0);
directional.castShadow = true;
let size = 1024;
directional.shadow.mapSize.width = size;
directional.shadow.mapSize.height = size;

// Ajustar el área de la cámara de sombras
let sombra = 10;
directional.shadow.camera.left = -sombra;
directional.shadow.camera.right = sombra;
directional.shadow.camera.top = sombra;
directional.shadow.camera.bottom = -sombra;
scene.add(directional);

let mixer;

// Cargar el modelo GLTF
const loader = new GLTFLoader();
loader.load(
  'avance1.1.gltf',
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Configurar sombras en las mallas del modelo
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
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

// Añadir AxesHelper para referencia
//scene.add(new THREE.AxesHelper(20));

// Animación
const clock = new THREE.Clock();
function animate() {
  //const delta = clock.getDelta();
  //const delta = 0.005
  //console.log(delta)
  const delta = 0.011    

  // Actualizar el mixer de animación si existe
  if (mixer) {
    mixer.update(delta);
  }

  renderer.render(scene, camera);
  controls.update();
}

renderer.setAnimationLoop(animate);
