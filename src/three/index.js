import * as THREE from "three";
// 导入轨道控制器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
// 导入后期效果合成器
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
// three框架本身自带效果
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { SSAARenderPass } from "three/examples/jsm/postprocessing/SSAARenderPass";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { SSRPass } from "three/examples/jsm/postprocessing/SSRPass.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { ReflectorForSSRPass } from "three/examples/jsm/objects/ReflectorForSSRPass.js";

import gsap from "gsap";

// 导入云
import { Clouds, CloudsPlus } from "./Clouds";
// 导入海洋
import Ocean from "./Ocean";
// 导入八叉树物理碰撞类
import Physics from "./Physics";
// 添加视频平面
import VideoPlane from "./VideoPlane";
// 导入光环
import LightCircle from "./LightCircle";
// 导入canvasplane
import CanvasPlane from "./CanvasPlane";
// 导入canvasVideo
import TextVideo from "./TextVideo";
// 导入FireSprite
import FireSprite from "./FireSprite";
// 镜面反射
import MirrorPlane from "./MirrorPlane";
// 镜面物体
import MirrorMesh from "./MirrorMesh";
// 添加精灵文字
import SpriteCanvas from "./SpriteCanvas";
export default class ThreePlus {
  constructor(selector) {
    // console.log("THREEPlus");
    this.mixers = [];
    this.actions = [];
    this.textVideoArrays = [];
    this.clock = new THREE.Clock();
    this.domElement = document.querySelector(selector);
    this.width = this.domElement.clientWidth;
    this.height = this.domElement.clientHeight;
    this.updateMeshArr = [];

    this.init();
  }
  init() {
    // console.log("THREEPlus init");
    this.initScene();
    this.initCamera();
    this.initRenderer();
    // this.initControl();
    this.controlsCamera();
    this.initEffect();
    this.render();
    // this.addAxis();
    console.log(this.renderer.info);
  }
  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcccccc);
  }
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      0.000001,
      10000
    );
    this.camera.position.set(0, 1.5, 12);

    this.camera.aspect = this.width / this.height;
    //   更新摄像机的投影矩阵
    this.camera.updateProjectionMatrix();
  }
  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      logarithmicDepthBuffer: true,
      antialias: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 2;
    this.renderer.sortObjects = true;
    this.domElement.appendChild(this.renderer.domElement);
  }
  initControl() {
    this.control = new OrbitControls(this.camera, this.renderer.domElement);
  }
  render() {
    let deltaTime = this.clock.getDelta();
    // 更新mixers
    for (let i = 0; i < this.mixers.length; i++) {
      this.mixers[i].update(deltaTime * 0.2);
    }
    this.control && this.control.update();
    // this.renderer.render(this.scene, this.camera);
    if (this.physics) {
      this.physics.update(deltaTime);
    }
    if (this.textVideoArrays.length > 0) {
      for (let i = 0; i < this.textVideoArrays.length; i++) {
        this.textVideoArrays[i].update(deltaTime);
      }
    }
    if (this.updateMeshArr.length > 0) {
      for (let i = 0; i < this.updateMeshArr.length; i++) {
        this.updateMeshArr[i].update(deltaTime);
      }
    }
    this.effectComposer.render();
    requestAnimationFrame(this.render.bind(this));
  }
  gltfLoader(url) {
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("./draco/gltf/");
    dracoLoader.setDecoderConfig({ type: "js" });
    dracoLoader.preload();
    gltfLoader.setDRACOLoader(dracoLoader);

    return new Promise((resolve, reject) => {
      gltfLoader.load(url, (gltf) => {
        resolve(gltf);
      });
    });
  }
  fbxLoader(url) {
    const fbxLoader = new FBXLoader();
    return new Promise((resolve, reject) => {
      fbxLoader.load(url, (fbx) => {
        resolve(fbx);
      });
    });
  }
  hdrLoader(url) {
    const hdrLoader = new RGBELoader();
    return new Promise((resolve, reject) => {
      hdrLoader.load(url, (hdr) => {
        resolve(hdr);
      });
    });
  }
  setBg(url) {
    this.hdrLoader(url).then((texture) => {
      texture.mapping = THREE.EquirectangularRefractionMapping;
      texture.anisotropy = 16;
      texture.format = THREE.RGBAFormat;
      this.scene.background = texture;
      this.scene.environment = texture;
    });
  }
  setBgJpg(url) {
    let texture = new THREE.TextureLoader().load(url);
    texture.mapping = THREE.EquirectangularRefractionMapping;
    texture.anisotropy = 16;
    texture.format = THREE.RGBAFormat;
    this.scene.background = texture;
    this.scene.environment = texture;
  }
  setLight() {
    // 添加环境光

    this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(this.ambientLight);
    const light1 = new THREE.DirectionalLight(0xffffff, 0.3);
    light1.position.set(0, 10, 10);
    const light2 = new THREE.DirectionalLight(0xffffff, 0.3);
    light2.position.set(0, 10, -10);
    const light3 = new THREE.DirectionalLight(0xffffff, 0.8);
    light3.position.set(10, 10, 10);
    light1.castShadow = true;
    light2.castShadow = true;
    light3.castShadow = true;
    light1.shadow.mapSize.width = 10240;
    light1.shadow.mapSize.height = 10240;
    light2.shadow.mapSize.width = 10240;
    light2.shadow.mapSize.height = 10240;
    light3.shadow.mapSize.width = 10240;
    light3.shadow.mapSize.height = 10240;
    this.scene.add(light1, light2, light3);
  }
  initEffect() {
    // 合成效果
    this.effectComposer = new EffectComposer(this.renderer);
    this.effectComposer.setSize(window.innerWidth, window.innerHeight);

    // 添加渲染通道
    const renderPass = new RenderPass(this.scene, this.camera);
    this.effectComposer.addPass(renderPass);

    // 点效果
    // const dotScreenPass = new DotScreenPass();
    // dotScreenPass.enabled = false;
    // effectComposer.addPass(dotScreenPass);

    // 抗锯齿
    const smaaPass = new SMAAPass();
    this.effectComposer.addPass(smaaPass);

    // 发光效果
    // this.unrealBloomPass = new UnrealBloomPass();
    // this.effectComposer.addPass(this.unrealBloomPass);

    // this.addReflectorPlane();
    // // SSR屏幕反射
    // const ssrPass = new SSRPass({
    //   renderer: this.renderer,
    //   scene: this.scene,
    //   camera: this.camera,
    //   width: this.width,
    //   height: this.height,
    //   groundReflector: this.groundReflector ? this.groundReflector : null,
    //   selects: this.groundReflector ? this.reflectorSelects : null,
    //   distanceAttenuation: true,
    // });
    // ssrPass.maxDistance = 1000000;
    // console.log(ssrPass);

    // this.effectComposer.addPass(ssrPass);
    // this.effectComposer.addPass(new ShaderPass(GammaCorrectionShader));
  }
  // 添加反射平面
  addReflectorPlane(size = new THREE.Vector2(100, 100)) {
    let geometry = new THREE.PlaneGeometry(size.x, size.y);
    this.groundReflector = new ReflectorForSSRPass(geometry, {
      clipBias: 0.0003,
      textureWidth: this.width,
      textureHeight: this.height,
      color: 0x888888,
      useDepthTexture: true,

      distanceAttenuation: true,
    });
    this.groundReflector.maxDistance = 1000000;
    console.log(this.groundReflector);
    this.groundReflector.material.depthWrite = false;
    this.groundReflector.rotation.x = -Math.PI / 2;
    this.groundReflector.visible = false;
    this.scene.add(this.groundReflector);
  }
  // 添加镜面平面
  addMirrorPlane(size = new THREE.Vector2(100, 100)) {
    let mirrorPlane = new MirrorPlane(size);
    this.scene.add(mirrorPlane.mesh);
  }
  // 添加云效果
  addClouds() {
    let clouds = new Clouds();
    this.scene.add(clouds.mesh);
  }
  addCloudsPlus() {
    let clouds = new CloudsPlus();
    this.scene.add(clouds.mesh);
  }
  addOcean() {
    let ocean = new Ocean();
    this.scene.add(ocean.mesh);
  }
  // 添加辅助坐标轴
  addAxis() {
    let axis = new THREE.AxesHelper(20);
    this.scene.add(axis);
  }
  addPhysics(planeGroup) {
    this.physics = new Physics(planeGroup, this.camera, this.scene);
    return this.physics;
  }
  addVideoPlane(url, size, position) {
    let videoPlane = new VideoPlane(url, size, position);
    this.scene.add(videoPlane.mesh);
    return videoPlane;
  }
  addLightCircle(position, scale) {
    let lightCircle = new LightCircle(this.scene, position, scale);
    return lightCircle;
  }
  addCanvasPlane(text, position, euler) {
    let canvasPlane = new CanvasPlane(this.scene, text, position, euler);
    return canvasPlane;
  }
  addTextVideo(url, position, euler) {
    let textVideo = new TextVideo(this.scene, url, position, euler);
    this.textVideoArrays.push(textVideo);
    return textVideo;
  }
  addFireSprite(position, scale) {
    let fireSprite = new FireSprite(this.camera, position, scale);
    this.scene.add(fireSprite.mesh);
    this.updateMeshArr.push(fireSprite);
    return fireSprite;
  }
  makeMirror(mesh) {
    return new MirrorMesh(mesh);
  }
  controlsCamera() {
    this.iskeyDown = false;
    this.domElement.addEventListener("mousedown", (e) => {
      this.iskeyDown = true;
    });
    this.domElement.addEventListener("mouseup", (e) => {
      this.iskeyDown = false;
    });
    this.domElement.addEventListener("mouseout", (e) => {
      this.iskeyDown = false;
    });
    this.domElement.addEventListener("mousemove", (e) => {
      if (this.iskeyDown) {
        this.camera.rotation.y -= e.movementX * 0.002;
        this.camera.rotation.x -= e.movementY * 0.002;
        this.camera.rotation.z = 0;
        this.camera.rotation.order = "YXZ";
        // this.camera.updateMatrix();
        // this.camera.matrixWorld = this.camera.matrix;
        // this.camera.updateWorldMatrix();
        // this.camera.matrix = new THREE.Matrix4();
        // this.camera.up.set(0, 1, 0);
        // this.camera.updateProjectionMatrix();
        // console.log(this.camera.matrix, this.camera.matrixWorld);
      }
    });
  }
  initRaycaster() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    // this.domElement.addEventListener("click", (e) => {
    //   this.pointerEvent(e);
    // });
  }
  pointerEvent(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / (1080 * (window.innerWidth / 1920))) * 2 + 1;
    // console.log(this.mouse.x, this.mouse.y, e.clientY);
    return this.mouse;
  }
  onRaycaster(meshArr, fn) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    let intersects = this.raycaster.intersectObjects(meshArr);
    if (intersects.length > 0) {
      fn(intersects);
    }
  }
  mouseRay(meshArr, fn, clickfn) {
    this.initRaycaster();
    // 创建一个平面
    // let texture = new THREE.TextureLoader().load("/textures/effect/kj.png");
    const geometry = new THREE.SphereGeometry(0.2, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff3333,
      side: THREE.DoubleSide,
      transparent: true,
      // opacity: 0.5,
    });
    const plane = new THREE.Mesh(geometry, material);
    this.scene.add(plane);
    this.domElement.addEventListener("mousemove", (e) => {
      this.pointerEvent(e);
      plane.visible = false;
      this.onRaycaster(meshArr, (intersects) => {
        plane.visible = true;
        fn(intersects);
        plane.position.copy(intersects[0].point);
        // plane.rotation.setFromVector3(intersects[0].face.normal);
      });
    });
  }
  clickRay(meshArr, clickfn) {
    this.initRaycaster();

    this.domElement.addEventListener("click", (e) => {
      this.pointerEvent(e);
      this.onRaycaster(meshArr, (intersects) => {
        clickfn(intersects);
        // this.camera.position.x = intersects[0].point.x;
        // this.camera.position.z = intersects[0].point.z;
        // this.camera.position.y = intersects[0].point.y + 2;
      });
    });
  }

  addSpriteText(text, position) {
    let spriteText = new SpriteCanvas(this.camera, text, position);
    this.scene.add(spriteText.mesh);
    return spriteText;
  }
}
