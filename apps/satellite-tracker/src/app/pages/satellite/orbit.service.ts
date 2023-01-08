import { Injectable } from '@angular/core';
import { IOrbit } from 'shared/domain';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Injectable({
    providedIn: 'root',
})
export class OrbitService {
    earthRadius = 6371;
    maxSMAEarth = 1600000;
    ellipseObject = new THREE.Object3D();
    ellipse = new THREE.Line();
    ellipseCurve = new THREE.EllipseCurve(0, 0, 1, 1, 0, 2 * Math.PI, false, 0);
    satelliteMesh = new THREE.Mesh();
    equatorialPlane = new THREE.Mesh();
    fitCameraToOrbit: any;
    scale = 0.0001;

    constructor() {}

    createOrbitScene(container: Element, orbit: IOrbit, color: string = '#000000') {
        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth * 0.9, window.innerHeight);
        container.appendChild(renderer.domElement);

        let camera = this.createCamera();

        const controls = this.createControls(camera, renderer);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 0, 50);
        directionalLight.lookAt(scene.position);
        scene.add(directionalLight);

        scene.add(new THREE.AmbientLight(0x333333));

        const hemiLight = new THREE.HemisphereLight(0xfffff, 0xffffff, 0.6);
        hemiLight.position.set(0, 500, 0);
        scene.add(hemiLight);

        const earth = this.createEarth();
        scene.add(earth);

        this.createOrbit(orbit, scene);
        this.createGuideLines(scene);

        const satelliteMesh = new THREE.Mesh(
            // new THREE.SphereGeometry(200 * this.scale, 32, 32),
            new THREE.BoxGeometry(200 * this.scale, 200 * this.scale, 200 * this.scale),
            new THREE.MeshPhongMaterial({ color: color, shininess: 100 })
        );
        scene.add(satelliteMesh);
        this.satelliteMesh = satelliteMesh;

        this.fitCameraToOrbit = function (newOrbit: IOrbit) {
            const posZ = ((newOrbit.semiMajorAxis ? newOrbit.semiMajorAxis * this.scale * 2 : 0) + 3) * 1.1;
            if (posZ < 5) {
                camera.position.set(-1, 2, 5);
                directionalLight.position.set(0, 0, 50);
                camera.far = 100;
            } else {
                camera.position.set(posZ - 6, posZ - 3, posZ);
                directionalLight.position.set(0, 0, posZ + 50);
                camera.far = posZ * 3;
            }
            satelliteMesh.scale.setScalar(posZ / 2.5);
            camera.lookAt(0, 0, 0);
            controls.update();
        };

        this.changeEllipseGeometry(orbit);

        const scale = this.scale;
        let time = 0;
        const earthRotation = 0.003;

        // let guide = new THREE.Line(
        //     new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 10, 10)]),
        //     new THREE.LineBasicMaterial({ color: 0xff0000 })
        // );
        // scene.add(guide);

        let rotation = this.ellipse.rotation;

        console.log(orbit);
        const animate = function () {
            requestAnimationFrame(animate);
            time += orbit.period ? earthRotation / orbit.period : 0;

            if (!orbit.eccentricity) orbit.eccentricity = 0;
            if (!orbit.inclination) orbit.inclination = 0;
            if (!orbit.longitudeOfAscendingNode) orbit.longitudeOfAscendingNode = 0;
            if (!orbit.argumentOfPerigee) orbit.argumentOfPerigee = 0;

            const xR = 0;
            const yR = orbit.inclination * (Math.PI / 180);
            const zR = 0;

            const xTranslation = orbit.eccentricity * orbit.semiMajorAxis * scale;

            const x0 = orbit.semiMajorAxis * scale * Math.cos(time) - xTranslation;
            const y0 = orbit.semiMajorAxis * scale * Math.sqrt(1 - orbit.eccentricity ** 2) * Math.sin(time);
            const z = 0;

            const x =
                x0 * Math.cos(-orbit.argumentOfPerigee * (Math.PI / 180)) -
                y0 * Math.sin(-orbit.argumentOfPerigee * (Math.PI / 180));
            const y =
                x0 * Math.sin(-orbit.argumentOfPerigee * (Math.PI / 180)) +
                y0 * Math.cos(-orbit.argumentOfPerigee * (Math.PI / 180));

            const x1 = x;
            const y1 = y * Math.cos(xR) - z * Math.sin(xR);
            const z1 = y * Math.sin(xR) + z * Math.cos(xR);

            const x2 = x1 * Math.cos(yR) + z1 * Math.sin(yR);
            const y2 = y1;
            const z2 = -x1 * Math.sin(yR) + z1 * Math.cos(yR);

            const x3 = x2 * Math.cos(zR) - y2 * Math.sin(zR);
            const y3 = x2 * Math.sin(zR) + y2 * Math.cos(zR);
            const z3 = z2;

            // guide.geometry.setAttribute(
            //     'position',
            //     new THREE.BufferAttribute(new Float32Array([x3, y3, z3, 0, 0, 0]), 3)
            // );
            // guide.rotation.y = orbit.longitudeOfAscendingNode * (Math.PI / 180);

            const pos = new THREE.Vector3(x3, y3, z3);
            pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
            pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), orbit.longitudeOfAscendingNode * (Math.PI / 180));
            // pos.applyAxisAngle(new THREE.Vector3(0.5, 0.5, 0), orbit.argumentOfPerigee * (Math.PI / 180));
            satelliteMesh.position.set(pos.x, pos.y, pos.z);

            earth.rotation.y += earthRotation;

            controls.update();
            renderer.render(scene, camera);
        };

        animate();
    }

    private createCamera() {
        const camera = new THREE.PerspectiveCamera(50, (window.innerWidth * 0.9) / window.innerHeight, 0.1, 1000);
        camera.position.set(-1, 2, 5);
        return camera;
    }

    private createControls(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;
        controls.enablePan = false;
        return controls;
    }

    private createEarth() {
        const earthGeometry = new THREE.SphereGeometry(this.earthRadius * this.scale, 32, 32);
        const earthMaterial = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load('../../../assets/images/earth.png'),
        });
        return new THREE.Mesh(earthGeometry, earthMaterial);
    }

    private createOrbit(orbit: IOrbit, scene: THREE.Scene) {
        this.ellipse.material = new THREE.LineBasicMaterial({ color: 0xa6a6a6 });
        // this.ellipse.rotation.set(Math.PI / 2, Math.PI, Math.PI / 2);
        // this.ellipse.rotation.x = Math.PI / 2;
        // this.ellipse.rotation.y = Math.PI;
        // this.ellipse.rotation.z = Math.PI / 2;
        this.ellipseObject.add(this.ellipse);
        this.changeEllipseRotation(orbit);
        scene.add(this.ellipseObject);
    }

    private createGuideLines(scene: THREE.Scene) {
        scene.add(
            new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(0, -(2 * this.earthRadius * this.scale), 0),
                    new THREE.Vector3(0, 2 * this.earthRadius * this.scale, 0),
                ]),
                new THREE.LineBasicMaterial({ color: 0xa6a6a6 })
            )
        );

        scene.add(
            new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(-(2 * this.earthRadius * this.scale), 0, 0),
                    new THREE.Vector3(2 * this.earthRadius * this.scale, 0, 0),
                ]),
                new THREE.LineBasicMaterial({ color: 0xffff00 })
            )
        );

        scene.add(
            new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(0, 0, -(2 * this.earthRadius * this.scale)),
                    new THREE.Vector3(0, 0, 2 * this.earthRadius * this.scale),
                ]),
                new THREE.LineBasicMaterial({ color: 0xff0000 })
            )
        );

        this.equatorialPlane.material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide,
            opacity: 0.4,
            transparent: true,
        });
        this.equatorialPlane.rotation.x = Math.PI / 2;

        scene.add(this.equatorialPlane);
    }

    changeEllipseGeometry(orbit: IOrbit) {
        this.ellipseCurve.aX = orbit.semiMajorAxis * this.scale * orbit.eccentricity!;
        this.ellipseCurve.xRadius = orbit.semiMajorAxis * this.scale;
        this.ellipseCurve.yRadius =
            orbit.semiMajorAxis * this.scale * Math.sqrt(1 - (orbit.eccentricity ? orbit.eccentricity : 0) ** 2);
        this.ellipse.geometry = new THREE.BufferGeometry().setFromPoints(this.ellipseCurve.getPoints(100));

        let planeSize = orbit.semiMajorAxis * this.scale * 2;
        if (planeSize < 2) planeSize = 2;
        this.equatorialPlane.geometry = new THREE.PlaneGeometry(planeSize, planeSize, 32);
        this.fitCameraToOrbit(orbit);
    }

    changeEllipseRotation(orbit: IOrbit) {
        if (!orbit.inclination) orbit.inclination = 0;
        if (!orbit.longitudeOfAscendingNode) orbit.longitudeOfAscendingNode = 0;
        if (!orbit.argumentOfPerigee) orbit.argumentOfPerigee = 0;

        this.ellipse.rotation.z = orbit.argumentOfPerigee * (Math.PI / 180);
        this.ellipse.rotation.y = Math.PI + orbit.inclination * (Math.PI / 180);

        this.ellipseObject.rotation.z = -orbit.longitudeOfAscendingNode * (Math.PI / 180);
        this.ellipseObject.rotation.x = Math.PI / 2;
    }

    changeColorSatellite(color: string) {
        this.satelliteMesh.material = new THREE.MeshBasicMaterial({
            color: color,
        });
    }
}
