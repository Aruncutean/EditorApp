import { vec3 } from "gl-matrix";
import { Texture } from "../class/Texture";

export interface MaterialInterface {
    texture?: Texture
    color: any;
}