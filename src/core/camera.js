import { PerspectiveCamera } from "three"

export const createCamera = () => {

  const camera = new PerspectiveCamera(75, 2, 0.1, 1000)
  camera.position.z = 2
  return camera
  
}