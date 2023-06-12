import { Injectable } from '@angular/core';
import { getPeriod, IOrbit, ISatellite, Shape } from 'shared/domain';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
    sphereSatelliteMesh = new THREE.Mesh();
    cubeSatelliteMesh = new THREE.Mesh();
    xLine = new THREE.Line(new THREE.BufferGeometry());
    yLine = new THREE.Line(new THREE.BufferGeometry());
    zLine = new THREE.Line(new THREE.BufferGeometry());
    equatorialPlane = new THREE.Mesh();
    perigeeLine = new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({ color: 0xa6e3ff, linewidth: 2 })
    );

    camera = new THREE.PerspectiveCamera();
    fitCameraToOrbit: any;
    scaleSatellite: any;

    whiteMeshColor = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 100 });
    realMeshColor = new THREE.MeshPhongMaterial({ color: 0xfffff, shininess: 100 });
    visibleSize = 200;
    realSize = 200;
    shape = Shape.Cube;
    zoom = 1;
    satelliteCameraScalar = 1;

    displayGuidelines = true;
    displayRealColor = true;
    displayRealSize = true;
    showOrbit = true;

    /**
     * @param container - HTML element to render the scene in
     * @param orbit
     * @param satellite
     */
    createOrbitScene(container: Element, orbit: IOrbit, satellite: ISatellite) {
        this.realSize = satellite.sizeOfBase / 1000; // convert to km
        this.shape = satellite.shapeOfBase!;
        this.realMeshColor = new THREE.MeshPhongMaterial({ color: satellite.colorOfBase, shininess: 100 });

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

        const pointLight = new THREE.PointLight(0xffffff, 0.3, 1000);
        pointLight.position.set(-50, 0, 0);
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        hemiLight.position.set(0, 500, 0);
        const ambientLight = new THREE.AmbientLight(0x333333);
        scene.add(pointLight, hemiLight, ambientLight);

        const earth = this.createEarth();
        scene.add(earth);

        this.createOrbit(orbit, scene);
        this.createGuidelines(scene);
        this.createSatellite(scene, orbit);

        this.scaleSatellite = function () {
            this.cubeSatelliteMesh.scale.setScalar(
                this.displayRealSize ? this.realSize : this.visibleSize * 1.4 * this.satelliteCameraScalar
            );
            this.sphereSatelliteMesh.scale.setScalar(
                this.displayRealSize ? this.realSize : this.visibleSize * 1.5 * this.satelliteCameraScalar
            );
        };

        this.fitCameraToOrbit = function (newOrbit: IOrbit, zoom = 1) {
            let cameraPos = newOrbit.semiMajorAxis * this.scale;
            if (cameraPos < 1.5) cameraPos = 1.5;
            cameraPos /= zoom;

            // set camera and light position
            camera.position.set(-2.2 * cameraPos, 1.2 * cameraPos, 1.2 * cameraPos);
            pointLight.position.set(-cameraPos - 50, 0, 0);

            // set background size
            background.geometry = new THREE.SphereGeometry(cameraPos * 10 + 700, 32, 32);
            background.geometry.scale(-1, 1, 1);
            camera.far = cameraPos * 12 + 1100;

            // set size of satellite for visibility
            this.satelliteCameraScalar = cameraPos;
            this.scaleSatellite();

            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();
            controls.update();
        };

        this.changeEllipseGeometry(orbit);
        this.scaleSatellite();

        // set variables for animation loop
        const scale = this.scale;
        let time = 0;
        const earthRotationSpeed = 0.003;

        const center = new THREE.Vector3(0, 0, 0);
        const xDirection = new THREE.Vector3(1, 0, 0);
        const yDirection = new THREE.Vector3(0, 1, 0);

        // get position of object in orbit at given time
        let getPositionInOrbit = function (orbit: IOrbit, time: number): THREE.Vector3 {
            // angles for rotation matrix
            const xR = 0;
            const yR = orbit.inclination! * (Math.PI / 180);
            const zR = 0;

            // get position in 2D ellipse at given time (translated with the earth as focal point)
            const xTranslation = orbit.eccentricity! * orbit.semiMajorAxis * scale;
            const x0 = orbit.semiMajorAxis * scale * Math.cos(time) - xTranslation;
            const y0 = orbit.semiMajorAxis * scale * Math.sqrt(1 - orbit.eccentricity! ** 2) * Math.sin(time);
            const z = 0;

            // rotate 2D ellipse with argument of perigee
            const perigee = -orbit.argumentOfPerigee! * (Math.PI / 180) + Math.PI / 2;
            const x = x0 * Math.cos(perigee) - y0 * Math.sin(perigee);
            const y = x0 * Math.sin(perigee) + y0 * Math.cos(perigee);

            // rotate 3D ellipse with inclination
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

            // rotate 3D ellipse with longitude of ascending node
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
            if (!orbit.period) orbit.period = getPeriod(orbit.semiMajorAxis * 1000) / (60 * 60 * 24);

            // change time passage according to eccentricity
            time -=
                ((earthRotationSpeed / orbit.period) *
                    (1 + 2 * orbit.eccentricity * Math.cos(time) + orbit.eccentricity ** 2)) /
                (1 - orbit.eccentricity ** 2);

            const pos = getPositionInOrbit(orbit, time);
            this.cubeSatelliteMesh.position.set(pos.x, pos.y, pos.z);
            this.sphereSatelliteMesh.position.set(pos.x, pos.y, pos.z);

            const perigeePos = getPositionInOrbit(orbit, 0);
            this.perigeeLine.geometry = new THREE.BufferGeometry().setFromPoints([perigeePos, center]);

            earth.rotation.y += earthRotationSpeed;

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

    private createGuidelines(scene: THREE.Scene) {
        const lineColor = 0x5a5b5c;
        this.xLine.material = new THREE.LineBasicMaterial({ color: lineColor });
        this.yLine.material = new THREE.LineBasicMaterial({ color: lineColor });
        this.zLine.material = new THREE.LineBasicMaterial({ color: lineColor });

        scene.add(this.xLine, this.yLine, this.zLine);

        this.equatorialPlane.material = new THREE.MeshBasicMaterial({
            color: lineColor,
            side: THREE.DoubleSide,
            opacity: 0.15,
            transparent: true,
        });
        this.equatorialPlane.rotation.x = Math.PI / 2;
        scene.add(this.equatorialPlane);

        scene.add(this.perigeeLine);

        this.toggleGuidelines();
    }

    private createSatellite(scene: THREE.Scene, orbit: IOrbit) {
        this.cubeSatelliteMesh = new THREE.Mesh(
            new THREE.BoxGeometry(this.scale, this.scale, this.scale),
            this.realMeshColor
        );
        this.sphereSatelliteMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.5 * this.scale, 32, 32),
            this.realMeshColor
        );

        scene.add(this.cubeSatelliteMesh);
        scene.add(this.sphereSatelliteMesh);
        this.toggleColor();
        this.changeShapeSatellite(this.shape);
    }

    changeEllipseGeometry(orbit: IOrbit) {
        // translate ellipse with center of the earth as focal point
        this.ellipseCurve.aX = orbit.semiMajorAxis * this.scale * orbit.eccentricity!;

        // set semi major and minor axis
        this.ellipseCurve.xRadius = orbit.semiMajorAxis * this.scale;
        this.ellipseCurve.yRadius =
            orbit.semiMajorAxis * this.scale * Math.sqrt(1 - (orbit.eccentricity ? orbit.eccentricity : 0) ** 2);

        this.ellipse.geometry = new THREE.BufferGeometry().setFromPoints(this.ellipseCurve.getPoints(100));

        // update guidelines
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
        this.realMeshColor = new THREE.MeshPhongMaterial({
            color: color,
        });
        this.toggleColor();
    }

    toggleGuidelines() {
        this.xLine.visible = this.displayGuidelines;
        this.yLine.visible = this.displayGuidelines;
        this.zLine.visible = this.displayGuidelines;
        this.equatorialPlane.visible = this.displayGuidelines;
        this.perigeeLine.visible = this.displayGuidelines;
    }

    changeSizeSatellite(newSize: number) {
        this.realSize = newSize / 1000; // convert to km
        this.scaleSatellite();
    }

    changeShapeSatellite(shape: Shape) {
        this.shape = shape;
        this.cubeSatelliteMesh.visible = this.shape === Shape.Cube;
        this.sphereSatelliteMesh.visible = this.shape === Shape.Sphere;
    }

    toggleColor() {
        this.cubeSatelliteMesh.material = this.displayRealColor ? this.realMeshColor : this.whiteMeshColor;
        this.sphereSatelliteMesh.material = this.displayRealColor ? this.realMeshColor : this.whiteMeshColor;
    }

    toggleOrbit() {
        this.ellipse.visible = this.showOrbit;
    }

    changeZoom(orbit: IOrbit) {
        this.camera.fov = 50 / this.zoom;
        this.camera.far = orbit.semiMajorAxis * this.scale * 11 + 1100;
        this.camera.updateProjectionMatrix();
    }
}
