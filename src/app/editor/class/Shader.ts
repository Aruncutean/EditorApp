import { vec3 } from "gl-matrix";
import { OpenglService } from "../service/opengl.service";

export class Shader {
    program: any;

    constructor(private gl: any) {

    }

    init(vertexShaderText: any, fragmentShaderText: any) {
        var vertextShader = this.gl?.createShader(this.gl.VERTEX_SHADER);
        var fragmentShader = this.gl?.createShader(this.gl.FRAGMENT_SHADER);

        vertextShader && this.gl?.shaderSource(vertextShader, vertexShaderText);
        fragmentShader && this.gl?.shaderSource(fragmentShader, fragmentShaderText);

        vertextShader && this.gl?.compileShader(vertextShader);
        if (vertextShader && !this.gl?.getShaderParameter(vertextShader, this.gl.COMPILE_STATUS)) {
            console.error('ERROR compiling vertex shader!', this.gl?.getShaderInfoLog(vertextShader));
            return;
        }
        fragmentShader && this.gl?.compileShader(fragmentShader);
        if (fragmentShader && !this.gl?.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
            console.error('ERROR compiling fragment shader!', this.gl?.getShaderInfoLog(fragmentShader));
            return;
        }

        this.program = this.gl?.createProgram();
        this.program && vertextShader && this.gl?.attachShader(this.program, vertextShader);
        this.program && fragmentShader && this.gl?.attachShader(this.program, fragmentShader);
        this.program && this.gl?.linkProgram(this.program);
        if (!this.program) {
            console.error('ERROR linking program!');
        }
        if (this.program && !this.gl?.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error('ERROR linking program!', this.gl?.getProgramInfoLog(this.program));
            return;
        }

        this.program && this.gl?.validateProgram(this.program);
        if (this.program && !this.gl?.getProgramParameter(this.program, this.gl.VALIDATE_STATUS)) {
            console.error('ERROR validating program!', this.gl?.getProgramInfoLog(this.program));
            return;
        }
    }

    useShader() {
        this.gl.useProgram(this.program);
    }

    sendBool(name: string, value: boolean) {
        this.gl?.uniform1i(this.getUniformLocation(name), Number(value));
    }

    sendInt(name: string, value: number) {
        this.gl?.uniform1i(this.getUniformLocation(name), value);
    }

    sendFloat(name: string, value: number) {
        this.gl?.uniform1f(this.getUniformLocation(name), value);
    }

    sendVec2(name: string, value: number[]) {
        this.gl?.uniform2fv(this.getUniformLocation(name), value);
    }

    sendVec3N(name: string, value: number[]) {
        this.gl?.uniform3fv(this.getUniformLocation(name), value);
    }

    sendVec3V(name: string, value: vec3) {
        this.gl?.uniform3f(this.getUniformLocation(name), value[0], value[1], value[2]);
    }

    sendVec4(name: string, value: number[]) {
        this.gl?.uniform4fv(this.getUniformLocation(name), value);
    }

    setMat2(name: string, value: any) {
        this.gl?.uniformMatrix2fv(this.getUniformLocation(name), this.gl?.FALSE, value);
    }

    setMat3(name: string, value: any) {
        this.gl?.uniformMatrix3fv(this.getUniformLocation(name), this.gl?.FALSE, value);
    }

    setMat4(name: string, value: any) {
        this.gl?.uniformMatrix4fv(this.getUniformLocation(name), this.gl?.FALSE, value);
    }

    private getUniformLocation(uniformLocation: any) {
        return this.gl?.getUniformLocation(this.program, uniformLocation)
    }

}
