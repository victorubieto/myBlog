import * as THREE from "three";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js";
import { GUI } from "https://cdn.skypack.dev/lil-gui";
import { Planet } from "./Planet.js";

class App {

    constructor() {
        this.clock = new THREE.Clock();

        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.controls = null;

        this.G = 1; // Gravitational constant
    }
    
    init() {
    
        let scene = this.scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x1f1f1f1f );
        let gridHelper = new THREE.GridHelper( 10, 10 );
        gridHelper.name = "GridHelper";
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
        controls.object.position.set(0.0, 3, 6);
        controls.target.set(0.0, 0.0, 0.0);
        controls.minDistance = 0.1;
        controls.maxDistance = 100;
        controls.update();

        // Lights
        let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.05);
        scene.add(hemiLight);
        let dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
        let dirtarget = new THREE.Object3D();
        dirtarget.position.set(-0.5, 0.0, -0.5); 
        dirLight.target = dirtarget;
        dirLight.target.updateMatrixWorld();
        scene.add(dirLight);

        // ---------- Add entities in scene ----------
        // scale relation earth     radius: 6.371km = 1m    mass: 10^20kg = 1kg
        let earth = new Planet('Earth', {mass: 59721.9}, {diffuse: '../data/textures/coast_land_rocks_01_diff_1k.png', normal: '../data/textures/coast_land_rocks_01_nor_gl_1k.png'});
        this.scene.add(earth.mesh);
        
        // moon is 0.2727 smaller than earth
        let moon = new Planet('Moon', {radius: earth.radius * 0.2727, mass: 734.767309}, {diffuse: '../data/textures/rough_plasterbrick_05_diff_1k.png', normal: '../data/textures/rough_plasterbrick_05_nor_gl_1k.png'});
        moon.mesh.position.x = earth.mesh.position.x + 4; // 384.467km / 6.371km = 60,35
        this.scene.add(moon.mesh);
        // -------------------------------------------

        let arrowHelper1 = this.arrowHelper1 = new THREE.ArrowHelper(new THREE.Vector3(1,1,1), new THREE.Vector3(0,0,0), 1, 0xffff00);
        let arrowHelper2 = this.arrowHelper2 = new THREE.ArrowHelper(new THREE.Vector3(1,1,1), new THREE.Vector3(0,0,0), 1, 0xff0000);
        scene.add( arrowHelper1 );
        scene.add( arrowHelper2 );

        // Call the loop
        this.initGUI();
        this.animate();
        document.querySelector("#loading").style.display = 'none';

        window.addEventListener( "resize", this.onWindowResize.bind(this) );
    }

    initGUI() {

        let gui = new GUI().title('Big Little Planet Controls');

        let options = this.options = {
            grid: true,
            space: false,
            orbitDebug: false,

            timeMuliplier: 1,
            timeSet: 0,
        };

        gui.add(options,'grid').name('Show Grid').listen().onChange( (value) => {
            this.scene.getObjectByName("GridHelper").visible = value;
        } );
        gui.add(options,'space').name('Show Space');
        gui.add(options,'orbitDebug').name('Show Orbit Debug');
        gui.add(options,'timeMuliplier', -2, 2).name('Time Multiplier');
        
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

        let delta = dt * this.options.timeMuliplier;
        
        let earth = this.scene.getObjectByName("Earth");
        let moon = this.scene.getObjectByName("Moon");

        if (earth) {
            earth.rotation.y += 0.03 * delta;
        }
        if (moon) {
            //direction moon-earth for gravity
            let dir = new THREE.Vector3();
            dir.subVectors(earth.position, moon.position).normalize();

            //perpendicular axis for horizontral velocity
            let right = new THREE.Vector3();
            right.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();

            //move moon
            moon.position.addScaledVector(dir, 0.00051 * delta);
            moon.position.addScaledVector(right, 0.6 * delta);

            //rotate moon to face earth
            moon.lookAt(dir);

            // arroy helper reposition
            this.arrowHelper1.setDirection(dir);
            this.arrowHelper2.setDirection(right);
            this.arrowHelper1.position.copy(moon.position);
            this.arrowHelper2.position.copy(moon.position);
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