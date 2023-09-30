#version 300 es
precision mediump float;
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D depthMap;
uniform float near_plane;
uniform float far_plane;

// required when using a perspective projection matrix
float LinearizeDepth(float depth);

void main() {
    float depthValue = texture(depthMap, TexCoords).r;

    FragColor = vec4(vec3(depthValue), 1.0f); // orthographic
}
