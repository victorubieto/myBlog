import * as THREE from "three";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/GLTFLoader.js";

class App {

    constructor() {
        this.clock = new THREE.Clock();
        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.controls = null;
    }
    
    init() {
    
        let scene = this.scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x777777 );
        let gridHelper = new THREE.GridHelper( 10, 10 );
        scene.add( gridHelper );

        // Renderer
        let renderer = this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;
        document.body.appendChild( renderer.domElement );

        // Camera
        let camera = this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.01, 1000 );
        let controls = this.controls = new OrbitControls( camera, renderer.domElement );
        controls.object.position.set(0.0, 2, 3);
        controls.target.set(0.0, 0.0, 0.0);
        controls.minDistance = 0.1;
        controls.maxDistance = 100;
        controls.update();

        // Lights
        let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
        scene.add(hemiLight);
        let dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        let dirtarget = new THREE.Object3D();
        dirtarget.position.set(-0.5, 0.0, -0.5); 
        dirLight.target = dirtarget;
        dirLight.target.updateMatrixWorld();
        scene.add(dirLight);

        const texture = new THREE.TextureLoader().load('../data/textures/coast_land_rocks_01_diff_4k.jpg',
            undefined, undefined,
            (error) => {
                console.error("The texture didn't has not been loaded correctly.");
                console.log(error);
            }
        );
        
        const material = new THREE.MeshStandardMaterial( { map: texture } );

        const glbLoader = new GLTFLoader();
        glbLoader.load('../data/models/sphere.glb',
            (glb) => {
                let model = glb.scene;
                model.traverse( (object) => {
                    if (object.isMesh) {
                        object.material = material;//new THREE.MeshStandardMaterial();
                        this.scene.add(object);
                    }
                });
            },
            undefined, // onProgress not supported
            (error) => {
                console.error("The 3D model has not been loaded correctly.");
                console.log(error);
            }
        );

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

        if (!this.renderer)
            return;

        this.renderer.render(this.scene, this.camera);
    }

    update(dt) {

        if (this.scene.getObjectByName("Sphere")) {
            this.scene.getObjectByName("Sphere").rotation.y += 0.001;
        }
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