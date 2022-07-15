import * as THREE from "three";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/RGBELoader.js";
import { BlurredEnvMapGenerator } from "./external/BlurredEnvMapGenerator.js"
import datGui from "https://cdn.skypack.dev/dat.gui";

class App {

    constructor() {
        this.clock = new THREE.Clock();
        this.loaderGLB = new GLTFLoader();

        this.gui = null;
        this.hdrTex = null;

        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.controls = null;
    }
    
    init() {
    
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xe7e6e5 );

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
        this.controls.object.position.set( 1.0, 30.0, 95.0 )
        this.controls.target.set( 0.0, 1.0, 0.0 );
        this.controls.minDistance = 0.1;
        this.controls.maxDistance = 100;
        this.controls.update();

        // Lights
        let hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 0.5 );
        this.scene.add( hemiLight );

        new RGBELoader().setPath( '../data/hdrs/' ).load( 'cafe.hdr', ( texture ) => {

            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.hdrTex = new BlurredEnvMapGenerator( this.renderer ).generate( texture , 1 )
            this.scene.environment = texture;

            this.renderer.render( this.scene, this.camera );
        } );

        // GUI
        this.initGUI();

        this.loaderGLB.load( '../data/chess.gltf', (glb) => {

            let model = glb.scene;
            model.castShadow = true;
            
            model.traverse( (object) => {
                if ( object.isMesh || object.isSkinnedMesh ) {
                    object.material.side = THREE.FrontSide;
                    object.frustumCulled = false;
                    object.castShadow = true;
                    object.receiveShadow = true;
                    if (object.material.map) 
                        object.material.map.anisotropy = 16; 
                }
            } );

            this.scene.add( model );
    
            // Call the loop
            this.animate();
            document.querySelector("#loading").style.display = 'none';
        } );

        window.addEventListener( "resize", this.onWindowResize.bind(this) );
    }

    initGUI() {

        let options = {
            
            theme: "White",
            
            setTheme: () => {
                switch(options.theme) {
                    case "White":
                        this.scene.background = new THREE.Color( 0xe7e6e5 );
                        break;
                    case "Dark":
                        this.scene.background = new THREE.Color( 0x2e2e2e );
                        break;
                    case "Complex":
                        this.scene.background = this.hdrTex;
                        break;
                    default:
                        this.scene.background = new THREE.Color( 0xe7e6e5 ); 
                }
            },
        };
        
        // See documentation to add more options at https://github.com/dataarts/dat.gui/blob/master/API.md
        let gui = new datGui.GUI();

        gui.add(options, 'theme', ["White", "Dark", "Complex"]).name("Theme").onChange(options.setTheme);

        gui.close();
        this.gui = gui;
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