import Detector from './vendor/Detector';
if (! Detector.webgl) Detector.addGetWebGLMessage();


import * as THREE from 'three';
import Stats from '../node_modules/stats.js/src/Stats';
import dat from '../node_modules/dat.gui/build/dat.gui';
import orbitInit from 'three-orbit-controls';
import Particles from './Particles'



let options = new function() {
    this.size = 700; // particles spread in the plane
    this.sizeH= 2100; // particles spread in height
    this.noiseModifer = 0.95;
    this.noiseStrength = 0.15;
    this.velocitySlowing = 0.99;
    this.clearColor = 0xf1f5f9;
    this.particlesCount = 15000;
    this.particlesColor = 0x222222;
    this.particlesSize = 16.0;
};
let camera, scene, renderer;
let container, stats, orbit;
let particles = new Particles(options);
options.recalculate = function () {
    particles.fillParticleData(options);
};



init();
initGui();
animate();
function initGui() {
    let gui = new dat.GUI();
    gui.add(options, 'size');
    gui.add(options, 'sizeH');
    gui.add(options, 'noiseModifer', 0, 2);
    gui.add(options, 'noiseStrength', 0, 5);
    gui.add(options, 'velocitySlowing', 0, 1);
    gui.add(options, 'recalculate');
}
function init() {
    container = document.getElementById('container');
    //
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 5, 15000);
    camera.position.z = 3000;
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(options.clearColor, 1000, 15000);
    //

    scene.add(particles.particleCloud);
    //
    renderer = new THREE.WebGLRenderer({ antialias: false, logarithmicDepthBuffer: true });
    renderer.setClearColor(options.clearColor);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    //
    let OrbitControls = orbitInit(THREE);
    orbit = new OrbitControls(camera, renderer.domElement);
    //
    stats = new Stats();
    container.appendChild(stats.dom);
    //
    window.addEventListener('resize', onWindowResize, false);
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
//
function animate() {
    particles.animateStream();

    renderer.render(scene, camera);
    stats.update();
    orbit.update();

    requestAnimationFrame(animate);
    //setTimeout(animate, 500)
}

















