import { glMatrix, mat4, vec3 } from "gl-matrix";
import { LoadFileService } from "../service/load-file.service";
import { OpenglService } from "../service/opengl.service";
import { Shader } from "./Shader";
import { CameraService } from "../service/camera.service";

export class Grid {

    shader!: Shader;
    ebo: any;
    idV: any;
    idUV: any;
    idN: any;
    gridSize = 300;
    constructor(private glService: OpenglService,
        private loadFile: LoadFileService) {


    }

    async init() {
        this.shader = new Shader(this.glService);
        this.shader && this.shader.init(
            await this.loadFile.getFile("/assets/shader/shader-grid.vs.glsl").toPromise(),
            await this.loadFile.getFile("/assets/shader/shader-grid.fs.glsl").toPromise()
        );


        let vertices: any[] = [];

        for (let i = -this.gridSize / 2; i <= this.gridSize / 2; i++) {
            vertices.push(i);
            vertices.push(0.0);
            vertices.push(-this.gridSize / 2.0);

            vertices.push(i);
            vertices.push(0.0);
            vertices.push(this.gridSize / 2.0);

            vertices.push(-this.gridSize / 2.0);
            vertices.push(0.0);
            vertices.push(i);

            vertices.push(this.gridSize / 2.0);
            vertices.push(0.0);
            vertices.push(i);
        }
        this.ebo = this.glService.gl?.createBuffer();
        this.idV = this.glService.gl?.createBuffer();

        this.glService.gl?.bindBuffer(this.glService.gl.ARRAY_BUFFER, this.idV);
        this.glService.gl?.bufferData(this.glService.gl.ARRAY_BUFFER, new Float32Array(vertices), this.glService.gl.STATIC_DRAW);
        this.glService.gl?.vertexAttribPointer(0, 3, this.glService.gl?.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
    }

    render(camera: CameraService) {

        if (this.shader.program) {

            let worldMatrix = new Float32Array(16);
            let viewMatrix = new Float32Array(16);
            let projMatrix = new Float32Array(16);


            mat4.identity(worldMatrix);

            var ve: vec3 = [0, 0, 0];
            vec3.add(ve, camera.cameraPos, camera.cameraFront);
            mat4.lookAt(viewMatrix, camera.cameraPos, ve, camera.cameraUp);


            mat4.perspective(projMatrix, glMatrix.toRadian(60), this.glService.canvas.clientWidth / this.glService.canvas.clientHeight, 0.1, 1000.0);


            this.glService.gl?.useProgram(this.shader.program);
            const matWorldUniformLocation = this.glService.gl?.getUniformLocation(this.shader.program, 'mWorld');
            const matViewUniformLocation = this.glService.gl?.getUniformLocation(this.shader.program, 'mView');
            const matProjUniformLocation = this.glService.gl?.getUniformLocation(this.shader.program, 'mProj');
            this.glService.gl?.uniform1f(this.getUniformLocation(this.shader, 'fogDistance'), 0.1);
            this.glService.gl?.uniform3f(this.getUniformLocation(this.shader, 'cameraPosition'), camera.cameraPos[0], camera.cameraPos[1], camera.cameraPos[2]);
            this.glService.gl?.uniform3f(this.getUniformLocation(this.shader, 'fogColor'), 0,0,0);


            this.glService.gl?.uniformMatrix4fv(matWorldUniformLocation, this.glService.gl?.FALSE, worldMatrix);
            this.glService.gl?.uniformMatrix4fv(matViewUniformLocation, this.glService.gl?.FALSE, viewMatrix);
            this.glService.gl?.uniformMatrix4fv(matProjUniformLocation, this.glService.gl?.FALSE, projMatrix);

            this.glService.gl?.enableVertexAttribArray(0);
            this.glService.gl?.bindBuffer(this.glService.gl.ARRAY_BUFFER, this.idV);
            this.glService.gl?.vertexAttribPointer(0, 3, this.glService.gl?.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);

            this.glService.gl?.drawArrays(this.glService.gl?.LINES, 0, this.gridSize * 4 + 4);
            this.glService.gl?.disableVertexAttribArray(0);
        }
    }

    getUniformLocation(shader: Shader, uniformLocation: any) {
        return this.glService.gl?.getUniformLocation(shader.program, uniformLocation)
    }

}