import { Mesh } from "../class/Mesh";
import { Light } from "./LightInterface";

export interface Scene {
    meshs: Mesh[];
    light: Light[];
    meshSelected?: Mesh;
    dirLight: Light;
    depthMap?: any;
}

export interface IParam {
    internalformat: any,
    format: any,
    attachment?: any;
    minFilter: any,
    maxFilter: any,
    wrapS?: any,
    wrapT?: any,
    type: any
}