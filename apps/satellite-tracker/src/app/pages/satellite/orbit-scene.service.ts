import { Injectable, OnDestroy } from '@angular/core';
import { IOrbit, Shape } from 'shared/domain';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Injectable({
    providedIn: 'root',
})
export class OrbitService {
    earthRadius = 6371;
    maxSMAEarth = 1600000;
    scale = 0.0001;
    moonRadius = 1737.4;

    renderer: THREE.WebGLRenderer | undefined;
    ellipseObject = new THREE.Object3D();
    ellipse = new THREE.Line();
    ellipseCurve = new THREE.EllipseCurve(0, 0, 1, 1, 0, 2 * Math.PI, false, 0);
    satelliteMesh = new THREE.Mesh();
    realSatelliteMesh = new THREE.Mesh();
    xLine = new THREE.Line(new THREE.BufferGeometry());
    yLine = new THREE.Line(new THREE.BufferGeometry());
    zLine = new THREE.Line(new THREE.BufferGeometry());
    equatorialPlane = new THREE.Mesh();

    camera = new THREE.PerspectiveCamera();
    fitCameraToOrbit: any;
    guidelines = true;
    realColorAndSize = true;
    zoom = 1;

    constructor() {}

    createOrbitScene(
        container: Element,
        orbit: IOrbit,
        color: string = '#ffffff',
        shape: Shape = Shape.Cube,
        size = 200
    ) {
        const scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: container });
        const width = container.clientWidth;
        const height = container.clientHeight;
        this.renderer.setSize(width, height);

        this.createCamera();
        this.camera.aspect = width / height;
        let camera = this.camera;

        const controls = this.createControls(camera, this.renderer);

        let background = this.createBackground();
        scene.add(background);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 0, 0);
        directionalLight.lookAt(scene.position);
        scene.add(directionalLight);

        scene.add(new THREE.AmbientLight(0x333333));

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        hemiLight.position.set(0, 500, 0);
        scene.add(hemiLight);

        const earth = this.createEarth();
        scene.add(earth);

        this.createOrbit(orbit, scene);
        this.createGuideLines(scene);

        this.satelliteMesh = new THREE.Mesh(
            new THREE.BoxGeometry(200 * this.scale, 200 * this.scale, 200 * this.scale),
            new THREE.MeshPhongMaterial({ color: '#ffffff', shininess: 100 })
        );

        scene.add(this.satelliteMesh);
        this.satelliteMesh.visible = !this.realColorAndSize;

        if (shape === Shape.Sphere) {
            this.realSatelliteMesh = new THREE.Mesh(
                new THREE.BoxGeometry(size * this.scale, size * this.scale, size * this.scale),
                new THREE.MeshPhongMaterial({ color: color, shininess: 100 })
            );
        } else if (shape === Shape.Cube) {
            this.realSatelliteMesh = new THREE.Mesh(
                new THREE.SphereGeometry((size * this.scale) / 2, 32, 32),
                new THREE.MeshPhongMaterial({ color: color, shininess: 100 })
            );
        }

        scene.add(this.realSatelliteMesh);
        this.realSatelliteMesh.visible = this.realColorAndSize;

        const perigeeLine = new THREE.Line(
            new THREE.BufferGeometry(),
            new THREE.LineBasicMaterial({ color: 0x5a5b5c })
        );
        scene.add(perigeeLine);

        const perigee = new THREE.Mesh(
            new THREE.SphereGeometry(100 * this.scale, 32, 32),
            new THREE.MeshPhongMaterial({ color: 0x5a5b5c })
        );
        scene.add(perigee);

        this.fitCameraToOrbit = function (newOrbit: IOrbit, zoom = 1) {
            let cameraPos = newOrbit.semiMajorAxis * this.scale;
            if (cameraPos < 1.5) cameraPos = 1.5;
            cameraPos /= zoom;
            camera.position.set(-2.2 * cameraPos, 1.2 * cameraPos, 1.2 * cameraPos);
            directionalLight.position.set(50 + cameraPos, 0, 0);

            background.geometry = new THREE.SphereGeometry(cameraPos + 700, 32, 32);
            background.geometry.scale(-1, 1, 1);
            camera.far = cameraPos * 2 + 1100;

            this.satelliteMesh.scale.setScalar(cameraPos * 1.1);
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();
            controls.update();
        };

        this.changeEllipseGeometry(orbit);

        const scale = this.scale;
        let time = 0;
        const earthRotation = 0.003;

        const center = new THREE.Vector3(0, 0, 0);
        const xDirection = new THREE.Vector3(1, 0, 0);
        const yDirection = new THREE.Vector3(0, 1, 0);

        let getPositionInOrbit = function (orbit: IOrbit, time: number): THREE.Vector3 {
            const xR = 0;
            const yR = orbit.inclination! * (Math.PI / 180);
            const zR = 0;

            const xTranslation = orbit.eccentricity! * orbit.semiMajorAxis * scale;

            const x0 = orbit.semiMajorAxis * scale * Math.cos(time) - xTranslation;
            const y0 = orbit.semiMajorAxis * scale * Math.sqrt(1 - orbit.eccentricity! ** 2) * Math.sin(time);
            const z = 0;

            const perigee = -orbit.argumentOfPerigee! * (Math.PI / 180) + Math.PI / 2;

            const x = x0 * Math.cos(perigee) - y0 * Math.sin(perigee);
            const y = x0 * Math.sin(perigee) + y0 * Math.cos(perigee);

            const x1 = x;
            const y1 = y * Math.cos(xR) - z * Math.sin(xR);
            const z1 = y * Math.sin(xR) + z * Math.cos(xR);

            const x2 = x1 * Math.cos(yR) + z1 * Math.sin(yR);
            const y2 = y1;
            const z2 = -x1 * Math.sin(yR) + z1 * Math.cos(yR);

            const x3 = x2 * Math.cos(zR) - y2 * Math.sin(zR);
            const y3 = x2 * Math.sin(zR) + y2 * Math.cos(zR);
            const z3 = z2;

            const pos = new THREE.Vector3(x3, y3, z3);
            pos.applyAxisAngle(xDirection, Math.PI / 2);
            if (orbit.inclination != 0)
                pos.applyAxisAngle(yDirection, orbit.longitudeOfAscendingNode! * (Math.PI / 180));
            else pos.applyAxisAngle(yDirection, 0);
            return pos;
        };

        const animate = () => {
            requestAnimationFrame(animate);
            if (!orbit.eccentricity) orbit.eccentricity = 0;
            if (!orbit.inclination) orbit.inclination = 0;
            if (!orbit.longitudeOfAscendingNode) orbit.longitudeOfAscendingNode = 0;
            if (!orbit.argumentOfPerigee) orbit.argumentOfPerigee = 0;
            if (!orbit.period) orbit.period = 1;

            time -=
                ((earthRotation / orbit.period) *
                    (1 + 2 * orbit.eccentricity * Math.cos(time) + orbit.eccentricity ** 2)) /
                (1 - orbit.eccentricity ** 2);
            const pos = getPositionInOrbit(orbit, time);
            this.satelliteMesh.position.set(pos.x, pos.y, pos.z);
            this.realSatelliteMesh.position.set(pos.x, pos.y, pos.z);

            const perigeePos = getPositionInOrbit(orbit, 0);
            perigeeLine.geometry = new THREE.BufferGeometry().setFromPoints([perigeePos, center]);

            earth.rotation.y += earthRotation;

            controls.update();
            this.renderer!.render(scene, camera);
        };

        animate();
    }

    private createCamera() {
        this.camera.fov = 50;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.near = 0.1;
        this.camera.far = 1100;
        this.camera.position.set(-5, -1, 2);
        this.camera.updateProjectionMatrix();
    }

    private createControls(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;
        controls.enablePan = true;
        return controls;
    }

    private createBackground() {
        const bgTexture = new THREE.TextureLoader().load('assets/images/background3.jpg');
        bgTexture.repeat.set(12, 12);
        bgTexture.wrapS = THREE.RepeatWrapping;
        bgTexture.wrapT = THREE.RepeatWrapping;
        const sphereGeometry = new THREE.SphereGeometry(1000, 32, 32);
        sphereGeometry.scale(-1, 1, 1);
        const sphereMaterial = new THREE.MeshBasicMaterial({ map: bgTexture });
        return new THREE.Mesh(sphereGeometry, sphereMaterial);
    }

    private createEarth() {
        const earthGeometry = new THREE.SphereGeometry(this.earthRadius * this.scale, 32, 32);
        const earthMaterial = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load('assets/images/earth.png'),
        });
        return new THREE.Mesh(earthGeometry, earthMaterial);
    }

    private createOrbit(orbit: IOrbit, scene: THREE.Scene) {
        this.ellipse.material = new THREE.LineBasicMaterial({ color: 0xa6a6a6 });
        this.ellipseObject.add(this.ellipse);
        this.changeEllipseRotation(orbit);
        scene.add(this.ellipseObject);
    }

    private createGuideLines(scene: THREE.Scene) {
        const lineColor = 0x5a5b5c;
        this.xLine.material = new THREE.LineBasicMaterial({ color: lineColor });
        this.yLine.material = new THREE.LineBasicMaterial({ color: lineColor });
        this.zLine.material = new THREE.LineBasicMaterial({ color: lineColor });

        scene.add(this.xLine);
        scene.add(this.yLine);
        scene.add(this.zLine);

        this.equatorialPlane.material = new THREE.MeshBasicMaterial({
            color: lineColor,
            side: THREE.DoubleSide,
            opacity: 0.15,
            transparent: true,
        });
        this.equatorialPlane.rotation.x = Math.PI / 2;
        scene.add(this.equatorialPlane);

        this.toggleGuideLines();
    }

    changeEllipseGeometry(orbit: IOrbit) {
        this.ellipseCurve.aX = orbit.semiMajorAxis * this.scale * orbit.eccentricity!;
        this.ellipseCurve.xRadius = orbit.semiMajorAxis * this.scale;
        this.ellipseCurve.yRadius =
            orbit.semiMajorAxis * this.scale * Math.sqrt(1 - (orbit.eccentricity ? orbit.eccentricity : 0) ** 2);
        this.ellipse.geometry = new THREE.BufferGeometry().setFromPoints(this.ellipseCurve.getPoints(100));

        let planeSize = orbit.semiMajorAxis * this.scale * 2;
        if (planeSize < 3) planeSize = 3;
        this.equatorialPlane.geometry = new THREE.PlaneGeometry(planeSize, planeSize, 32);
        this.xLine.geometry.setFromPoints([
            new THREE.Vector3(-planeSize / 2, 0, 0),
            new THREE.Vector3(planeSize / 2, 0, 0),
        ]);
        this.yLine.geometry.setFromPoints([
            new THREE.Vector3(
                0,
                planeSize / 4 > 2 * this.earthRadius * this.scale ? -planeSize / 4 : -2 * this.earthRadius * this.scale,
                0
            ),
            new THREE.Vector3(
                0,
                planeSize / 4 > 2 * this.earthRadius * this.scale ? planeSize / 4 : 2 * this.earthRadius * this.scale,
                0
            ),
        ]);
        this.zLine.geometry.setFromPoints([
            new THREE.Vector3(0, 0, -planeSize / 2),
            new THREE.Vector3(0, 0, planeSize / 2),
        ]);
        this.fitCameraToOrbit(orbit);
    }

    changeEllipseRotation(orbit: IOrbit) {
        if (!orbit.inclination) orbit.inclination = 0;
        if (!orbit.longitudeOfAscendingNode) orbit.longitudeOfAscendingNode = 0;
        if (!orbit.argumentOfPerigee) orbit.argumentOfPerigee = 0;
        if (!orbit.eccentricity) orbit.eccentricity = 0;

        this.ellipse.rotation.z = orbit.argumentOfPerigee * (Math.PI / 180) - Math.PI / 2;
        this.ellipse.rotation.y = Math.PI + orbit.inclination * (Math.PI / 180);

        if (orbit.inclination != 0) this.ellipseObject.rotation.z = -orbit.longitudeOfAscendingNode * (Math.PI / 180);
        else this.ellipseObject.rotation.z = 0;
        this.ellipseObject.rotation.x = Math.PI / 2;
    }

    changeColorSatellite(color: string) {
        this.realSatelliteMesh.material = new THREE.MeshBasicMaterial({
            color: color,
        });
    }

    toggleGuideLines() {
        this.xLine.visible = this.guidelines;
        this.yLine.visible = this.guidelines;
        this.zLine.visible = this.guidelines;
        this.equatorialPlane.visible = this.guidelines;
    }

    toggleColorAndSize() {
        this.satelliteMesh.visible = !this.realColorAndSize;
        this.realSatelliteMesh.visible = this.realColorAndSize;
    }

    changeZoom(orbit: IOrbit) {
        this.camera.fov = 50 / this.zoom;
        this.camera.far = orbit.semiMajorAxis * this.scale * 2 + 1100;
        this.camera.updateProjectionMatrix();
    }
}
