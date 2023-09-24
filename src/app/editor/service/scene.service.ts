import { Injectable } from '@angular/core';
import { Mesh } from '../class/Mesh';
import { OpenglService } from './opengl.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Scene } from '../interface/SceneInterface';
@Injectable({
    providedIn: 'root'
})
export class SceneService {

    private dataSubject: BehaviorSubject<Scene>;
    data$: Observable<Scene>;

    constructor() {
        this.dataSubject = new BehaviorSubject<Scene>({
            meshs: [],
            light: [],
            dirLight: {
                id: "12",
                position: { x: -0.2, y: -0.2, z: -0.2 },
                ambient: [0.05, 0.05, 0.05],
                diffuse: [0.5, 0.5, 0.5],
                specular: [0.2, 0.2, 0.2]
            }
        });
        this.data$ = this.dataSubject.asObservable();

    }

    addMesh(mesh: Mesh) {
        let scene = this.dataSubject.getValue();
        scene.meshs.push(mesh);
        this.dataSubject.next(scene);
    }

    getMeshs() {
        return this.dataSubject.getValue().meshs;
    }

    addLight(mesh: Mesh) {
        let scene = this.dataSubject.getValue();
        mesh.coordonate.position.y += 4
        scene.meshs.push(mesh);
        scene.light.push({
            id: mesh.id,
            mesh: mesh,
            ambient: [0.0, 0.0, 0.0],
            diffuse: [1, 1, 1],
            specular: [1, 1, 1],
        })
        this.dataSubject.next(scene);
    }

    setMeshSelected(mesh: Mesh) {
        let scene = this.dataSubject.getValue();
        scene.meshSelected = mesh;
        this.dataSubject.next(scene);
    }

    getMeshSelected() {
        return this.dataSubject.getValue().meshSelected;
    }

}
