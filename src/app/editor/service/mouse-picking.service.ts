import { ChangeDetectorRef, Injectable } from '@angular/core';

import { OpenglService } from './opengl.service';
import { Mesh } from '../class/Mesh';
import { delay } from 'rxjs';
import { CameraService } from './camera.service';
import { Shader } from '../class/Shader';
import { LoadFileService } from './load-file.service';
import { Vector3 } from 'three';
import { SceneService } from './scene.service';
import { Scene } from '../interface/SceneInterface';
import { glMatrix, mat4, vec3, vec4 } from 'gl-matrix';
import * as THREE from 'three';
import { ObjectMy } from '../class/ObjectMy';
import { Line } from '../class/Line';
import { Vec3 } from 'cannon';
import * as CANNON from 'cannon';


@Injectable({
    providedIn: 'root'
})
export class MousePickingService {
    mouseX: any = -1;
    mouseY: any = -1;
    oldPickNdx: any = -1;
    oldPickColor: any;
    frameCount: any = 0;
    meshs: Mesh[] = [];
    gizmoMesh!: Mesh | null;
    gizmoSelected: boolean = false;
    meshSelected!: Mesh;

    gizmo!: Mesh[];
    mouseDown1: boolean = false;

    projectMatrix: any;
    viewMatrix: any;
    rayStart: any;

    gizmoType: any;

    constructor(private glService: OpenglService,
        private camera: CameraService,
        private loadFile: LoadFileService,
        private sceneData: SceneService,
    ) {
    }
    setMatrix(projectMatrix: any,
        viewMatrix: any) {
        this.viewMatrix = viewMatrix;
        this.projectMatrix = projectMatrix;
    }



    async init(gizmo: Mesh[], world?: any) {
        this.gizmo = gizmo;
        this.sceneData.data$.subscribe((_: Scene) => {
            this.meshs = _.meshs;
        })

        this.mouseDown();
        this.mouseMove();
        this.mouseUp();
        this.glService.canvas && this.glService.canvas.addEventListener("contextmenu", (event) => {
            event.preventDefault()
        })
    }

    rayCasting(x: number, y: number) {
        var ndcX = (2.0 * x / this.glService.canvas.clientWidth) - 1.0;
        var ndcY = 1.0 - (2.0 * y / this.glService.canvas.clientHeight);

        var start = vec4.fromValues(ndcX, ndcY, -1.0, 1.0);
        var end = vec4.fromValues(ndcX, ndcY, 1.0, 1.0);

        var toWorld: mat4 = mat4.create();
        mat4.multiply(toWorld, this.projectMatrix, this.viewMatrix)
        mat4.invert(toWorld, toWorld);

        vec4.transformMat4(start, start, toWorld);
        vec4.transformMat4(end, end, toWorld);

        var rayOrigin = vec3.fromValues(start[0], start[1], start[2]);
        var rayEnd = vec3.fromValues(end[0], end[1], end[2]);

        vec3.divide(rayOrigin, rayOrigin, [start[3], start[3], start[3]]);
        vec3.divide(rayEnd, rayEnd, [end[3], end[3], end[3]]);

        var rayDir = vec3.create();
        vec3.sub(rayDir, rayEnd, rayOrigin);
        vec3.normalize(rayDir, rayDir);

        let endPoit: vec3 = [5, 5, 5];
        vec3.mul(endPoit, endPoit, rayDir)
        vec3.add(endPoit, rayOrigin, endPoit);

        return { rayDir: rayDir, rayOrigin: rayOrigin, rayEnd: rayEnd }
    }

    mouseMove() {
        this.glService.canvas && this.glService.canvas.addEventListener('mousemove', (event) => {
            if (this.mouseDown1 && this.gizmoMesh) {
                var rect = this.glService.canvas.getBoundingClientRect();
                var x = event.clientX - rect.left;
                var y = event.clientY - rect.top;

                let ray = this.rayCasting(x, y);

                let diff = [
                    (ray.rayEnd[0] - this.rayStart[0]),
                    (ray.rayEnd[1] - this.rayStart[1]),
                    (ray.rayEnd[2] - this.rayStart[2])
                ]

                this.gizmoMesh.name == "x" && (this.meshSelected.coordonate.position.x += diff[0]);
                this.gizmoMesh.name == "z" && (this.meshSelected.coordonate.position.y += diff[1]);
                this.gizmoMesh.name == "y" && (this.meshSelected.coordonate.position.z += diff[2]);

                this.rayStart = ray.rayEnd;
                this.sceneData.setMeshSelected(this.meshSelected);
            }

        })

    }

    setGizmoType(type: any) {
        this.gizmoType = type;
    }

    mouseUp() {
        this.glService.canvas && this.glService.canvas.addEventListener('mouseup', (event) => {
            this.mouseDown1 = false;
        })
    }

    mouseDown() {
        this.glService.canvas && this.glService.canvas.addEventListener('mousedown', (event) => {

            if (event.button === 0) {
                this.mouseDown1 = true;
                var rect = this.glService.canvas.getBoundingClientRect();
                var x = event.clientX - rect.left;
                var y = event.clientY - rect.top;

                let ray = this.rayCasting(x, y);

                let disMin = Infinity;
                let giz = undefined;
                this.gizmoType == 2 && this.gizmo && this.gizmo.forEach(_ => {
                    let coordonate: { x: any, y: any, z: any } = { x: 0, y: 0, z: 0 }
                    if (_.coordonate.position &&
                        this.meshSelected?.coordonate.position) {

                        coordonate.x = this.meshSelected?.coordonate.position.x + _.coordonate.position.x;
                        coordonate.y = this.meshSelected?.coordonate.position.y + _.coordonate.position.y;
                        coordonate.z = this.meshSelected?.coordonate.position.z + _.coordonate.position.z;

                        let scale: any = _.coordonate.scale;
                        let cube = new ObjectMy([coordonate.x, coordonate.y, coordonate.z], [scale.x, scale.y, scale.z], [_.geometry.minPoint.x, _.geometry.minPoint.y, _.geometry.minPoint.z], [_.geometry.maxPoint.x, _.geometry.maxPoint.y, _.geometry.maxPoint.z]);
                        let o = cube.rayIntersectsBoundingBox(ray.rayOrigin, ray.rayDir)
                        if (o.found && o.distance) {
                            if (disMin > o.distance) {
                                giz = _;
                                disMin = o.distance;
                                this.rayStart = ray.rayEnd;
                            }
                        }
                    }
                });
                if (giz) {
                    this.gizmoMesh = giz;
                } else {
                    this.gizmoMesh = null;
                    disMin = Infinity;
                    let model;
                    this.meshs.map(_ => {
                        let poz = _.coordonate.position;
                        let scale: any = _.coordonate.scale;

                        const cube = new ObjectMy([poz.x, poz.y, poz.z], [scale.x, scale.y, scale.z], [_.geometry.minPoint.x, _.geometry.minPoint.y, _.geometry.minPoint.z], [_.geometry.maxPoint.x, _.geometry.maxPoint.y, _.geometry.maxPoint.z]);
                        let o = cube.rayIntersectsBoundingBox(ray.rayOrigin, ray.rayDir)
                        if (o.found && o.distance) {
                            if (disMin > o.distance) {
                                disMin = o.distance;
                                model = _;
                            }
                        }
                    })
                    if (model && model != this.meshSelected) {

                        this.meshSelected = model;
                        this.sceneData.setMeshSelected(this.meshSelected);
                    }
                }
            }
        })
    }


}
