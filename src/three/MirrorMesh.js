// 镜面反射
import { Reflector } from "./objects/Reflector.js";
import * as THREE from "three";

export default class MirrorMesh {
  constructor(mesh, color = 0xffffff) {
    // console.log(size);
    this.geometry = mesh.geometry;
    this.meshMirror = new Reflector(this.geometry, {
      clipBias: 0,
      textureWidth: 1980 * window.devicePixelRatio,
      textureHeight: 1080 * window.devicePixelRatio,
      color: color,
    });
    this.meshMirror.position.copy(mesh.position);
    this.meshMirror.rotation.copy(mesh.rotation);
    this.mesh = this.meshMirror;
  }
}
