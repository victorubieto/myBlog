import * as THREE from "three";

class Planet {

    constructor(name, options, textures) {
        
        // physics
        if (options) {
            this.radius = options.radius || 1;
            this.mass = options.mass || 1;
            this.gravity = options.gravity || 9.8;
            this.rotationVelocity = options.rotVel || 1;
            this.orbitVelocity = options.orbVel || 1;
        } 

        // assets
        this.mesh = new THREE.Mesh( new THREE.SphereGeometry( this.radius, 32, 16 ),  new THREE.MeshStandardMaterial() );
        if (textures) {
            if (textures.diffuse) {
                let diffmap = new THREE.TextureLoader().load(textures.diffuse,
                    undefined, undefined, () => { console.error("The texture has not been loaded correctly."); }
                );
                this.mesh.material.map = diffmap;
            }
            if (textures.normal) {
                let normap = new THREE.TextureLoader().load(textures.normal,
                    undefined, undefined, () => { console.error("The texture has not been loaded correctly."); }
                );
                this.mesh.material.normalMap = normap;
            }
        }

        this.mesh.name = name || "Unnamed";
    }

    setDiffuseMappathDiff() {
        let diffmap = new THREE.TextureLoader().load(pathDiff,
            undefined, undefined, () => { console.error("The texture has not been loaded correctly."); }
        );
        this.mesh.material.map = diffmap;
    }

    setNormalMap(pathNor) {
        let normap = new THREE.TextureLoader().load(pathNor,
            undefined, undefined, () => { console.error("The texture has not been loaded correctly."); }
        );
        this.mesh.material.normalMap = normap;
    }

}

export { Planet };