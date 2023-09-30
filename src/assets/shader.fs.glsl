#version 300 es
precision mediump float;

in vec2 fragTexCoord;
in vec3 Normal;
in vec3 FragPos;
in vec4 FragPosLightSpace;
struct Material {
    sampler2D diffuse;
    vec3 specular;
    float shininess;
};

struct PointLight {
    vec3 position;

    float constant;
    float linear;
    float quadratic;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

struct DirLight {
    vec3 direction;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

uniform PointLight pointLights[100];
uniform float isTexture;
uniform sampler2D shadowMap;
uniform vec3 viewPos;

uniform vec3 objectColor;
uniform bool loadLight;
uniform float nrLight;
uniform Material material;
uniform DirLight dirLight;

out vec4 FragColor;

vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir);
vec3 CalcDirLightFor(DirLight light, vec3 normal, vec3 viewDir);
vec3 CalcPointLightFor(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir);
vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir);
float ShadowCalculation(vec4 fragPosLightSpace);
void main() {

    vec3 result = vec3(0);

    vec3 norm = normalize(Normal);
    vec3 viewDir = normalize(viewPos - FragPos);

    if(isTexture == float(0)) {
        if(loadLight == true) {
            result = CalcDirLight(dirLight, norm, viewDir);
            for(int i = 0; i < int(nrLight); i++) result += CalcPointLight(pointLights[i], norm, FragPos, viewDir);

            FragColor = vec4(result, 1.0f);
        } else {
            result += CalcDirLight(dirLight, norm, viewDir);
            FragColor = vec4(result, 1.0f);
           // FragColor = vec4(vec3(texture(material.diffuse, fragTexCoord)), 1.0f);
        }

    } else {
        if(loadLight == true) {
            vec3 result = CalcDirLightFor(dirLight, norm, viewDir);
            for(int i = 0; i < int(nrLight); i++) result += CalcPointLightFor(pointLights[i], norm, FragPos, viewDir);

            FragColor = vec4(result, 1.0f);
        } else {
            FragColor = vec4(objectColor, 1.0f);
        }
    }

}

vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir) {
    vec3 lightDir = normalize(light.position - fragPos);
    // diffuse shading
    float diff = max(dot(normal, lightDir), 0.0f);
    // specular shading
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0f), material.shininess);
    // attenuation
    float distance = length(light.position - fragPos);
    float attenuation = 1.0f / (light.constant + light.linear * distance + light.quadratic * (distance * distance));    
    // combine results
    vec3 ambient = light.ambient * vec3(texture(material.diffuse, fragTexCoord));
    vec3 diffuse = light.diffuse * diff * vec3(texture(material.diffuse, fragTexCoord));
  //  vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));
    vec3 specular = light.specular * (spec * material.specular);
    ambient *= attenuation;
    diffuse *= attenuation;
    specular *= attenuation;
    return (ambient + diffuse + specular);
}

float ShadowCalculation(vec4 fragPosLightSpace, vec3 normal, vec3 lightDir) {

    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;

    projCoords = projCoords * 0.5f + 0.5f;

    float closestDepth = texture(shadowMap, projCoords.xy).r;

    float currentDepth = projCoords.z;

    float bias = max(0.05f * (1.0f - dot(normal, lightDir)), 0.005f);

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

vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir) {
    vec3 color = texture(material.diffuse, fragTexCoord).rgb;

    vec3 lightColor = vec3(0.3f);
    // ambient
    vec3 ambient = 0.3f * lightColor;
    // diffuse
    vec3 lightDir = normalize(-light.direction);
    float diff = max(dot(lightDir, normal), 0.0f);
    vec3 diffuse = diff * lightColor;
    // specular

    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = 0.0f;
    vec3 halfwayDir = normalize(lightDir + viewDir);
    spec = pow(max(dot(normal, halfwayDir), 0.0f), 64.0f);
    vec3 specular = spec * lightColor;
    float shadow = ShadowCalculation(FragPosLightSpace, normal, lightDir);

    return (ambient + (1.0f - shadow) * (diffuse + specular)) * color;
}

vec3 CalcPointLightFor(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir) {

    vec3 lightDir = normalize(light.position - fragPos);
    // diffuse shading
    float diff = max(dot(normal, lightDir), 0.0f);
    // specular shading
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0f), material.shininess);
    // attenuation
    float distance = length(light.position - fragPos);
    float attenuation = 1.0f / (light.constant + light.linear * distance + light.quadratic * (distance * distance));    
    // combine results
    vec3 ambient = light.ambient * objectColor;
    vec3 diffuse = light.diffuse * diff * objectColor;
    vec3 specular = light.specular * spec * objectColor;

    ambient *= attenuation;
    diffuse *= attenuation;
    specular *= attenuation;
    return (ambient + diffuse + specular);
}

vec3 CalcDirLightFor(DirLight light, vec3 normal, vec3 viewDir) {
    vec3 lightDir = normalize(-light.direction);
    // diffuse shading
    float diff = max(dot(normal, lightDir), 0.0f);
    // specular shading
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0f), material.shininess);
    // combine results
    vec3 ambient = light.ambient * objectColor;
    vec3 diffuse = light.diffuse * diff * objectColor;
    vec3 specular = light.specular * (spec * material.specular);
    return (ambient + diffuse + specular);
}