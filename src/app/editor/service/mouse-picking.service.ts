import { Injectable } from '@angular/core';

import { OpenglService } from './opengl.service';
import { Mesh } from '../class/Mesh';
import { delay } from 'rxjs';
import { CameraService } from './camera.service';
import { Shader } from '../class/Shader';
import { LoadFileService } from './load-file.service';
import { Vector3 } from 'three';

@Injectable({
    providedIn: 'root'
})
export class MousePickingService {
    mouseX: any = -1;
    mouseY: any = -1;
    oldPickNdx: any = -1;
    oldPickColor: any;
    frameCount: any = 0;

    gizmoMesh!: Mesh | null;
    meshSelected!: Mesh | null;
    private shader!: Shader;

    constructor(private glService: OpenglService, private camera: CameraService, private loadFile: LoadFileService,) { }

    async init(meshs: Mesh[], gizmo: Mesh[]) {
        this.shader = new Shader(this.glService);
        this.shader.init(
            await this.loadFile.getFile("/assets/shader-picking.vs.glsl").toPromise(),
            await this.loadFile.getFile("/assets/shader-picking.fs.glsl").toPromise());

        this.glService.canvas && this.glService.canvas.addEventListener('mousedown', (event) => {

            if (event.button === 0) {
                const rect = this.glService.canvas.getBoundingClientRect();
                this.mouseX = event.clientX - rect.left;
                this.mouseY = event.clientY - rect.top;
                const pixelX = this.mouseX * this.glService.canvas.width / this.glService.canvas.clientWidth;
                const pixelY = this.glService.canvas.height - this.mouseY * this.glService.canvas.height / this.glService.canvas.clientHeight - 1;


                this.glService.gl?.clearColor(0.75, 0.8, 0.8, 1.0);
                this.glService.gl?.clear(this.glService.gl.COLOR_BUFFER_BIT | this.glService.gl.DEPTH_BUFFER_BIT);

                meshs && meshs.forEach((_, index) => {
                    _.render(this.camera, { shader: this.shader, isMousePicking: true, indexMousePicking: index + 1 }, [0, 0, 0])
                });

                this.glService.gl?.clear(this.glService.gl.DEPTH_BUFFER_BIT);
                if (this.meshSelected) {
                    this.glService.gl?.clear(this.glService.gl.DEPTH_BUFFER_BIT);
                    gizmo && gizmo.forEach((_, index) => {
                        _.coordonate.position &&
                            this.meshSelected?.coordonate.position &&
                            (_.coordonate.position = this.meshSelected?.coordonate.position)
                        _.render(this.camera, { shader: this.shader, isMousePicking: true, indexMousePicking: index + 100 }, [0, 0, 0])
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
                    console.log(id);
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
                        }
                    })


                    meshs && meshs.forEach((_, index) => {
                        index = index + 1;
                        const vec: any[] = [
                            ((index >> 0) & 0xFF) / 0xFF,
                            ((index >> 8) & 0xFF) / 0xFF,
                            ((index >> 16) & 0xFF) / 0xFF,
                            ((index >> 24) & 0xFF) / 0xFF]

                        if ((vec[0] * 0xFF + vec[1] * 0xFF + vec[2] * 0xFF + vec[3] * 0xFF) == id) {
                            this.meshSelected = _;
                        }

                    })
                } else {
                    this.meshSelected = null;
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
