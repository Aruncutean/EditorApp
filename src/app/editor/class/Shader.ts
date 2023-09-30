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



}
