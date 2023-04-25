import * as THREE from "three";

export default class SpriteCanvas {
  constructor(
    camera,
    text = "helloworld",
    position = new THREE.Vector3(0, 0, 0),
    euler = new THREE.Euler(0, 0, 0)
  ) {
    this.fns = [];
    // 创建canvas对象
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    // canvas.style.position = "absolute";
    // canvas.style.top = "0px";
    // canvas.style.left = "0px";
    // canvas.style.zIndex = "1";
    // canvas.style.transformOrigin = "0 0";
    // canvas.style.transform = "scale(0.1)";
    const context = canvas.getContext("2d");
    this.context = context;
    context.fillStyle = "rgba(90,90,90,0.7)";
    context.fillRect(0, 256, 1024, 512);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "bold 200px Arial";
    context.fillStyle = "rgba(255,255,255,1)";
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    let texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.SpriteMaterial({
      map: texture,
      color: 0xffffff,
      // alphaMap: texture,
      side: THREE.DoubleSide,
      transparent: true,
      // blending: THREE.AdditiveBlending,
    });
    this.mesh = new THREE.Sprite(material);
    this.mesh.scale.set(1, 1, 1);
    this.mesh.position.copy(position);
    // this.mesh.rotation.copy(euler);

    // console.log(this);

    // 创建射线
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 事件的监听
    window.addEventListener("click", (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y =
        -(event.clientY / (1080 * (window.innerWidth / 1920))) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, camera);

      event.mesh = this.mesh;
      event.spriteCanvas = this;

      // console.log(this.mouse);
      const intersects = this.raycaster.intersectObject(this.mesh);
      event.intersects = intersects;
      // console.log(intersects);
      if (intersects.length > 0) {
        this.fns.forEach((fn) => {
          fn(event);
        });
      }
    });
  }
  onClick(fn) {
    this.fns.push(fn);
  }
}
