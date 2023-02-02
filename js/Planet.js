import * as THREE from "three";

class Planet {

    constructor(name, options, textures) {
        
        // physics
        if (options) {
            this.radius = options.radius || 1;              // in Mm (1000 km)
            this.mass = options.mass || 1;                  // in kg
            this.gravity = options.gravity || 9.8;          // in m/s^2
            this.velocityRotation = options.velRot || 1;    // in Mm/s
            this.velocityOrbital = options.velOrb || 1;     // in Mm/s
        } 

        // assets
        this.mesh = new THREE.Mesh( new THREE.SphereGeometry( this.radius, 32, 16 ),  new THREE.MeshStandardMaterial() );
        if (options.position) this.mesh.position = new THREE.Vector3(options.position);
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
        
        this.velocity = undefined;
        this.name = this.mesh.name = name || "Unnamed";
    }

    getPosition() {
        return this.mesh.position;
    }

    setPosition(vec3Pos) {
        this.mesh.position.copy(vec3Pos);
    }

    setDiffuseMap(pathDiff) {
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

    setInitialVelocity(orbiteCenter) {
        this.velocity = new THREE.Vector3();
        
        let dir = new THREE.Vector3();
        dir.subVectors(orbiteCenter, this.getPosition()).normalize();

        let right = new THREE.Vector3();
        right.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();

        this.velocity.copy( right.multiplyScalar(this.velocityOrbital) );
    }

    rotate(delta) {
        this.mesh.rotation.y += this.velocityRotation * delta;
    }

}

export { Planet };