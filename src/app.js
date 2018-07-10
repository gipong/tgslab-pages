import './css/bootstrap.min.css';
// import './css/animate.min.css';
import './css/style.css';

import './js/jquery.min.js';
import * as THREE from './js/three.min.js';
import './js/bootstrap.min.js';
import './js/jquery.easing.min.js';
// import './js/wow.min.js';

$("nav").find("a").click(function(e) {
    e.preventDefault();
    $("html, body").animate({
        scrollTop: $($(this).attr("href")).offset().top - 120
    });
});

$(".nav-link").hover(function() {
    $(this).addClass('hoverOne').css({'transform': 'scale(1.4)'});
    $(".nav-link:not(.hoverOne)").css({
        'transform': 'scale(0.8)',
        'opacity': 0.35
    })
}, function() {
    $(this).removeClass('hoverOne').css({'transform': 'scale(1)'});
    $(".nav-link:not(.hoverOne)").css({
        'transform': 'scale(1)',
        'opacity': 1
    })
});

//    let prevScrollpos = window.pageYOffset;
//    window.onscroll = function() {
//        let currentScrollPos = window.pageYOffset;
//        if (prevScrollpos > currentScrollPos) {
//            document.getElementById("navbar").style.top = "0";
//        } else {
//            document.getElementById("navbar").style.top = "-130px";
//        }
//        prevScrollpos = currentScrollPos;
//    };

let themeSet = {
    blue: 0x3b567a,
    yellow: 0xf0d770,
    white: 0xb3cde0
};
let colorSet = {
    red: 0xf25346,
    white: 0xd8d0d1,
    brown: 0x59332e,
    pink: 0xF5986E,
    brownDark: 0x23190f,
    blue: 0x87cedb,
    yellow: 0xfab30b,
    black: 0x000000,
};

window.addEventListener('load', init, false);

function init() {
    createScene();
    createLights();
    createSphere();
    createGalaxy();
    createSatellite();

    document.addEventListener('mousemove', handleMouseMove, false);
    document.addEventListener('click', rotateSatellite, false);
    loop();
}

let scene, camera, fov, aspRatio, np, fp,
    HEIGHT, WIDTH, renderer, container,
    hemisphereLight, shadowLight, ambientLight;

function createScene() {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

    aspRatio = WIDTH/HEIGHT;
    fov = 60;
    np = 1;
    fp = 10000;
    camera = new THREE.PerspectiveCamera(fov, aspRatio, np, fp);

    camera.position.set(0, 100, 200);

    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });

    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;

    container = document.getElementById('world');
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH/HEIGHT;
    camera.updateProjectionMatrix();
}

function createLights() {
    hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, .9);
    ambientLight = new THREE.AmbientLight(0xdc8874, .5);
    shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    shadowLight.position.set(150, 350, 350);
    shadowLight.castShadow = true;

    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;

    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    scene.add(hemisphereLight);
    scene.add(ambientLight);
    scene.add(shadowLight);
}

let Sphere = function() {
    let geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10); //new THREE.SphereGeometry(100, 32, 32);
    geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

    let mat = new THREE.MeshPhongMaterial({
        color: colorSet.brownDark,
        transparent: true,
        opacity: .6,
        flatShading: THREE.FlatShading
    });
    this.waves = [];

    geom.mergeVertices();
    for(let i=0; i<geom.vertices.length; i++) {
        this.waves.push({
            x: geom.vertices[i].x,
            y: geom.vertices[i].y,
            z: geom.vertices[i].z,
            ang: Math.random()*Math.PI*2,
            amp: 5 + Math.random()*15,
            speed: 0.016 + Math.random()*0.032,
        })
    }

    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.receiveShadow = true;
};

Sphere.prototype.moveWaves = function() {
    for(let i=0; i<this.mesh.geometry.vertices.length; i++) {
        let v = this.mesh.geometry.vertices[i];
        let u = this.waves[i];

        v.x = u.x + Math.cos(u.ang)*u.amp;
        v.y = u.y + Math.sin(u.ang)*u.amp;
        u.ang += u.speed;
    }
    this.mesh.geometry.verticesNeedUpdate = true;
    sphere.mesh.rotation.z += .005;
};

let sphere;

function createSphere() {
    sphere = new Sphere();
    sphere.mesh.position.y = -600;
    scene.add(sphere.mesh);
}

let Star = function() {
    this.mesh = new THREE.Object3D();
    let geom = new THREE.BoxGeometry(20, 20, 20);
    let mat = new THREE.MeshPhongMaterial({
        color: colorSet.white,
        flatShading: THREE.FlatShading
    });

    for(let i=0; i< 3 + Math.floor(Math.random()*3); i++) {
        let m = new THREE.Mesh(geom, mat);
        m.position.x = i*15;
        m.position.y = Math.random()*20;
        m.position.z = Math.random()*5;

        m.rotation.z = Math.random()*Math.PI*2;
        m.rotation.y = Math.random()*Math.PI*2;

        let s = .1 + Math.random()*.9;
        m.scale.set(s, s, s);

        m.castShadow = true;
        m.receiveShadow = true;

        this.mesh.add(m);
    }
};

