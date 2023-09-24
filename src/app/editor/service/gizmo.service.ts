import { Injectable } from "@angular/core";
import { MousePickingService } from "./mouse-picking.service";
import { OpenglService } from "./opengl.service";
import { SceneService } from "./scene.service";
import { CameraService } from "./camera.service";

@Injectable({
    providedIn: 'root'
})
export class GizmoService {

    constructor(private mousePickingService: MousePickingService, private glService: OpenglService,
        private sceneData: SceneService,
        private camera: CameraService) {

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
                        if (this.camera.cameraFront[2] > 0) {
                            this.mousePickingService.meshSelected &&
                                (this.mousePickingService.meshSelected.coordonate.position.x -= deltaX * 0.05);
                        } else {
                            this.mousePickingService.meshSelected &&
                                (this.mousePickingService.meshSelected.coordonate.position.x += deltaX * 0.05);
                        }
                        previousMouseX = event.clientX;

                        const deltaY = event.clientY - previousMouseY;
                        this.mousePickingService.meshSelected &&
                            (this.mousePickingService.meshSelected.coordonate.position.x += deltaY * 0.05);
                        previousMouseY = event.clientY;
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