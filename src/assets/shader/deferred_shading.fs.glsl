#version 300 es
precision mediump float;
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gAlbedoSpec;
uniform sampler2D shadowMap;
uniform mat4 lightSpaceMatrix;
struct Light {
    vec3 Position;
    vec3 Color;

    float Linear;
    float Quadratic;
};
const int NR_LIGHTS = 32;
uniform Light lights[NR_LIGHTS];
uniform vec3 viewPos;
uniform int nr_light;
float ShadowCalculation(vec4 fragPosLightSpace, vec3 normal, vec3 lightDir);
void main() {

    vec3 FragPos = texture(gPosition, TexCoords).rgb;
    vec3 Normal = texture(gNormal, TexCoords).rgb;
    vec3 Diffuse = texture(gAlbedoSpec, TexCoords).rgb;
    float Specular = texture(gAlbedoSpec, TexCoords).a;

    vec3 lightPosition = vec3(0, 12, 0);
    vec3 lightColor = vec3(1.0f);

    vec3 viewDir = normalize(viewPos - FragPos);

    vec3 lightDir = normalize(lightPosition - FragPos);
    vec3 diffuse = max(dot(Normal, lightDir), 0.0f) * Diffuse * lightColor;
    vec4 fragPosLightSpace = lightSpaceMatrix * vec4(FragPos, 1);

    float shadow = ShadowCalculation(fragPosLightSpace, Normal, lightDir);
    vec3 lighting = (diffuse) * (1.0f - shadow);
    //vec3 lighting = (1.0f - shadow) * (diffuse + specular);
    for(int i = 0; i < nr_light; i++) {
        // diffuse

        vec3 lightDir = normalize(lights[i].Position - FragPos);
        vec3 diffuse = max(dot(Normal, lightDir), 0.0f) * Diffuse * lights[i].Color;
        // specular
        vec3 halfwayDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(Normal, halfwayDir), 0.0f), 16.0f);
        vec3 specular = lights[i].Color * spec * Specular;
        // attenuation
        float distance = length(lights[i].Position - FragPos);
        float attenuation = 1.0f / (1.0f + lights[i].Linear * distance + lights[i].Quadratic * distance * distance);
        diffuse *= attenuation;
        specular *= attenuation;
        lighting += diffuse + specular;

    }

    FragColor = vec4(lighting, 1.0f);
}

float ShadowCalculation(vec4 fragPosLightSpace, vec3 normal, vec3 lightDir) {

    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;

    projCoords = projCoords * 0.5f + 0.5f;

 //   float closestDepth = texture(shadowMap, projCoords.xy).r;

    float currentDepth = projCoords.z;

    float bias = max(0.05f * (1.0f - dot(normal, lightDir)), 0.005f);

    // float shadow = 0.0f;
    // //float bias = 0.05f;
    // float samples = 4.0f;
    // float offset = 0.1f;
    // for(float x = -offset; x < offset; x += offset / (samples * 0.5f)) {
    //     for(float y = -offset; y < offset; y += offset / (samples * 0.5f)) {
    //         for(float z = -offset; z < offset; z += offset / (samples * 0.5f)) {
    //             float closestDepth = texture(depthMap, fragToLight + vec3(x, y, z)).r;
    //             closestDepth *= far_plane;   // undo mapping [0;1]
    //             if(currentDepth - bias > closestDepth)
    //                 shadow += 1.0f;
    //         }
    //     }
    // }
   // shadow /= (samples * samples * samples);
    float shadow = 0.0f;
    vec2 texelSize = vec2(1.0f / float(textureSize(shadowMap, 0).x), 1.0f / float(textureSize(shadowMap, 0).y));
    for(int x = -1; x <= 1; ++x) {
        for(int y = -1; y <= 1; ++y) {
            float pcfDepth = texture(shadowMap, projCoords.xy + vec2(x, y) * texelSize).r;
            shadow += currentDepth - bias > pcfDepth ? 1.0f : 0.0f;
        }
    }
    shadow /= 9.0f;
    if(projCoords.z > 1.0f)
        shadow = 0.0f;
    return shadow;
}