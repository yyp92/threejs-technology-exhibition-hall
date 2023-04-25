// 镜面反射
import { Reflector } from "./objects/Reflector.js";
import * as THREE from "three";

export default class MirrorPlane {
  constructor(
    size = new THREE.Vector2(100, 100),
    position = new THREE.Vector3(0, 0, 0),
    rotation = new THREE.Euler(-Math.PI / 2, 0, 0)
  ) {
    // console.log(size);
    this.geometry = new THREE.PlaneBufferGeometry(size.x, size.y);
    this.groundMirror = new Reflector(this.geometry, {
      clipBias: 0.003,
      textureWidth: 1980 * window.devicePixelRatio,
      textureHeight: 1080 * window.devicePixelRatio,
      color: 0x330000,
    });
    this.groundMirror.position.copy(position);
    this.groundMirror.rotation.copy(rotation);
    this.mesh = this.groundMirror;
  }
}
