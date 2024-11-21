import { PerspectiveCamera } from "three"

export const createCamera = () => {

  const camera = new PerspectiveCamera(17, window.innerWidth/window.innerHeight, 0.1, 1000)
  camera.position.z = 2
  return camera
  
}