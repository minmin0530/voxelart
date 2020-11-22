class PublicMain {
    constructor(socket) {
        this.socket = socket;
        this.roomhost = location.pathname.split('/')[1];
        this.roomname = location.pathname.split('/')[2];
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
        this.cubeMaterial.push(new THREE.MeshLambertMaterial({ color: 0xfeb74c }));
        }

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
                    
        var gridHelper = new THREE.GridHelper(2500, 50);
        this.scene.add(gridHelper);

        var geometry = new THREE.PlaneBufferGeometry(2500, 2500);
        geometry.rotateX(- Math.PI / 2);

        this.plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
        this.scene.add(this.plane);

        this.objects.push(this.plane);

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

        this.socketio();


        this.loop();
    }

    addVoxel(data) {
        const geometry = new THREE.BoxGeometry(50, 50, 50, 2, 2, 2);
        const material = new THREE.MeshLambertMaterial( { color: data.m } );
        const box = new THREE.Mesh(geometry, material);
        box.position.set(data.x * 50, data.y * 50, data.z * 50);
        box.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
        this.scene.add(box);
//        var edges = new THREE.EdgesGeometory(box, 0x000000);
        var edges = new THREE.EdgesGeometry(this.cubeGeo);
        this.lineBox.push( new THREE.LineSegments( edges, new THREE.LineBasicMaterial({ color: 0x000000 })) );
        this.lineBox[this.lineBox.length - 1].position.set(data.x * 50, data.y * 50, data.z * 50);
        this.lineBox[this.lineBox.length - 1].position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
        this.scene.add(this.lineBox[this.lineBox.length - 1]);

        this.objects.push( box );
        this.objectsMaterial.push(this.cubeMaterial[this.materialIndex]);

    }

    socketio() {
        this.socket.on('getUserId', (data) => {
            console.log("getUserId" + data);
            this.id = data;
            this.socket.emit('getUserId', {userid: data, roomhost: this.roomhost, roomname: this.roomname});
        });
        this.socket.on('connected', data => {
            console.log("connected" + data);


            for (const voxel of data.room.voxel) {
                this.addVoxel(voxel);
            }
  

        });
        this.socket.on('put', (data) => {
            console.log(data);

            this.addVoxel(data.voxel[data.voxel.length - 1]);

            // var voxel = data.voxel[data.voxel.length - 1];//new THREE.Mesh(this.cubeGeo, this.cubeMaterial[this.materialIndex]);
            // // voxel.position.copy(intersect.point).add(intersect.face.normal);
            // // voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
            // this.scene.add(voxel);
            // var edges = new THREE.EdgesGeometry(this.cubeGeo);
            // this.lineBox.push( new THREE.LineSegments( edges, new THREE.LineBasicMaterial({ color: 0x000000 })) );
            // this.lineBox[this.lineBox.length - 1].position.//copy( intersect.point ).add( intersect.face.normal );
            // this.lineBox[this.lineBox.length - 1].position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );						
            // this.scene.add(this.lineBox[this.lineBox.length - 1]);

            
            // this.objects.push(voxel);
            // this.objectsMaterial.push(this.cubeMaterial[this.materialIndex]);

        });
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

                this.socket.emit("put",
                {
                    userID: this.id,
                    roomhost: this.roomhost,
                    roomname: this.roomname,
                    voxel: {
                        x: Math.floor( voxel.position.x / 50 ),
                        y: Math.floor( voxel.position.y / 50 ),
                        z: Math.floor( voxel.position.z / 50 ),
                        m: voxel.material.color,
                    },
                    
                }
                );
              }
    
            }
    
            this.render();
    
          }
        }
    
    }
    
    onDocumentKeyDown(event) {
    
        switch (event.keyCode) {
    
            case 16: this.isShiftDown = true; break;
    
        }
    
    }
    
    onDocumentKeyUp(event) {
    
        switch (event.keyCode) {
    
            case 16: this.isShiftDown = false; break;
    
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