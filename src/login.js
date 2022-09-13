function colorToText(mm) {
  let colorText = '#';
  let m1 = Math.floor(mm.r * 255 % 16);
  let m2 = Math.floor(mm.r * 255 / 16);
  if      (m1 == 10) { m1 = 'a'; }
  else if (m1 == 11) { m1 = 'b'; }
  else if (m1 == 12) { m1 = 'c'; }
  else if (m1 == 13) { m1 = 'd'; }
  else if (m1 == 14) { m1 = 'e'; }
  else if (m1 == 15) { m1 = 'f'; }
  if      (m2 == 10) { m2 = 'a'; }
  else if (m2 == 11) { m2 = 'b'; }
  else if (m2 == 12) { m2 = 'c'; }
  else if (m2 == 13) { m2 = 'd'; }
  else if (m2 == 14) { m2 = 'e'; }
  else if (m2 >= 15) { m2 = 'f'; }
  colorText += m2 + '' + m1;
  m1 = Math.floor(mm.g * 255 % 16);
  m2 = Math.floor(mm.g * 255 / 16);
  if      (m1 == 10) { m1 = 'a'; }
  else if (m1 == 11) { m1 = 'b'; }
  else if (m1 == 12) { m1 = 'c'; }
  else if (m1 == 13) { m1 = 'd'; }
  else if (m1 == 14) { m1 = 'e'; }
  else if (m1 == 15) { m1 = 'f'; }
  if      (m2 == 10) { m2 = 'a'; }
  else if (m2 == 11) { m2 = 'b'; }
  else if (m2 == 12) { m2 = 'c'; }
  else if (m2 == 13) { m2 = 'd'; }
  else if (m2 == 14) { m2 = 'e'; }
  else if (m2 >= 15) { m2 = 'f'; }
  colorText += m2 + '' + m1;
  m1 = Math.floor(mm.b * 255 % 16);
  m2 = Math.floor(mm.b * 255 / 16);
  if      (m1 == 10) { m1 = 'a'; }
  else if (m1 == 11) { m1 = 'b'; }
  else if (m1 == 12) { m1 = 'c'; }
  else if (m1 == 13) { m1 = 'd'; }
  else if (m1 == 14) { m1 = 'e'; }
  else if (m1 == 15) { m1 = 'f'; }
  if      (m2 == 10) { m2 = 'a'; }
  else if (m2 == 11) { m2 = 'b'; }
  else if (m2 == 12) { m2 = 'c'; }
  else if (m2 == 13) { m2 = 'd'; }
  else if (m2 == 14) { m2 = 'e'; }
  else if (m2 >= 15) { m2 = 'f'; }
  colorText += m2 + '' + m1;
  return colorText;
}
class Main {
    constructor() {
        this.camera = {};
        this.scene = {};  //progress_historyでも使う
        this.controls = {};
        this.renderer = {};
        this.plane = {};
        this.mouse = {};
        this.raycaster = {};
        this.isShiftDown = false;
    
        this.rollOverMesh = {};
        this.rollOverMaterial = {};
        this.cubeGeo = {};  //progress_historyでも使う
        this.cubeMaterial = []; //progress_historyでも使う
        this.materialIndex = 0;
        this.opacity = 1.0;

        this.lineBox = [];
        this.objects = []; //progress_historyでも使う
        this.objectsMaterial = [];  //progress_historyでも使う
        this.contents = '';
        this.form = {};
        this.anglePutFlag = false;
        this.colorChangeFlag = false;
        this.cameraAngle = 0.0;
        this.cameraZoom = 700.0;
    
        this.init();
    }

