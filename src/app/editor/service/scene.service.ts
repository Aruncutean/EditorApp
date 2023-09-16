import { Injectable } from '@angular/core';
import { Mesh } from '../class/Mesh';
import { OpenglService } from './opengl.service';

@Injectable({
    providedIn: 'root'
})
export class SceneService {

    meshs: Mesh[] = [];

    constructor(private glService: OpenglService) { }

    addMesh(mesh: Mesh) {
        this.meshs.push(mesh);
    }

    getMesh() {
        return this.meshs;
    }


    render() {

    }

}
