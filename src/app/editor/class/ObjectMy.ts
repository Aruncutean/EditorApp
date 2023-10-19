import { mat4, vec3 } from "gl-matrix";

export class ObjectMy {
  minBounds: any;
  maxBounds: any;
  constructor(position: any, scale: any, vertexMin: any, vertexMax: any) {
    this.minBounds = [
      (vertexMin[0] - 0.1) * scale[0] + position[0],
      (vertexMin[1] - 0.1) * scale[1] + position[1],
      (vertexMin[2] - 0.1) * scale[2] + position[2]
    ];

    this.maxBounds = [
      (vertexMax[0] + 0.1) * scale[0] + position[0],
      (vertexMax[1] + 0.1) * scale[1] + position[1],
      (vertexMax[2] + 0.1) * scale[2] + position[2]
    ];
  }

  rayIntersectsBoundingBox(rayOrigin: any, rayDirection: any) {
    let tmin = (this.minBounds[0] - rayOrigin[0]) / rayDirection[0];
    let tmax = (this.maxBounds[0] - rayOrigin[0]) / rayDirection[0];

    if (tmin > tmax) [tmin, tmax] = [tmax, tmin];

    let tymin = (this.minBounds[1] - rayOrigin[1]) / rayDirection[1];
    let tymax = (this.maxBounds[1] - rayOrigin[1]) / rayDirection[1];

    if (tymin > tymax) [tymin, tymax] = [tymax, tymin];

    if ((tmin > tymax) || (tymin > tmax))
      return { found: false };

    if (tymin > tmin)
      tmin = tymin;

    if (tymax < tmax)
      tmax = tymax;

    let tzmin = (this.minBounds[2] - rayOrigin[2]) / rayDirection[2];
    let tzmax = (this.maxBounds[2] - rayOrigin[2]) / rayDirection[2];

    if (tzmin > tzmax) [tzmin, tzmax] = [tzmax, tzmin];

    if ((tmin > tzmax) || (tzmin > tmax))
      return { found: false };

    return { found: true, distance: tmin };
  }

  intersectRayOBB(origin: any, direction: any, obbCenter: any, obbHalfSizes: any, obbRotationMatrix: any) {
    // Pasul 1: Calculează matricea inversă
    let inverseMatrix = mat4.create();
    mat4.invert(inverseMatrix, obbRotationMatrix);

    // Pasul 2: Transformă originea și direcția razei
    let transformedOrigin: vec3 = [0, 0, 0];
    vec3.transformMat4(transformedOrigin, origin, inverseMatrix);
    let transformedDirection: vec3 = [0, 0, 0];
    vec3.transformMat4(transformedDirection, direction, inverseMatrix);

    // Obține min și max pentru AABB în spațiul local

    vec3.negate(this.minBounds, obbHalfSizes);
    this.maxBounds = obbHalfSizes;

    // Pasul 3: Folosește metoda rază-AABB
    return this.rayIntersectsBoundingBox(transformedOrigin, transformedDirection); // folosește funcția anterioară
  }

}
