import { glMatrix, mat4, vec3 } from "gl-matrix";
import { OpenglService } from "../service/opengl.service";
import { ShaderService } from "../service/shader.service";
import { CameraService } from "../service/camera.service";

export class Mesh {

    poz: vec3 = [0, 0, 0];

    worldMatrix = new Float32Array(16);
    viewMatrix = new Float32Array(16);
    projMatrix = new Float32Array(16);
    identityMatrix = new Float32Array(16);
    angle = 0;
    xRotationMatrix = new Float32Array(16);
    yRotationMatrix = new Float32Array(16);
    matWorldUniformLocation!: any;

    matViewUniformLocation!: any;
    matProjUniformLocation !: any;
    constructor(private vertices: any[],
        private uv: any[],
        private normal: any[],
        private indices: any[],
        private glService: OpenglService,
        private shaderService: ShaderService) {

        var ebo = this.glService.gl?.createBuffer();
        var idV = this.glService.gl?.createBuffer();
        var idUV = this.glService.gl?.createBuffer();
        var idN = this.glService.gl?.createBuffer();

        this.glService.gl?.bindBuffer(this.glService.gl.ARRAY_BUFFER, idV);
        this.glService.gl?.bufferData(this.glService.gl.ARRAY_BUFFER, new Float32Array(vertices), this.glService.gl.STATIC_DRAW);
        this.glService.gl?.vertexAttribPointer(0, 3, this.glService.gl?.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);


        this.glService.gl?.bindBuffer(this.glService.gl.ARRAY_BUFFER, idUV);
        this.glService.gl?.bufferData(this.glService.gl.ARRAY_BUFFER, new Float32Array(uv), this.glService.gl.STATIC_DRAW);
        this.glService.gl?.vertexAttribPointer(1, 2, this.glService.gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);

        this.glService.gl?.bindBuffer(this.glService.gl.ARRAY_BUFFER, idN);
        this.glService.gl?.bufferData(this.glService.gl.ARRAY_BUFFER, new Float32Array(normal), this.glService.gl.STATIC_DRAW);
        this.glService.gl?.vertexAttribPointer(2, 3, this.glService.gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);

        this.glService.gl?.bindBuffer(this.glService.gl.ELEMENT_ARRAY_BUFFER, ebo);
        this.glService.gl?.bufferData(this.glService.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(indices), this.glService.gl.STATIC_DRAW);


        this.matWorldUniformLocation = this.glService.gl?.getUniformLocation(this.shaderService.program, 'mWorld');
        this.matViewUniformLocation = this.glService.gl?.getUniformLocation(this.shaderService.program, 'mView');
        this.matProjUniformLocation = this.glService.gl?.getUniformLocation(this.shaderService.program, 'mProj');


        this.worldMatrix = new Float32Array(16);
        this.viewMatrix = new Float32Array(16);
        this.projMatrix = new Float32Array(16);


    }

    render(camera: CameraService) {

        mat4.identity(this.worldMatrix);

        let poz: any = this.poz;

        mat4.translate(this.worldMatrix, this.worldMatrix, [poz.x, poz.y, poz.z]);


        var ve: vec3 = [0, 0, 0];
        vec3.add(ve, camera.cameraPos, camera.cameraFront);
        mat4.lookAt(this.viewMatrix, camera.cameraPos, ve, camera.cameraUp);
        mat4.perspective(this.projMatrix, glMatrix.toRadian(45), 800 / 600, 0.1, 1000.0);

        this.glService.gl?.enableVertexAttribArray(0);
        this.glService.gl?.enableVertexAttribArray(1);
        this.glService.gl?.enableVertexAttribArray(2);

        this.glService.gl?.useProgram(this.shaderService.program);
        this.glService.gl?.uniformMatrix4fv(this.matWorldUniformLocation, this.glService.gl?.FALSE, this.worldMatrix);
        this.glService.gl?.uniformMatrix4fv(this.matViewUniformLocation, this.glService.gl?.FALSE, this.viewMatrix);
        this.glService.gl?.uniformMatrix4fv(this.matProjUniformLocation, this.glService.gl?.FALSE, this.projMatrix);
        this.glService.gl?.drawElements(this.glService.gl?.TRIANGLES, this.indices.length, this.glService.gl?.UNSIGNED_SHORT, 0);

        this.glService.gl?.disableVertexAttribArray(0);
        this.glService.gl?.disableVertexAttribArray(1);
        this.glService.gl?.disableVertexAttribArray(2);
    }

}