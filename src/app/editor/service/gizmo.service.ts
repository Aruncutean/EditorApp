import { Injectable } from "@angular/core";
import { MousePickingService } from "./mouse-picking.service";
import { OpenglService } from "./opengl.service";

@Injectable({
    providedIn: 'root'
})
export class GizmoService {

    constructor(private mousePickingService: MousePickingService, private glService: OpenglService) {

    }

    init() {
        let isDragging = false;
        let previousMouseX = 0;
        let previousMouseY = 0;

        window.addEventListener('mousedown', (event) => {
            isDragging = true;
            previousMouseX = event.clientX;
            previousMouseY = event.clientY;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        window.addEventListener('mousemove', (event) => {
            if (isDragging) {
                if (this.mousePickingService.gizmoMesh) {
                    if (this.mousePickingService.gizmoMesh.name == 'x') {
                        const deltaX = event.clientX - previousMouseX;
                        this.mousePickingService.meshSelected &&
                            (this.mousePickingService.meshSelected.coordonate.position.x += deltaX * 0.01);
                        previousMouseX = event.clientX;

                        const deltaY = event.clientY - previousMouseY;
                        this.mousePickingService.meshSelected &&
                            (this.mousePickingService.meshSelected.coordonate.position.x += deltaY * 0.01);
                        previousMouseY = event.clientY;
                    } else if (this.mousePickingService.gizmoMesh.name == 'y') {
                        const deltaX = event.clientX - previousMouseX;
                        this.mousePickingService.meshSelected &&
                            (this.mousePickingService.meshSelected.coordonate.position.z += deltaX * 0.01);
                        previousMouseX = event.clientX;

                        const deltaY = event.clientY - previousMouseY;
                        this.mousePickingService.meshSelected &&
                            (this.mousePickingService.meshSelected.coordonate.position.z += deltaY * 0.01);

                        previousMouseY = event.clientY;
                    }
                    else if (this.mousePickingService.gizmoMesh.name == 'z') {
                        const deltaX = event.clientX - previousMouseX;
                        this.mousePickingService.meshSelected &&
                            (this.mousePickingService.meshSelected.coordonate.position.y += deltaX * 0.01);
                        previousMouseX = event.clientX;

                        const deltaY = event.clientY - previousMouseY;
                        this.mousePickingService.meshSelected &&
                            (this.mousePickingService.meshSelected.coordonate.position.y += deltaY * 0.01);
                        previousMouseY = event.clientY;
                    }
                }
            }
        });
    }


}