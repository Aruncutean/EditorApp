import { Shader } from "../class/Shader";

export interface ShaderInterface {
    shader: Shader,
    isMousePicking?: boolean,
    indexMousePicking?: number,
    coordonate?: any;
    viewMatrix: any;
    projMatrix: any;
}