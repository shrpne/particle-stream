import * as THREE from 'three';
import SimplexNoise from './vendor/SimplexNoise';

export default function Particles(options) {
    let _this = this;
    let positions, colors, alphas, velocity;
    const noise = new SimplexNoise();

    /*let colorFromPosition = (function () {
        let tmpColor = new THREE.Color(options.particlesColor);
        let clearColor = new THREE.Color(options.clearColor);
        let deltaR = tmpColor.r - clearColor.r;
        let deltaG = tmpColor.g - clearColor.g;
        let deltaB = tmpColor.b - clearColor.b;
        return function (nx, ny, nz) {
            //tmpColor.setRGB(nx, ny, nz);
            //let hsl = tmpColor.getHSL();
            let opacity;
            if (ny < 0.2 || ny > 0.8) {
                opacity = Math.abs(Math.abs(ny - 0.5) - 0.5) * 5;
            } else {
                opacity = 1;
            }
            return tmpColor.setRGB(clearColor.r + deltaR * opacity, clearColor.g + deltaG * opacity, clearColor.b + deltaB * opacity);
            //return tmpColor.setHSL(hsl.h, opacity, Math.max(opacity / 2, 0.08));
        }
    })();*/
    function alphaFromPosition(ny) {
        let opacity;
        if (ny < 0.2 || ny > 0.8) {
            opacity = Math.abs(Math.abs(ny - 0.5) - 0.5) * 5;
        } else {
            opacity = 1;
        }
        return opacity;
    }
    function generateTexture() {
        let canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 2048;
        let ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(1024,1024,1024,0,2*Math.PI);
        ctx.fill();

        let texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    this.fillParticleData = function(newOpts) {
        if (newOpts) {
            options = newOpts;
        }
        let size2 = options.size / 2;
        let sizeH2 = options.sizeH / 2;
        for (let i = 0; i < positions.length; i += 3) {
            velocity[i] = Math.random() - 0.5;
            velocity[i + 2] = Math.random() - 0.5;
            // positions
            let angle = 2 * Math.PI * Math.random();
            let u = Math.random() + Math.random();
            let radius = u > 1 ? 2 - u : u;
            positions[i] = radius * Math.cos(angle) * size2;
            positions[i + 1] = Math.random() * options.sizeH - sizeH2;
            positions[i + 2] = radius * Math.sin(angle) * size2;
            // colors
            //let nx = positions[i] / options.size + 0.5;
            let ny = positions[i + 1] / options.sizeH + 0.5;
            //let nz = positions[i + 2] / options.size + 0.5;
            // let color = colorFromPosition(nx, ny, nz);
            // colors[i]     = color.r;
            // colors[i + 1] = color.g;
            // colors[i + 2] = color.b;
            alphas[i / 3] = alphaFromPosition(ny);
        }
    };

    function init() {
        let geometry = new THREE.BufferGeometry();
        positions = new Float32Array(options.particlesCount * 3);
        //colors = new Float32Array(options.particlesCount * 3);
        alphas = new Float32Array(options.particlesCount);
        velocity = new Float32Array(options.particlesCount * 3);

        _this.fillParticleData();

        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3).setDynamic(true));
        //geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3).setDynamic(true));
        geometry.addAttribute('alpha', new THREE.BufferAttribute(alphas, 1).setDynamic(true));
        geometry.computeBoundingSphere();
        //

        // uniforms
        let uniforms = {
            size: {value: options.particlesSize},
            color: {value: new THREE.Color(options.particlesColor)},
            //texture: {value: new THREE.TextureLoader().load("disc.png")}
            texture: {value: generateTexture()}
        };
        // point cloud material
        let material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: document.getElementById('vertexshader').textContent,
            fragmentShader: document.getElementById('fragmentshader').textContent,
            //blending: THREE.SubtractiveBlending,
            depthTest: false,
            depthWrite: false,
            //alphaTest: 0.5,
            transparent: true,
        });

        _this.particleCloud = new THREE.Points(geometry, material);
    }

    _this.animateStream = function () {
        let time = Date.now();

        let size2 = options.size / 2;
        let sizeH2 = options.sizeH / 2;
        for (let i = 0; i < positions.length; i += 3) {
            velocity[i] *= options.velocitySlowing;
            velocity[i + 1] *= options.velocitySlowing;
            velocity[i + 2] *= options.velocitySlowing;
            // noise force
            let nx = positions[i] / options.size + 0.5;
            let ny = positions[i + 1] / options.sizeH + 0.5;
            let nz = positions[i + 2] / options.size + 0.5;
            velocity[i] += noise.noise3d(nx / options.noiseModifer, ny / options.noiseModifer, time * 0.05 / options.noiseModifer) * options.noiseStrength;
            velocity[i + 1] += noise.noise3d(ny / options.noiseModifer, nz / options.noiseModifer, time * 0.05 / options.noiseModifer) * options.noiseStrength;
            velocity[i + 2] += noise.noise3d(nz / options.noiseModifer, nx / options.noiseModifer, time * 0.05 / options.noiseModifer) * options.noiseStrength;
            velocity[i] += (Math.random() - 0.5) * 0.1;
            velocity[i + 2] += (Math.random() - 0.5) * 0.1;

            // gravity force
            let radiusScale = Math.pow(positions[i] / options.size, 2) + Math.pow(positions[i + 2] / options.size, 2);
            radiusScale = Math.pow(radiusScale, 2) / 200;
            velocity[i] += -positions[i] / size2 * radiusScale;
            velocity[i + 2] += -positions[i + 2] / size2 * radiusScale;
            //if (i === 0) { console.log(positions[i], positions[i + 1], positions[i + 2], radiusScale) }

            // limit velocity
            // velocity[i] = Math.min(2, Math.max(-2, velocity[i]));
            // velocity[i + 2] = Math.min(2, Math.max(-2, velocity[i + 2]));

            // update positions
            positions[i] += velocity[i];
            positions[i + 1] += velocity[i + 1] * 0.5 - 1;
            positions[i + 2] += velocity[i + 2];

            // recalc positions
            if (positions[i + 1] < -1 * sizeH2) {
                let angle = 2 * Math.PI * Math.random();
                let u = Math.random() + Math.random();
                let radius = u > 1 ? 2 - u : u;
                positions[i] = radius * Math.cos(angle) * size2;
                positions[i + 1] = sizeH2;
                positions[i + 2] = radius * Math.sin(angle) * size2;
                velocity[i] = Math.random() - 0.5;
                velocity[i + 2] = Math.random() - 0.5;
            }
            // colors
            // let color = colorFromPosition(nx, ny, nz);
            // colors[i]     = color.r;
            // colors[i + 1] = color.g;
            // colors[i + 2] = color.b;
            alphas[i / 3] = alphaFromPosition(ny);
        }
        _this.particleCloud.geometry.attributes.position.needsUpdate = true;
        //_this.particleCloud.geometry.attributes.color.needsUpdate = true;
        _this.particleCloud.geometry.attributes.alpha.needsUpdate = true;

        _this.particleCloud.rotation.y =  time * 0.00007;
    };



    init();
}
