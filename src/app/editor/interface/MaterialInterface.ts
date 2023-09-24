import { vec3 } from "gl-matrix";
import { Texture } from "../class/Texture";

export interface MaterialInterface {
    texture?: Texture;
    specular?: any;
    diffuse?: any;
    shininess?: any;
    color: any;
}