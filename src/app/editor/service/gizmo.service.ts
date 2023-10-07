import { Injectable } from "@angular/core";
import { MousePickingService } from "./mouse-picking.service";
import { OpenglService } from "./opengl.service";
import { SceneService } from "./scene.service";
import { CameraService } from "./camera.service";
import { mat4, vec3, vec4 } from "gl-matrix";

@Injectable({
    providedIn: 'root'
})
export class GizmoService {

    projectMatrix: any;
    viewMatrix: any;

    constructor(private mousePickingService: MousePickingService, private glService: OpenglService,
        private sceneData: SceneService,
        private camera: CameraService) {

    }
    setMatrix(projectMatrix: any,
        viewMatrix: any) {
        this.viewMatrix = viewMatrix;
        this.projectMatrix = projectMatrix;
    }
    init() {
        let isDragging = false;
        let previousMouseX = 0;
        let previousMouseY = 0;

        this.glService.canvas.addEventListener('mousedown', (event) => {
            isDragging = true;
            previousMouseX = event.clientX;
            previousMouseY = event.clientY;
        });

        this.glService.canvas.addEventListener('mouseup', () => {
            isDragging = false;
            this.mousePickingService.gizmoSelected = false;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });



        this.glService.canvas.addEventListener('mousemove', (event) => {
            if (isDragging && this.mousePickingService.gizmoSelected) {

                if (this.mousePickingService.gizmoMesh) {
                    if (this.mousePickingService.gizmoMesh.name == 'x') {
                        const deltaX = event.clientX - previousMouseX;


                        let m_objViewSpacePos: vec4 = [0, 0, 0, 0];
                        vec4.transformMat4(m_objViewSpacePos, [this.mousePickingService.meshSelected.coordonate.position.x, this.mousePickingService.meshSelected.coordonate.position.y, this.mousePickingService.meshSelected.coordonate.position.z, 1], this.viewMatrix)

                        // x y OK
                        let x = (2.0 * event.clientX) / this.glService.canvas.clientWidth - 1.0;
                        let y = 1 - (2.0 * event.clientY) / this.glService.canvas.clientHeight;
                        //

                        // OK
                        let clipCoords: vec4 = [x, y, -1, 1];
                        // 


                        //
                        let eyeCoords: vec4 = [0, 0, 0, 0];
                        let invertedProjection = new Float32Array(16)
                        mat4.invert(invertedProjection, this.projectMatrix);
                        vec4.transformMat4(eyeCoords, clipCoords, invertedProjection)

                        eyeCoords = [eyeCoords[0], eyeCoords[1], -1.0, 0.0];

                        //   console.log(eyeCoords);

                        //                        
                        let rayWorld: vec4 = [0, 0, 0, 0];
                        let invertedView = new Float32Array(16)
                        mat4.invert(invertedView, this.viewMatrix);
                        vec4.transformMat4(rayWorld, eyeCoords, invertedView);


                        vec4.transformMat4(rayWorld, eyeCoords, invertedView);
                        let mouseRay: vec3 = [rayWorld[0], rayWorld[1], rayWorld[2]];
                        vec3.normalize(mouseRay, mouseRay);


                        console.log(mouseRay);

                

                        // this.mousePickingService.meshSelected.coordonate.position.y += mouseRay[1] * 0.05;
                        // this.mousePickingService.meshSelected.coordonate.position.z += mouseRay[2] * 0.05;
                        if (this.camera.cameraFront[2] > 0) {
                            this.mousePickingService.meshSelected &&
                                (this.mousePickingService.meshSelected.coordonate.position.x -= deltaX * 0.025);
                        } else {
                            this.mousePickingService.meshSelected &&
                                (this.mousePickingService.meshSelected.coordonate.position.x += deltaX * 0.025);
                        }
                        previousMouseX = event.clientX;

                    } else if (this.mousePickingService.gizmoMesh.name == 'y') {
                        const deltaX = event.clientX - previousMouseX;
                        this.mousePickingService.meshSelected &&
                            (this.mousePickingService.meshSelected.coordonate.position.z -= deltaX * 0.05);
                        previousMouseX = event.clientX;

                        const deltaY = event.clientY - previousMouseY;
                        this.mousePickingService.meshSelected &&
                            (this.mousePickingService.meshSelected.coordonate.position.z -= deltaY * 0.05);

                        previousMouseY = event.clientY;
                    }
                    else if (this.mousePickingService.gizmoMesh.name == 'z') {
                        const deltaX = event.clientX - previousMouseX;
                        this.mousePickingService.meshSelected &&
                            (this.mousePickingService.meshSelected.coordonate.position.y -= deltaX * 0.05);
                        previousMouseX = event.clientX;

                        const deltaY = event.clientY - previousMouseY;
                        this.mousePickingService.meshSelected &&
                            (this.mousePickingService.meshSelected.coordonate.position.y -= deltaY * 0.05);
                        previousMouseY = event.clientY;
                    }
                    this.sceneData.setMeshSelected(this.mousePickingService.meshSelected);
                }
            }
        });
    }


}