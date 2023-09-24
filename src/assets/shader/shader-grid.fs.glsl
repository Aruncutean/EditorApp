#version 300 es
precision mediump float;
out vec4 FragColor;
in vec2 TexCoords;

in float fogFactor;
uniform vec3 fogColor;
void main() {

    float gridSize = 300.0f;
    vec2 wrappedCoords = mod(TexCoords, gridSize);

    if(wrappedCoords.x == 0.0f) {

        FragColor = vec4(0.74f, 0.05f, 0.05f, 1);

    } else if(wrappedCoords.y == 0.0f) {
        FragColor = vec4(0.02f, 0.46f, 0.1f, 1.0f);
    } else if(mod(wrappedCoords.x, 5.0f) == 0.0f) {
        FragColor = vec4(0.278f, 0.278f, 0.278f, 1.0f);
    } else if(mod(wrappedCoords.y, 5.0f) == 0.0f) {
        FragColor = vec4(0.278f, 0.278f, 0.278f, 1.0f);
    } else {
        FragColor = vec4(0.278f, 0.278f, 0.278f, 1.0f);
    }
 
}