    init() {
        // シーンを作成
        this.scene = new THREE.Scene();
        // カメラを作成
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.set(this.cameraZoom * Math.cos(Math.PI / 180.0 * this.cameraAngle), this.cameraZoom, this.cameraZoom * Math.sin(Math.PI / 180.0 * this.cameraAngle));
        this.camera.lookAt(0, 0, 0);

        var rollOverGeo = new THREE.BoxBufferGeometry(50, 50, 50);
        this.rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
        this.rollOverMesh = new THREE.Mesh(rollOverGeo, this.rollOverMaterial);
        this.scene.add(this.rollOverMesh);


        this.cubeGeo = new THREE.BoxBufferGeometry(50, 50, 50);
        for (let l = 0; l < 16; ++l) {

          const c = {r: Math.random(), g: Math.random(), b: Math.random()  };
          
          this.cubeMaterial.push(new THREE.MeshLambertMaterial({ color: colorToText(c), opacity: 0.7, transparent: true  }));
        }

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
                    
        this.gridHelper = new THREE.GridHelper(2500, 50);
        this.scene.add(this.gridHelper);

        var geometry = new THREE.PlaneBufferGeometry(2500, 2500);
        geometry.rotateX(- Math.PI / 2);

        this.plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
        this.scene.add(this.plane);

        this.objects.push(this.plane);


        this.gridHelperY = new THREE.GridHelper(2500, 50);
        this.gridHelperY.rotateZ(- Math.PI / 2);
        this.gridHelperY.position.y += 1250;
        this.scene.add(this.gridHelperY);
        var geometryY = new THREE.PlaneBufferGeometry(2500, 2500);
        geometryY.rotateY( Math.PI / 2);
        this.planeY = new THREE.Mesh(geometryY, new THREE.MeshBasicMaterial({ visible: false }));
        this.planeY.position.y += 1250;
        this.scene.add(this.planeY);

        this.objects.push(this.planeY);

        var ambientLight = new THREE.AmbientLight(0x606060);
        this.scene.add(ambientLight);

        var directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(1, 0.75, 0.5).normalize();
        this.scene.add(directionalLight);

        var directionalLight2 = new THREE.DirectionalLight(0xffffff);
        directionalLight2.position.set(-1, 0.75, -0.5).normalize();
        this.scene.add(directionalLight2);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

        document.addEventListener('mousemove', event => this.onDocumentMouseMove(event), false);
        document.addEventListener('mousedown', event => this.onDocumentMouseDown(event), false);
        document.addEventListener('keydown', event => this.onDocumentKeyDown(event), false);
        document.addEventListener('keyup', event => this.onDocumentKeyUp(event), false);
        // document.addEventListener( 'scroll', onDocumentScroll, false );

        window.addEventListener('resize', event => this.onWindowResize(event), false);

        this.renderer.setClearColor("#aaaaaa", 1.0);
  
        document.getElementById("color1").addEventListener('click', () => {
          this.rollOverMesh.material.color.set(document.getElementById("color1").value);
          this.cubeMaterial.push( new THREE.MeshLambertMaterial({ color: document.getElementById("color1").value, opacity: this.opacity, transparent: true  }) );
          this.materialIndex = this.cubeMaterial.length - 1;
        }, false);
        document.getElementById("color1").addEventListener('change', () => {
            this.rollOverMesh.material.color.set(document.getElementById("color1").value);
            this.cubeMaterial.push( new THREE.MeshLambertMaterial({ color: document.getElementById("color1").value, opacity: this.opacity, transparent: true  }) );
            this.materialIndex = this.cubeMaterial.length - 1;
        }, false);
        document.getElementById("alpha1").addEventListener('change', () => {
            this.opacity = document.getElementById("alpha1").value / 100;
            console.log(this.opacity);
            this.cubeMaterial[this.materialIndex].opacity = this.opacity;
        }, false);
        document.getElementById("color2").addEventListener('click', () => {
            this.renderer.setClearColor(document.getElementById("color2").value, 1.0);
            this.render();
        }, false);
        document.getElementById("color2").addEventListener('change', () => {
            this.renderer.setClearColor(document.getElementById("color2").value, 1.0);
            this.render();
        }, false);


        for (let ii = 0; ii < 6; ii += 2) {
        for (let xx = 2 - ii / 2; xx < 3 + ii / 2; ++xx) {
          for (let yy = 0 + ii; yy < 9 - ii; ++yy) {
            for (let zz = 2 - ii / 2; zz < 3 + ii / 2; ++zz) {

        var voxel = new THREE.Mesh(this.cubeGeo, this.cubeMaterial[Math.floor(Math.random() * 3)]);
        voxel.position.set(50 * xx,50 * yy,50 * zz);
        voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
        this.scene.add(voxel);
        var edges = new THREE.EdgesGeometry(this.cubeGeo);
        this.lineBox.push( new THREE.LineSegments( edges, new THREE.LineBasicMaterial({ color: 0x000000 })) );
        this.lineBox[this.lineBox.length - 1].position.set(voxel.position.x, voxel.position.y, voxel.position.z);
        this.lineBox[this.lineBox.length - 1].position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );						
        this.scene.add(this.lineBox[this.lineBox.length - 1]);

        
        this.objects.push(voxel);
        this.objectsMaterial.push(this.cubeMaterial[this.materialIndex]);
        }
      }
    }
  }






