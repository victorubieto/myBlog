import * as THREE from "three";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js";

class App {

    constructor() {
        this.clock = new THREE.Clock();
        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.controls = null;
    }
    
    init() {
    
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xe7e6e5 );
        let gridHelper = new THREE.GridHelper( 10, 10 );
        this.scene.add( gridHelper );

        // Renderer
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild( this.renderer.domElement );

        // Camera
        this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.01, 1000 );
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.object.position.set(0.0, 3, 3);
        this.controls.target.set(0.0, 1.0, 0.0);
        this.controls.minDistance = 0.1;
        this.controls.maxDistance = 100;
        this.controls.update();

        // Call the loop
        this.animate();
        document.querySelector("#loading").style.display = 'none';

        window.addEventListener( "resize", this.onWindowResize.bind(this) );
    }

    animate() {

        requestAnimationFrame( this.animate.bind(this) );
        let delta = this.clock.getDelta();

        this.render();
        this.update(delta);
    }

    render() {

        if(!this.renderer)
            return;

        this.renderer.render(this.scene, this.camera);
    }

    update(dt) {

    }

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
}

let app = new App();
app.init();

export { app };