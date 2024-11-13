import './style.css';
import * as THREE from 'three';
import { GLTFLoader, OrbitControls, EffectComposer, ShaderPass, RenderPass, FilmPass, UnrealBloomPass, DotScreenShader, SobelOperatorShader, LuminosityShader, ColorifyShader } from 'three/examples/jsm/Addons.js';

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
// controls.enableZoom = false;
controls.enableRotate = false;
controls.enablePan = false;

// Añadir luces
const ambient = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambient);

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
  'avance1.1.gltf',
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Configurar sombras en las mallas del modelo
    model.traverse((child) => {
      if (child.isMesh && child.name == "sun") {
        child.material.emissive = new THREE.Color().setRGB( 0.7, 0.6, 0.4).multiplyScalar(0.2)
        console.log(child.material);
      }else{
        child.castShadow = true;
        // child.material = new THREE.MeshStandardMaterial({
        //   color: 0xff0000,
        //   side: THREE.DoubleSide
        // })
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
// scene.add(new THREE.AxesHelper(20));

// Animación
const clock = new THREE.Clock();
function animate() {
  //const delta = clock.getDelta();
  const delta = 0.016
  //console.log(delta)
  // const delta = 0.011    

  // Actualizar el mixer de animación si existe
  if (mixer) {
    mixer.update(delta);
  }

  renderer.render(scene, camera);
  composer.render()
  controls.update();
}

renderer.setAnimationLoop(animate);