let Galaxy = function() {
    this.mesh = new THREE.Object3D();
    this.nStars = 30;

    let stepAngle = Math.PI*2/this.nStars;
    for(let i=0; i<this.nStars; i++) {
        let c = new Star();
        let a = stepAngle*i;
        let h = 850 + Math.random()*200;

        c.mesh.position.y = Math.sin(a)*h;
        c.mesh.position.x = Math.cos(a)*h;

        c.mesh.rotation.z = a + Math.PI/2;
        c.mesh.position.z = -300 - Math.random()*400;

        let s = 1 + Math.random()*2;
        c.mesh.scale.set(s, s, s);

        this.mesh.add(c.mesh);
    }
};

let galaxy;

function createGalaxy() {
    galaxy = new Galaxy();
    galaxy.mesh.position.y = -600;
    scene.add(galaxy.mesh);
}

let Satellite = function() {
    this.mesh = new THREE.Object3D();

    let geomBody = new THREE.BoxGeometry(80, 50, 50, 1, 1, 1);
    let matBody = new THREE.MeshPhongMaterial({color: colorSet.yellow});
    let body = new THREE.Mesh(geomBody, matBody);
    body.castShadow = true;
    body.receiveShadow = true;
    this.mesh.add(body);

    let geomBar = new THREE.BoxGeometry(10, 10, 370, 1, 1, 1);
    let matBar = new THREE.MeshPhongMaterial({color: colorSet.black});
    let bar = new THREE.Mesh(geomBar, matBar);
    bar.castShadow = true;
    bar.receiveShadow = true;
    this.mesh.add(bar);

    this.rightSideSet = new THREE.Object3D();
    for(let i=0; i<3; i++) {
        let geoRight = new THREE.BoxGeometry(10, 100, 35, 2, 1, 1);
        let matRight = new THREE.MeshPhongMaterial({color: colorSet.blue});
        let rightSide = new THREE.Mesh(geoRight, matRight);
        rightSide.position.z = -(75+i*40);
        rightSide.rotation.z = -Math.PI/4;
        rightSide.castShadow = true;
        rightSide.receiveShadow = true;
        this.rightSideSet.add(rightSide);
    }
    this.mesh.add(this.rightSideSet);

    this.leftSideSet = new THREE.Object3D();
    for(let i=0; i<3; i++) {
        let geoLeft = new THREE.BoxGeometry(10, 100, 35, 2, 1, 1);
        let matLeft = new THREE.MeshPhongMaterial({color: colorSet.blue});
        let leftSide = new THREE.Mesh(geoLeft, matLeft);
        leftSide.position.z = (75+i*40);
        leftSide.rotation.z = -Math.PI/6;
        leftSide.castShadow = true;
        leftSide.receiveShadow = true;
        this.leftSideSet.add(leftSide);
    }
    this.mesh.add(this.leftSideSet);

};

let satellite;

function createSatellite() {
    satellite = new Satellite();
    satellite.mesh.scale.set(.25, .25, .25);
    satellite.mesh.position.y = 100;
    satellite.mesh.rotation.x = Math.PI/6;
    scene.add(satellite.mesh);
}

function loop() {
    satellite.mesh.rotation.y += speed*0.006;
    satellite.mesh.position.y = normalize(mousePos.y, -1, 1, 80, 150);
    satellite.mesh.position.x = normalize(mousePos.x, -1, 1, -80, 80);
    satellite.rightSideSet.rotation.z += wspeed*Math.random();
    satellite.leftSideSet.rotation.z -= wspeed*Math.random();

    sphere.mesh.rotation.z += .001;
    galaxy.mesh.rotation.z += .005;
    sphere.moveWaves();

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
}

let mousePos = {
    x: 0, y: 0
};
let speed = 1;
let wspeed = 0;

function handleMouseMove(evt) {
    let tx = -1 + (evt.clientX/WIDTH)*2;
    let ty = 1 - (evt.clientY/HEIGHT)*2;
    mousePos = {
        x: tx, y: ty
    };
}

function rotateSatellite() {
    speed = 10;
    window.setTimeout(()=>{speed = 1; wspeed = 0.08;}, 750);
    window.setTimeout(()=>{wspeed = 0;}, 1750);
}

function normalize(pos, min, max, tmin, tmax) {
    let n = Math.max(Math.min(pos, max), min);
    let v = (n-min)/(max-min);
    return tmin+v*(tmax-tmin);
}
