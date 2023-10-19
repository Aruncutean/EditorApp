#version 300 es
precision mediump float;
in vec4 PickingColorOut;
out vec4 FragColor;
void main() {
    FragColor = PickingColorOut;
}