import { Mesh } from "../class/Mesh";
import { Light } from "./LightInterface";

export interface Scene {
    meshs: Mesh[];
    light: Light[];
    meshSelected?: Mesh;
    dirLight: Light;
    depthMap?: any;
}