        this.loop();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    
        this.renderer.setSize(window.innerWidth, window.innerHeight);    
    }


    onDocumentMouseMove(event) {

        event.preventDefault();
    
        this.mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
    
        this.raycaster.setFromCamera(this.mouse, this.camera);
    
        var intersects = this.raycaster.intersectObjects(this.objects);
    
        if (intersects.length > 0) {
    
          var intersect = intersects[ 0 ];
          this.rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
          this.rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
    
        }
    
        this.render();
    
        // if (isShiftDown) {
        //     cameraAngle += mouse.x + mouse.y;
        //     camera.position.set(cameraZoom * Math.cos(Math.PI / 180.0 * cameraAngle), cameraZoom, cameraZoom * Math.sin(Math.PI / 180.0 * cameraAngle));
        //     camera.lookAt(0, 0, 0);
        // }
      }
    
      onDocumentMouseDown(event) {
        if (this.isShiftDown) {
    
    
          event.preventDefault();
    
          this.mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
    
          this.raycaster.setFromCamera(this.mouse, this.camera);
    
          var intersects = this.raycaster.intersectObjects(this.objects);
    
          if (intersects.length > 0) {
    
            var intersect = intersects[ 0 ];
    
            // delete cube
    
            if (this.anglePutFlag) {
    
              if (intersect.object !== this.plane) {
    
                this.scene.remove(intersect.object);
    
                this.objectsMaterial.splice(this.objectsMaterial.indexOf(intersect.object.material), 1);
                this.objects.splice(this.objects.indexOf(intersect.object), 1);
    
              }
    
              // create cube
    
            } else {
    
              if (this.colorChangeFlag) {
                if (intersect.object !== this.plane) {
                  this.objects[ this.objects.indexOf(intersect.object) ].material = this.cubeMaterial[this.materialIndex];
                }
              } else {
                var voxel = new THREE.Mesh(this.cubeGeo, this.cubeMaterial[this.materialIndex]);
                voxel.position.copy(intersect.point).add(intersect.face.normal);
                voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                this.scene.add(voxel);
                var edges = new THREE.EdgesGeometry(this.cubeGeo);
                this.lineBox.push( new THREE.LineSegments( edges, new THREE.LineBasicMaterial({ color: 0x000000 })) );
                this.lineBox[this.lineBox.length - 1].position.copy( intersect.point ).add( intersect.face.normal );
                this.lineBox[this.lineBox.length - 1].position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );						
                this.scene.add(this.lineBox[this.lineBox.length - 1]);

                
                this.objects.push(voxel);
                this.objectsMaterial.push(this.cubeMaterial[this.materialIndex]);
              }
    
            }
    
            this.render();
    
          }
        }
    
      }
    
      onDocumentKeyDown(event) {
    
        switch (event.keyCode) {
    
          case 16: this.isShiftDown = true; break;
          case 38:
            this.isUpKeyDown = true;
            if (this.isShiftDown) {
              this.plane.position.y += 50.0;
              this.gridHelper.position.y += 50.0;
            } else {
              this.planeY.position.x -= 50.0;
              this.gridHelperY.position.x -= 50.0;
            }  
            break;
          case 40:
            this.isDownKeyDown = true;
            if (this.isShiftDown) {
              this.plane.position.y -= 50.0;
              this.gridHelper.position.y -= 50.0;
            } else {
              this.planeY.position.x += 50.0;
              this.gridHelperY.position.x += 50.0;
            }  
            break;
    
        }
    
      }
    
      onDocumentKeyUp(event) {
    
        switch (event.keyCode) {
    
          case 16: this.isShiftDown = false; break;
          case 38: this.isUpKeyDown = false; break;
          case 40: this.isDownKeyDown = true; break;
    
        }
    
      }
    

    render() {
        this.renderer.setClearColor("#aaaaaa", 1.0);
        this.renderer.render(this.scene, this.camera);
    }
    
    loop() {
        this.render();
        var self = this;
        requestAnimationFrame(function(){ self.loop(); });
    }
}