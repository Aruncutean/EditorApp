import { mat4 } from "gl-matrix";
import { OpenglService } from "../service/opengl.service";
import { Mesh } from "./Mesh";
import { Shader } from "./Shader";
import { Geometry } from "./Geometry";

export class CubeLine {
    lineVertices = [
        // Spate
        -1, -1, -1, 1, -1, -1,
        1, -1, -1, 1, 1, -1,
        1, 1, -1, -1, 1, -1,
        -1, 1, -1, -1, -1, -1,

        // Front face
        -1, -1, 1, 1, -1, 1,
        1, -1, 1, 1, 1, 1,
        1, 1, 1, -1, 1, 1,
        -1, 1, 1, -1, -1, 1,

        // Sides
        -1, -1, -1, -1, -1, 1,
        1, -1, -1, 1, -1, 1,
        1, 1, -1, 1, 1, 1,
        -1, 1, -1, -1, 1, 1
    ];
    vao: any;
    modelMatrix = new Float32Array(16);
    constructor(private glService: OpenglService, private geometry: Geometry) {

        const minPoint = geometry.minPoint;
        const maxPoint = geometry.maxPoint;
        this.lineVertices = [
            // Linii fața
            minPoint.x, minPoint.y, minPoint.z,
            maxPoint.x, minPoint.y, minPoint.z,

            maxPoint.x, minPoint.y, minPoint.z,
            maxPoint.x, maxPoint.y, minPoint.z,

            maxPoint.x, maxPoint.y, minPoint.z,
            minPoint.x, maxPoint.y, minPoint.z,

            minPoint.x, maxPoint.y, minPoint.z,
            minPoint.x, minPoint.y, minPoint.z,

            // Linii spate
            minPoint.x, minPoint.y, maxPoint.z,
            maxPoint.x, minPoint.y, maxPoint.z,

            maxPoint.x, minPoint.y, maxPoint.z,
            maxPoint.x, maxPoint.y, maxPoint.z,

            maxPoint.x, maxPoint.y, maxPoint.z,
            minPoint.x, maxPoint.y, maxPoint.z,

            minPoint.x, maxPoint.y, maxPoint.z,
            minPoint.x, minPoint.y, maxPoint.z,

            // Linii laterale verticale
            minPoint.x, minPoint.y, minPoint.z,
            minPoint.x, minPoint.y, maxPoint.z,

            maxPoint.x, minPoint.y, minPoint.z,
            maxPoint.x, minPoint.y, maxPoint.z,

            maxPoint.x, maxPoint.y, minPoint.z,
            maxPoint.x, maxPoint.y, maxPoint.z,

            minPoint.x, maxPoint.y, minPoint.z,
            minPoint.x, maxPoint.y, maxPoint.z
        ];

        this.vao = this.glService.gl.createVertexArray();
        this.glService.gl.bindVertexArray(this.vao);
        const buffer = glService.gl.createBuffer();
        glService.gl.bindBuffer(glService.gl.ARRAY_BUFFER, buffer);
        glService.gl.bufferData(glService.gl.ARRAY_BUFFER, new Float32Array(this.lineVertices), glService.gl.STATIC_DRAW);

        glService.gl.enableVertexAttribArray(0);
        glService.gl.vertexAttribPointer(0, 3, glService.gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
        this.glService.gl.bindVertexArray(null);
    }

    render(shader: Shader, mesh: Mesh, view: any, projection: any, coordonate?: any) {
        shader.useShader();
        mat4.identity(this.modelMatrix);
        if (coordonate) {
            mat4.translate(this.modelMatrix, this.modelMatrix, [coordonate.x, coordonate.y, coordonate.z])
        }
        else {
            let poz: any = mesh.coordonate.position;

            poz.x !== undefined ? mat4.translate(this.modelMatrix, this.modelMatrix, [poz.x, poz.y, poz.z]) :
                mat4.translate(this.modelMatrix, this.modelMatrix, [poz[0], poz[1], poz[2]])
            let scale: any = mesh.coordonate.scale;
            mat4.scale(this.modelMatrix, this.modelMatrix, [scale.x, scale.y, scale.z])
        }
        shader.sendVec4('PickingColor', [1, 1, 1, 1])
        shader.setMat4('mWorld', this.modelMatrix);
        shader.setMat4('mView', view);
        shader.setMat4('mProj', projection);

        this.glService.gl.bindVertexArray(this.vao)
        this.glService.gl.drawArrays(this.glService.gl.LINES, 0, this.lineVertices.length / 3);
        this.glService.gl.bindVertexArray(null)

    }

}