import { OpenglService } from "../service/opengl.service";

export class Shader {
    program: any;

    constructor(private glService: OpenglService) { }

    init(vertexShaderText: any, fragmentShaderText: any) {
        var vertextShader = this.glService.gl?.createShader(this.glService.gl.VERTEX_SHADER);
        var fragmentShader = this.glService.gl?.createShader(this.glService.gl.FRAGMENT_SHADER);

        vertextShader && this.glService.gl?.shaderSource(vertextShader, vertexShaderText);
        fragmentShader && this.glService.gl?.shaderSource(fragmentShader, fragmentShaderText);

        vertextShader && this.glService.gl?.compileShader(vertextShader);
        if (vertextShader && !this.glService.gl?.getShaderParameter(vertextShader, this.glService.gl.COMPILE_STATUS)) {
            console.error('ERROR compiling vertex shader!', this.glService.gl?.getShaderInfoLog(vertextShader));
            return;
        }
        fragmentShader && this.glService.gl?.compileShader(fragmentShader);
        if (fragmentShader && !this.glService.gl?.getShaderParameter(fragmentShader, this.glService.gl.COMPILE_STATUS)) {
            console.error('ERROR compiling fragment shader!', this.glService.gl?.getShaderInfoLog(fragmentShader));
            return;
        }

        this.program = this.glService.gl?.createProgram();
        this.program && vertextShader && this.glService.gl?.attachShader(this.program, vertextShader);
        this.program && fragmentShader && this.glService.gl?.attachShader(this.program, fragmentShader);
        this.program && this.glService.gl?.linkProgram(this.program);
        if (!this.program) {
            console.error('ERROR linking program!');
        }
        if (this.program && !this.glService.gl?.getProgramParameter(this.program, this.glService.gl.LINK_STATUS)) {
            console.error('ERROR linking program!', this.glService.gl?.getProgramInfoLog(this.program));
            return;
        }

        this.program && this.glService.gl?.validateProgram(this.program);
        if (this.program && !this.glService.gl?.getProgramParameter(this.program, this.glService.gl.VALIDATE_STATUS)) {
            console.error('ERROR validating program!', this.glService.gl?.getProgramInfoLog(this.program));
            return;
        }
    }



}
