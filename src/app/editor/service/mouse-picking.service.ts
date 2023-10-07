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
import { glMatrix, mat4 } from 'gl-matrix';

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
    private shader!: Shader;

    constructor(private glService: OpenglService,
        private camera: CameraService,
        private loadFile: LoadFileService,
        private sceneData: SceneService,
    ) {
    }

    async init(gizmo: Mesh[]) {

        this.sceneData.data$.subscribe((_: Scene) => {
            this.meshs = _.meshs;
        })

        this.shader = new Shader(this.glService.gl, this.loadFile);
        this.shader.init(
            "/assets/shader-picking.vs.glsl",
            "/assets/shader-picking.fs.glsl");

        this.glService.canvas && this.glService.canvas.addEventListener('mousedown', (event) => {

            if (event.button === 0) {
                const rect = this.glService.canvas.getBoundingClientRect();
                this.mouseX = event.clientX - rect.left;
                this.mouseY = event.clientY - rect.top;
                const pixelX = this.mouseX * this.glService.canvas.width / this.glService.canvas.clientWidth;
                const pixelY = this.glService.canvas.height - this.mouseY * this.glService.canvas.height / this.glService.canvas.clientHeight - 1;
                let viewMatrix = new Float32Array(16);
                let projMatrix = new Float32Array(16);
                mat4.perspective(projMatrix, glMatrix.toRadian(60), this.glService.canvas.clientWidth / this.glService.canvas.clientHeight, 0.1, 1000.0);
                mat4.lookAt(viewMatrix, this.camera.cameraPos, this.camera.cameraFront, this.camera.cameraUp);


                this.glService.gl?.clearColor(0.75, 0.8, 0.8, 1.0);
                this.glService.gl?.clear(this.glService.gl.COLOR_BUFFER_BIT | this.glService.gl.DEPTH_BUFFER_BIT);

                this.meshs && this.meshs.forEach((_, index) => {
                    _.renderForward(this.camera, { shader: this.shader, isMousePicking: true, indexMousePicking: index + 1, viewMatrix: viewMatrix, projMatrix: projMatrix })
                });

                this.glService.gl?.clear(this.glService.gl.DEPTH_BUFFER_BIT);
                if (this.meshSelected) {
                    this.glService.gl?.clear(this.glService.gl.DEPTH_BUFFER_BIT);
                    gizmo && gizmo.forEach((_, index) => {
                        _.coordonate.position &&
                            this.meshSelected?.coordonate.position &&
                            (_.coordonate.position = this.meshSelected?.coordonate.position)
                        _.renderForward(this.camera, { shader: this.shader, isMousePicking: true, indexMousePicking: index + 100, viewMatrix: viewMatrix, projMatrix: projMatrix })
                    });
                }

                const data = new Uint8Array(4);
                this.glService.gl.readPixels(
                    pixelX,
                    pixelY,
                    1,
                    1,
                    this.glService.gl.RGBA,
                    this.glService.gl.UNSIGNED_BYTE,
                    data);

                const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);

                if (id != -3355457) {

                    gizmo && gizmo.forEach((_, index) => {
                        index = index + 100;
                        const vec: any[] = [
                            ((index >> 0) & 0xFF) / 0xFF,
                            ((index >> 8) & 0xFF) / 0xFF,
                            ((index >> 16) & 0xFF) / 0xFF,
                            ((index >> 24) & 0xFF) / 0xFF]
                        let v = (vec[0] * 0xFF + vec[1] * 0xFF * 0xFF + vec[2] * 0xFF * 0xFF * 0xFF + vec[3] * 0xFF * 0xFF * 0xFF * 0xFF);
                        if (v == id) {
                            this.gizmoMesh = _;
                            this.gizmoSelected = true;
                        }
                    })


                    this.meshs && this.meshs.forEach((_, index) => {
                        index = index + 1;
                        const vec: any[] = [
                            ((index >> 0) & 0xFF) / 0xFF,
                            ((index >> 8) & 0xFF) / 0xFF,
                            ((index >> 16) & 0xFF) / 0xFF,
                            ((index >> 24) & 0xFF) / 0xFF]

                        if ((vec[0] * 0xFF + vec[1] * 0xFF + vec[2] * 0xFF + vec[3] * 0xFF) == id) {

                            this.meshSelected = _;
                            this.sceneData.setMeshSelected(_);

                        }

                    })
                } else {

                    this.gizmoMesh = null;
                }
            }
        })

        this.glService.canvas && this.glService.canvas.addEventListener("contextmenu", (event) => {
            event.preventDefault()
        })

        this.glService.canvas && this.glService.canvas.addEventListener('mousedown', (event) => {
            const rect = this.glService.canvas.getBoundingClientRect();
            this.mouseX = event.clientX - rect.left;
            this.mouseY = event.clientY - rect.top;
        });

    }
}
