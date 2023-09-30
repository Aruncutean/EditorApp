import { OpenglService } from "../service/opengl.service";

export class Geometry {
    ebo: any;
    idV: any;
    idUV: any;
    idN: any;
    vao: any;
    constructor(private geometry: GeometryInterface, private glService: OpenglService) {
        this.vao = this.glService.gl.createVertexArray();
        this.glService.gl.bindVertexArray(this.vao);
        this.ebo = this.glService.gl?.createBuffer();
        this.idV = this.glService.gl?.createBuffer();
        this.idUV = this.glService.gl?.createBuffer();
        this.idN = this.glService.gl?.createBuffer();

        this.glService.gl?.bindBuffer(this.glService.gl.ARRAY_BUFFER, this.idV);
        this.glService.gl?.bufferData(this.glService.gl.ARRAY_BUFFER, new Float32Array(geometry.vertices), this.glService.gl.STATIC_DRAW);
        this.glService.gl?.enableVertexAttribArray(0);
        this.glService.gl?.vertexAttribPointer(0, 3, this.glService.gl?.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);


        this.glService.gl?.bindBuffer(this.glService.gl.ARRAY_BUFFER, this.idUV);
        this.glService.gl?.bufferData(this.glService.gl.ARRAY_BUFFER, new Float32Array(geometry.uv), this.glService.gl.STATIC_DRAW);
        this.glService.gl?.enableVertexAttribArray(1);
        this.glService.gl?.vertexAttribPointer(1, 2, this.glService.gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);

        this.glService.gl?.bindBuffer(this.glService.gl.ARRAY_BUFFER, this.idN);
        this.glService.gl?.bufferData(this.glService.gl.ARRAY_BUFFER, new Float32Array(geometry.normal), this.glService.gl.STATIC_DRAW);
        this.glService.gl?.enableVertexAttribArray(2);
        this.glService.gl?.vertexAttribPointer(2, 3, this.glService.gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);

        this.glService.gl?.bindBuffer(this.glService.gl.ELEMENT_ARRAY_BUFFER, this.ebo);

        this.glService.gl?.bufferData(this.glService.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(geometry.indices), this.glService.gl.STATIC_DRAW);
        this.glService.gl.bindVertexArray(null);
    }


    render() {
        this.glService.gl.bindVertexArray(this.vao)
        this.glService.gl?.drawElements(this.glService.gl?.TRIANGLES, this.geometry.indices.length, this.glService.gl?.UNSIGNED_SHORT, 0);
        this.glService.gl.bindVertexArray(null)
    }

}

export interface GeometryInterface {
    vertices: any[];
    uv: any[];
    normal: any[];
    indices: any[];
}