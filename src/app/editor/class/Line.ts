import { mat4 } from "gl-matrix";
import { OpenglService } from "../service/opengl.service";
import { Mesh } from "./Mesh";
import { Shader } from "./Shader";

export class Line {

    vao: any;
    modelMatrix = new Float32Array(16);
    constructor(private glService: OpenglService, lineVertices: any) {
        this.vao = this.glService.gl.createVertexArray();
        this.glService.gl.bindVertexArray(this.vao);
        const buffer = glService.gl.createBuffer();
        glService.gl.bindBuffer(glService.gl.ARRAY_BUFFER, buffer);
        glService.gl.bufferData(glService.gl.ARRAY_BUFFER, new Float32Array(lineVertices), glService.gl.STATIC_DRAW);

        glService.gl.enableVertexAttribArray(0);
        glService.gl.vertexAttribPointer(0, 3, glService.gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
        this.glService.gl.bindVertexArray(null);
    }

    render(shader: Shader, view: any, projection: any) {
        if (shader.program) {
            shader.useShader();
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [0, 0, 0])

            shader.sendVec4('PickingColor', [1, 1, 1, 1])
            shader.setMat4('mWorld', this.modelMatrix);
            shader.setMat4('mView', view);
            shader.setMat4('mProj', projection);

            this.glService.gl.bindVertexArray(this.vao)
            this.glService.gl.drawArrays(this.glService.gl.LINES, 0, 2);
            this.glService.gl.bindVertexArray(null)
        }
    }

}