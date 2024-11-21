import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function createOrbitControls(camera, renderer){
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    return controls;
}