import * as THREE from "three";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js";
import { GUI } from "https://cdn.skypack.dev/lil-gui";
import { Planet } from "./Planet.js";

class App {

    constructor() {
        // time attributes
        this.clock = new THREE.Clock();
        this.date = "1/1/0 00:00"
        this.timeStep = 0.005; // 0.005
        this.maxDelta = 0.02;

        // scene attributes
        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.controls = null;

        // constants
        this.G = 6.6743e-29; // Gravitational constant (Mm^3 kg^-1 s^-2)

        this.planets = [];
    }
    
    init() {
    
        let scene = this.scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x1f1f1f1f );
        let gridHelper = new THREE.GridHelper( 100, 10 );   // square = 10 Mm^2
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
        let camera = this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 10000 );
        let controls = this.controls = new OrbitControls( camera, renderer.domElement );
        controls.object.position.set( 0.0, 100, 300 );
        controls.target.set( 0.0, 0.0, 0.0 );
        controls.minDistance = 1;
        controls.maxDistance = 1000;
        controls.update();

        // Lights
        let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.05 );
        scene.add(hemiLight);
        let dirLight = new THREE.DirectionalLight( 0xffffff, 0.3 );
        let dirtarget = new THREE.Object3D();
        dirtarget.position.set( -0.5, 0.0, -0.5 ); 
        dirLight.target = dirtarget;
        dirLight.target.updateMatrixWorld();
        scene.add(dirLight);

        //////////////////////////////////////////////////////////////////////////////////////////////////
        //                                  Add entities in scene                                       //
        //////////////////////////////////////////////////////////////////////////////////////////////////

        let earth = new Planet('Earth', 
            { radius: 6.371, mass: 5.97219e24, gravity: 9.80665, velRot: 0.0004651, velOrb: 0.02978 }, 
            { diffuse: '../data/textures/coast_land_rocks_01_diff_1k.png', normal: '../data/textures/coast_land_rocks_01_nor_gl_1k.png' });
        this.scene.add(earth.mesh);
        this.planets.push(earth);
        
        let moon = new Planet('Moon', 
            { radius: 1.7374, mass: 7.34767309e22, gravity: 1.622, velRot: 0.000004627, velOrb: 0.001022 }, 
            { diffuse: '../data/textures/rough_plasterbrick_05_diff_1k.png', normal: '../data/textures/rough_plasterbrick_05_nor_gl_1k.png' });
        this.scene.add(moon.mesh);
        this.planets.push(moon);

        moon.setPosition( earth.getPosition().clone().add( new THREE.Vector3(384.4, 0.0, 0.0) ) );
        moon.setInitialVelocity( earth.getPosition().clone() );

        //////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////

        // Helpers and information
        let arrowHelper1 = this.arrowHelper1 = new THREE.ArrowHelper(new THREE.Vector3(1,1,1), new THREE.Vector3(0,0,0), 30, 0xffff00);
        let arrowHelper2 = this.arrowHelper2 = new THREE.ArrowHelper(new THREE.Vector3(1,1,1), new THREE.Vector3(0,0,0), 30, 0xff0000);
        scene.add( arrowHelper1 );
        scene.add( arrowHelper2 );

        var info = document.createElement('div');
        info.innerHTML = "Date: " + this.date;
        info.style.fontFamily = "sans-serif";
        info.style.color = "white";
        info.style.position = 'absolute';
        info.style.top = 20 + 'px';
        info.style.left = 20 + 'px';
        document.body.appendChild(info);

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
        gui.add(options,'timeMuliplier', -10, 1000000).name('Time Multiplier');
        
    }

    animate() {

        requestAnimationFrame( this.animate.bind(this) );
        let delta = this.clock.getDelta();

        this.update(delta * this.options.timeMuliplier);

        this.render();
        
        // Determine a static time step
        // let maxIters = Math.min(delta, this.maxDelta) * this.options.timeMuliplier;
        // if (maxIters >= 0) {
        //     for (let iDelta = 0; iDelta <= maxIters; iDelta += this.timeStep) {
        //         this.update(this.timeStep);
        //     }
        // } else {
        //     for (let iDelta = 0; iDelta <= -maxIters; iDelta += this.timeStep) {
        //         this.update(-this.timeStep);
        //     }
        // }
    }

    render() {

        if (!this.renderer)
            return;

        this.renderer.render(this.scene, this.camera);
    }

    update(dt) {

        //let earth = this.scene.getObjectByName("Earth");
        //let moon = this.scene.getObjectByName("Moon");
        let earth = this.planets.find(obj => { return obj.name === "Earth"} );
        let moon = this.planets.find(obj => { return obj.name === "Moon"} );

        if (earth) {
            earth.rotate(dt);
        }
        if (moon) {

            // Direction moon-earth for gravity
            let dir = new THREE.Vector3();
            dir.subVectors(earth.getPosition(), moon.getPosition()).normalize();

            // Perpendicular axis for horizontral velocity
            let right = new THREE.Vector3();
            right.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();

            // Move moon
            let r = earth.getPosition().distanceTo( moon.getPosition() );
            let force = this.G * earth.mass * moon.mass / (r*r); // universal gravitation force (kg Mm s^-2)
            let acceleration = dir.clone().multiplyScalar( (force / moon.mass) );
            moon.velocity.add( acceleration.multiplyScalar( dt ) );

            moon.getPosition().add( moon.velocity.clone().multiplyScalar( dt ) );
            
            //console.log(moon.velocity);
            console.log(moon.getPosition());

            //rotate moon to face earth
            moon.rotate(dt);

            // arroy helper reposition
            this.arrowHelper1.setDirection(dir);
            this.arrowHelper2.setDirection(right);
            this.arrowHelper1.position.copy(moon.getPosition());
            this.arrowHelper2.position.copy(moon.getPosition());
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