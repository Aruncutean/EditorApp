import { Vector3 } from "three";
import { Mesh } from "./Mesh";
import { CameraService } from "../service/camera.service";

export class Node {

    meshs: Mesh[] | undefined;
      
    Node() {

    }


    render(camera: CameraService) {
        this.meshs && this.meshs.forEach(_ => _.render(camera));
    }
}