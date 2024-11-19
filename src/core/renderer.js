import { WebGLRenderer, PCFShadowMap } from "three";

export function createRenderer(canvas) {
	const renderer =  new WebGLRenderer({ 
    antialias: true,
    canvas, 
    alpha: true
  })
		
	renderer.shadowMap.enabled = true
	renderer.shadowMap.type = PCFShadowMap
	
	renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
	renderer.setPixelRatio(window.devicePixelRatio)

	return renderer
}

export function resizeRendererAndCamera(renderer, camera){
	const canvas = renderer.domElement;
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	const needResize = canvas.width !== width || canvas.height !== height;
	if (needResize) {
	  renderer.setSize(width, height, false);
	  camera.aspect = canvas.clientWidth/canvas.clientHeight
	  camera.updateProjectionMatrix()
	  console.log('resize')
	}
  }