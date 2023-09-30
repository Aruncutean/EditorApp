#version 300 es
precision mediump float;
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D screenTexture;
uniform vec2 u_resolution;
const float fxaaReduceMin = 0.0f;
const float fxaaReduceMul = 0.8f;
const float fxaaSpanMax = 8.0f;

void main() {
    vec2 texelSize = 1.0f / u_resolution;
    vec3 rgbNW = texture(screenTexture, TexCoords + vec2(-1.0f, -1.0f) * texelSize).xyz;
    vec3 rgbNE = texture(screenTexture, TexCoords + vec2(1.0f, -1.0f) * texelSize).xyz;
    vec3 rgbSW = texture(screenTexture, TexCoords + vec2(-1.0f, 1.0f) * texelSize).xyz;
    vec3 rgbSE = texture(screenTexture, TexCoords + vec2(1.0f, 1.0f) * texelSize).xyz;
    vec3 rgbM = texture(screenTexture, TexCoords).xyz;

    vec3 luma = vec3(0.299f, 0.587f, 0.114f); // Luma weights

    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM = dot(rgbM, luma);

    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

    vec2 dir;
    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    dir.y = ((lumaNW + lumaSW) - (lumaNE + lumaSE));

    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25f * fxaaReduceMul), fxaaReduceMin);
    float rcpDirMin = 1.0f / (min(abs(dir.x), abs(dir.y)) + dirReduce);

    dir = min(vec2(fxaaSpanMax, fxaaSpanMax), max(vec2(-fxaaSpanMax, -fxaaSpanMax), dir * rcpDirMin)) * texelSize;

    vec3 rgbA = 0.5f * (texture(screenTexture, TexCoords.xy + dir * (1.0f / 3.0f - 0.5f)).xyz +
        texture(screenTexture, TexCoords.xy + dir * (2.0f / 3.0f - 0.5f)).xyz);
    vec3 rgbB = rgbA * 0.5f + 0.25f * (texture(screenTexture, TexCoords.xy + dir * -0.5f).xyz +
        texture(screenTexture, TexCoords.xy + dir * 0.5f).xyz);

    float lumaB = dot(rgbB, luma);

    if((lumaB < lumaMin) || (lumaB > lumaMax)) {
        FragColor = vec4(rgbA, 1.0f);
    } else {
        FragColor = vec4(rgbB, 1.0f);
    }
}