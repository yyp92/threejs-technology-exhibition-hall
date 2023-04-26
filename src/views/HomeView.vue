<template>
  <div class="home" ref="screenDom">
    <div class="canvas-container"></div>
    <!-- <BigScreen></BigScreen> -->
    <div class="loading" v-if="progress != 100"></div>
    <div class="progress" v-if="progress != 100">
      <img src="../assets/loading.gif" alt="" />
      <span>展馆加载中：{{ progress }}%</span>
    </div>
    <div class="title">科技展馆：点击文字位置即可切换场景位置</div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import ThreePlus from "../three/index";
import * as THREE from "three";
import eventHub from "@/utils/eventHub";
import modifyCityMaterial from "../three/modify/modifyCityMaterial";
import BigScreen from "../components/BigScreen.vue";
import gsap from "gsap";
let progress = ref(0);

let screenDom = ref(null);
const resizeFn = () => {
  // console.log(screenDom);
  let scale = window.innerWidth / 1920;
  screenDom.value.style.transform = `scale(${scale})`;
};
onMounted(() => {
  resizeFn();
  window.addEventListener("resize", resizeFn);
});

onMounted(() => {
  const container = document.querySelector(".canvas-container");
  let threePlus = new ThreePlus(".canvas-container");
  threePlus.setBgJpg("./assets/textures/bl.jpg");

  // 加载模型
  threePlus.gltfLoader("./model/exhibition-min1.glb").then((gltf) => {
    let floorArr = [];
    gltf.scene.traverse((child) => {
      if (child.isLight) {
        // console.log(child);
        child.intensity = 1;
        // child.position.y = 1;
      }

      if (child.isMesh && child.material.name.indexOf("Glass") !== -1) {
        console.log(child);
        child.geometry.computeVertexNormals();
        const cubeMaterial3 = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          envMap: threePlus.scene.environment,
          refractionRatio: 0.98,
          reflectivity: 0.98,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
        });
        child.material = cubeMaterial3;
        const geometry = new THREE.TorusKnotGeometry(0.5, 0.15, 50, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const torusKnot = new THREE.Mesh(geometry, material);
        torusKnot.position.set(0, 4, 0);
        torusKnot.scale.set(1, 3, 1);
        child.add(torusKnot);
      }

      if (child.isMesh && child.material.name.indexOf("Floor") !== -1) {
        // console.log(child);
        child.material = new THREE.MeshBasicMaterial({
          map: child.material.map,
        });
        floorArr.push(child);
      }
    });
    threePlus.scene.add(gltf.scene);
    threePlus.mouseRay(floorArr, (intersects) => {
      // console.log(intersects);
    });
  });

  // 添加灯光
  threePlus.setLight();

  // 添加镜面
  // threePlus.addMirrorPlane();
  // 光阵
  // let lightPlane = threePlus.addVideoPlane("./video/zp2.mp4", {
  //   x: 1.6,
  //   y: 0.9,
  // });
  // lightPlane.mesh.rotation.x = -Math.PI / 2;
  // lightPlane.mesh.position.set(0, -0.5, -12);

  // let lightPlane1 = threePlus.addVideoPlane("./video/zp2.mp4", {
  //   x: 1.6,
  //   y: 0.9,
  // });
  // lightPlane1.mesh.rotation.x = -Math.PI / 2;
  // lightPlane1.mesh.position.set(-10, -0.5, 4);

  // let lightPlane2 = threePlus.addVideoPlane("./video/zp2.mp4", {
  //   x: 1.6,
  //   y: 0.9,
  // });
  // lightPlane2.mesh.rotation.x = -Math.PI / 2;
  // lightPlane2.mesh.position.set(-7, -0.5, 9);

  // let lightPlane3 = threePlus.addVideoPlane("./video/zp2.mp4", {
  //   x: 1.6,
  //   y: 0.9,
  // });
  // lightPlane3.mesh.rotation.x = -Math.PI / 2;
  // lightPlane3.mesh.position.set(-10, -0.5, -3);
  // threePlus.unrealBloomPass.threshold = 0.5;
  // threePlus.unrealBloomPass.strength = 0.6;
  // threePlus.unrealBloomPass.radius = 0.5;
  // threePlus.control.autoRotate = true;

  let texture = new THREE.TextureLoader().load("./textures/effect/jj.png");
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  let material = new THREE.MeshBasicMaterial({
    map: texture,
    alphaMap: texture,
    side: THREE.DoubleSide,
    // transparent: true,
  });

  let plane = new THREE.CircleBufferGeometry(1, 32);
  let mesh = new THREE.Mesh(plane, material);
  mesh.position.set(-12, -1, 4);
  mesh.rotation.x = -Math.PI / 2;
  threePlus.scene.add(mesh);
  let spriteText = threePlus.addSpriteText(
    "展馆中庭",
    new THREE.Vector3(-12, 0, 4)
  );
  let clickFn = (event) => {
    // console.log(intersects);
    // threePlus.camera.position.x = intersects[0].point.x;
    // threePlus.camera.position.z = intersects[0].point.z;
    // threePlus.camera.position.y = intersects[0].point.y + 2;
    gsap.to(threePlus.camera.position, {
      x: event.intersects[0].point.x,
      z: event.intersects[0].point.z,
      y: event.intersects[0].point.y + 1,
      duration: 1,
    });
  };
  spriteText.onClick(clickFn);

  let mesh1 = new THREE.Mesh(plane, material);
  mesh1.position.set(-7, -1, 9);
  mesh1.rotation.x = -Math.PI / 2;
  threePlus.scene.add(mesh1);
  let spriteText1 = threePlus.addSpriteText(
    "黄金展品",
    new THREE.Vector3(-7, 0, 9)
  );
  spriteText1.onClick(clickFn);

  let mesh2 = new THREE.Mesh(plane, material);
  mesh2.position.set(-12, -1, -5);
  mesh2.rotation.x = -Math.PI / 2;
  threePlus.scene.add(mesh2);
  let spriteText2 = threePlus.addSpriteText(
    "科技纽带",
    new THREE.Vector3(-12, 0, -5)
  );
  spriteText2.onClick(clickFn);

  let mesh3 = new THREE.Mesh(plane, material);
  mesh3.position.set(2, -1, 4);
  mesh3.rotation.x = -Math.PI / 2;
  threePlus.scene.add(mesh3);
  let spriteText3 = threePlus.addSpriteText(
    "球形战机",
    new THREE.Vector3(2, 0, 4)
  );
  spriteText3.onClick(clickFn);

  // threePlus.clickRay(
  //   [lightPlane.mesh, mesh, mesh1, mesh2, mesh3],
  //   (intersects) => {
  //     // threePlus.camera.position.x = intersects[0].point.x;
  //     // threePlus.camera.position.z = intersects[0].point.z;
  //     // threePlus.camera.position.y = intersects[0].point.y + 2;
  //     gsap.to(threePlus.camera.position, {
  //       x: intersects[0].point.x,
  //       z: intersects[0].point.z,
  //       y: intersects[0].point.y + 2,
  //       duration: 1,
  //     });
  //   }
  // );

  THREE.DefaultLoadingManager.onProgress = function (item, loaded, total) {
    console.log(item, loaded, total);
    progress.value = new Number((loaded / total) * 100).toFixed(2);
  };
});
</script>

<style>
.home {
  width: 1920px;
  height: 1080px;
  transform-origin: 0 0;
}
.canvas-container {
  width: 100%;
  height: 100%;
}
.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 1920px;
  height: 1080px;
  background-image: url(../assets/loading.jpg);
  background-size: cover;
  filter: blur(50px);
  z-index: 100;
}
.progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 1920px;
  height: 1080px;
  z-index: 101;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  color: #fff;
}
.progress > img {
  padding: 0 15px;
}

.title {
  width: 380px;
  height: 40px;
  position: fixed;
  right: 100px;
  top: 50px;
  background-color: rgba(0, 0, 0, 0.5);
  line-height: 40px;
  text-align: center;
  color: #fff;
  border-radius: 5px;
  z-index: 110;
}
</style>
