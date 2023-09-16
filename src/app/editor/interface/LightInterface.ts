import { vec3 } from "gl-matrix";
import { Texture } from "../class/Texture";
import { Mesh } from "../class/Mesh";

export interface LightInterface {
    mesh?: Mesh
    type?: any;
}