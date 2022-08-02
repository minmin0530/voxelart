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
        this.planeY = {};
        this.mouse = {};
        this.raycaster = {};
        this.isShiftDown = false;
        this.isMouseDown = false;
    
        this.rollOverMeshAfterPos = new THREE.Vector3(0.0, 0.0, 0.0);
        this.rollOverMeshBeforePos = new THREE.Vector3(0.0, 0.0, 0.0);
        this.rollOverMesh = {};
        this.rollOverMaterial = {};
        this.cubeGeo = {};  //progress_historyでも使う
        this.cubeMaterial = []; //progress_historyでも使う
        this.materialIndex = 0;
        this.opacities = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
        this.lineBox = [];
        this.objects = []; //progress_historyでも使う
        this.objectsMaterial = [];  //progress_historyでも使う
        this.voxelSaveData = [];
        this.contents = '';
        this.form = {};
        this.anglePutFlag = false;
        this.colorChangeFlag = false;
        this.cameraAngle = 0.0;
        this.cameraZoom = 700.0;
        // this.item1 = new Item1();
        // this.item2 = new Item2();
        // this.item3 = new Item3();
        this.deleteFlag = false;
        this.BOX_SIZE = 50;
        this.init();
    }

    init() {
        // シーンを作成
        this.scene = new THREE.Scene();
        this.scene.name = "Scene";
        // カメラを作成
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.set(this.cameraZoom * Math.cos(Math.PI / 180.0 * this.cameraAngle), this.cameraZoom, this.cameraZoom * Math.sin(Math.PI / 180.0 * this.cameraAngle));
        this.camera.lookAt(0, this.cameraZoom / 2.0, 0);

        var rollOverGeo = new THREE.BoxBufferGeometry(this.BOX_SIZE, this.BOX_SIZE, this.BOX_SIZE);
        this.rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
        this.rollOverMesh = new THREE.Mesh(rollOverGeo, this.rollOverMaterial);
        this.scene.add(this.rollOverMesh);


        this.cubeGeo = new THREE.BoxBufferGeometry(this.BOX_SIZE, this.BOX_SIZE, this.BOX_SIZE);
        this.cubeMaterial.push(new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 1.0, transparent: true  }));
        this.cubeMaterial.push(new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 1.0, transparent: true  }));
        this.cubeMaterial.push(new THREE.MeshBasicMaterial({ color: 0x0000ff, opacity: 1.0, transparent: true  }));
        this.cubeMaterial.push(new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 1.0, transparent: true  }));
        this.cubeMaterial.push(new THREE.MeshBasicMaterial({ color: 0xff00ff, opacity: 1.0, transparent: true  }));
        this.cubeMaterial.push(new THREE.MeshBasicMaterial({ color: 0x00ffff, opacity: 1.0, transparent: true  }));
        this.cubeMaterial.push(new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 1.0, transparent: true  }));
        this.cubeMaterial.push(new THREE.MeshBasicMaterial({ color: 0xaaaaaa, opacity: 1.0, transparent: true  }));
        this.cubeMaterial.push(new THREE.MeshBasicMaterial({ color: 0x555555, opacity: 1.0, transparent: true  }));
        this.cubeMaterial.push(new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 1.0, transparent: true  }));
        this.cubeMaterial.push(new THREE.MeshBasicMaterial({ color: 0x880000, opacity: 1.0, transparent: true  }));
        this.cubeMaterial.push(new THREE.MeshBasicMaterial({ color: 0x008800, opacity: 1.0, transparent: true  }));
        this.cubeMaterial.push(new THREE.MeshBasicMaterial({ color: 0x000088, opacity: 1.0, transparent: true  }));
        this.cubeMaterial.push(new THREE.MeshBasicMaterial({ color: 0x880000, opacity: 1.0, transparent: true  }));
        this.cubeMaterial.push(new THREE.MeshBasicMaterial({ color: 0x008888, opacity: 1.0, transparent: true  }));
        this.cubeMaterial.push(new THREE.MeshBasicMaterial({ color: 0x880088, opacity: 1.0, transparent: true  }));
        this.cubeMaterial.push(new THREE.MeshBasicMaterial({ color: 0x888800, opacity: 1.0, transparent: true  }));




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
        this.controls.target.set(0.0, this.cameraZoom / 2.0, 0.0);

        document.addEventListener('mousemove', event => this.onDocumentMouseMove(event), false);
        document.addEventListener('mousedown', event => this.onDocumentMouseDown(event), false);
        document.addEventListener('mouseup', event => this.onDocumentMouseUp(event), false);
        document.addEventListener('keydown', event => this.onDocumentKeyDown(event), false);
        document.addEventListener('keyup', event => this.onDocumentKeyUp(event), false);
        // document.addEventListener( 'scroll', onDocumentScroll, false );

        window.addEventListener('resize', event => this.onWindowResize(event), false);

        this.renderer.setClearColor("#aaaaaa", 1.0);



          // fetch('/apinew').then( (res) => res.json() ).then( (docs) => {
          //   console.log(docs)
          //   this.item1.setName(docs[0].roomhost + "/" + docs[0].roomname);
          //   this.item1.setVoxel(docs[0].voxel);
          //   if (docs.length >= 2) {
          //     this.item2.setName(docs[1].roomhost + "/" + docs[1].roomname);
          //     this.item2.setVoxel(docs[1].voxel);
          //     if (docs.length >= 3) {
          //       this.item3.setName(docs[2].roomhost + "/" + docs[2].roomname);
          //       this.item3.setVoxel(docs[2].voxel);
          //     }
          //   }
          //     // const array = [];
          //     // document.getElementById("publicroom").innerHTML = "<h1>public room</h1><br>";
          //     // for (const doc of docs) {
          //     //     if (doc.room) {
          //     //         for (const room of doc.room) {
          //     //             if (room.private == 1) {
          //     //             } else {
          //     //                 array.push({ date: room.date, account: doc.name, room: room.name});
          //     //             }
          //     //         }
          //     //     }
          //     // }
          //     // array.sort(function(a,b){
          //     //     return new Date(b.date) - new Date(a.date);
          //     // });
          //     // for (const a of array) {
          //     //     document.getElementById("publicroom").innerHTML += "<a href='" + location.href + a.account +'/' + a.room +"'>" + a.date + a.account + '/' + a.room + "<br>";
          //     // }
          // });









        for (let i = 0; i < 16; ++i) {
          document.getElementById("color" + (i + 1)).addEventListener('click', () => {
            this.rollOverMesh.material.color.set(document.getElementById("color" + (i + 1)).value);
            this.cubeMaterial[i] = new THREE.MeshBasicMaterial({ color: document.getElementById("color" + (i + 1)).value, opacity: this.opacities[i], transparent: true  });
            this.materialIndex = i;
            let j = 0;
            for (const o of this.objects) {
              if (o != this.plane && o != this.planeY) {
                console.log(this.voxelSaveData[j]);
                o.material = this.cubeMaterial[this.voxelSaveData[j].m];
                ++j;
              }
            }
          }, false);
          document.getElementById("color" + (i + 1)).addEventListener('change', () => {
            this.rollOverMesh.material.color.set(document.getElementById("color" + (i + 1)).value);
            this.cubeMaterial[i] = new THREE.MeshBasicMaterial({ color: document.getElementById("color" + (i + 1)).value, opacity: this.opacities[i], transparent: true  });
            this.materialIndex = i;
            let j = 0;
            for (const o of this.objects) {
              if (o != this.plane && o != this.planeY) {
                console.log(this.voxelSaveData[j].m);
                o.material = this.cubeMaterial[this.voxelSaveData[j].m];
                ++j;
              }
            }
          }, false);
          document.getElementById("alpha" + (i + 1)).addEventListener('change', () => {
            this.opacities[i] = document.getElementById("alpha" + (i + 1)).value / 100;
            this.cubeMaterial[i] = new THREE.MeshBasicMaterial({ color: document.getElementById("color" + (i + 1)).value, opacity: this.opacities[i], transparent: true  });
            this.materialIndex = i;
            let j = 0;
            for (const o of this.objects) {
              if (o != this.plane && o != this.planeY) {
                console.log(this.voxelSaveData[j].m);
                o.material = this.cubeMaterial[this.voxelSaveData[j].m];
                ++j;
              }
            }
          }, false);
        }

        document.getElementById("colorback").addEventListener('click', () => {
            this.renderer.setClearColor(document.getElementById("color2").value, 1.0);
            this.render();
        }, false);
        document.getElementById("colorback").addEventListener('change', () => {
            this.renderer.setClearColor(document.getElementById("colorback").value, 1.0);
            this.render();
        }, false);
        document.getElementById("delete").addEventListener('change', () => {
          this.deleteFlag = document.getElementById("delete").checked;
          this.render();
        }, false);
        document.getElementById("download").addEventListener('click', () => {

          // // const voxels = [];
          // // for (let i = 1; i < this.objects.length; ++i) {
          // //   voxels.push({
          // //     voxel: {
          // //         x: Math.floor( this.objects[i].position.x / 50 ),
          // //         y: Math.floor( this.objects[i].position.y / 50 ),
          // //         z: Math.floor( this.objects[i].position.z / 50 ),
          // //         m: this.objects[i].material.color,
          // //         // i: this.materialIndex,
          // //         a: this.objects[i].material.opacity,
          // //     },
          // //   });
          // // }
          // // // this.item1.setVoxel(voxels);
          // const adjust = 0;
          // const blob = new Blob([JSON.stringify({
          //   voxel: this.voxelSaveData,
          //   materials: [
          //     {color: this.cubeMaterial[0].color, alpha: this.opacities[0]},
          //     {color: this.cubeMaterial[1].color, alpha: this.opacities[1]},
          //     {color: this.cubeMaterial[2].color, alpha: this.opacities[2]},
          //     {color: this.cubeMaterial[3].color, alpha: this.opacities[3]},
          //     {color: this.cubeMaterial[4].color, alpha: this.opacities[4]},
          //     {color: this.cubeMaterial[5].color, alpha: this.opacities[5]},
          //     {color: this.cubeMaterial[6].color, alpha: this.opacities[6]},
          //     {color: this.cubeMaterial[7].color, alpha: this.opacities[7]},
          //     {color: this.cubeMaterial[8].color, alpha: this.opacities[8]},
          //     {color: this.cubeMaterial[9].color, alpha: this.opacities[9]},
          //     {color: this.cubeMaterial[10].color, alpha: this.opacities[10]},
          //     {color: this.cubeMaterial[11].color, alpha: this.opacities[11]},
          //     {color: this.cubeMaterial[12].color, alpha: this.opacities[12]},
          //     {color: this.cubeMaterial[13].color, alpha: this.opacities[13]},
          //     {color: this.cubeMaterial[14].color, alpha: this.opacities[14]},
          //     {color: this.cubeMaterial[15].color, alpha: this.opacities[15]}
          //   ]
          // })], {type: 'text/plain'});
          // const url = URL.createObjectURL(blob);
          // const a = document.createElement("a");
          // document.body.appendChild(a);
          // a.download = 'foo.txt';
          // a.href = url;
          // a.click();
          // a.remove();
          // URL.revokeObjectURL(url);

          this.scene.remove(this.plane);
          this.scene.remove(this.planeY);
          this.scene.remove(this.gridHelper);
          this.scene.remove(this.gridHelperY);
          this.scene.remove(this.rollOverMesh);

          for (const l of this.lineBox) {
            this.scene.remove(l);
          }


          // for (const m of this.cubeMaterial) {
          //   m.color = Math.floor(Math.random() * 16777216);
          // }


          // origin
          this.exportGLTF(this.scene);

          this.scene.add(this.plane);
          this.scene.add(this.planeY);
          this.scene.add(this.gridHelper);
          this.scene.add(this.gridHelperY);
          this.scene.add(this.rollOverMesh);

          for (const l of this.lineBox) {
            this.scene.add(l);
          }


          // for (let h = 0; h < 999; ++h) {

          //   for (let i = 0; i < 16; ++i) {
          //     this.cubeMaterial[i] = new THREE.MeshBasicMaterial({ color: Math.floor(Math.random() * 16777216), opacity: this.opacities[i], transparent: true  });
          //   }

          //   let j = 0;
          //   for (const o of this.objects) {
          //     if (o != this.plane && o != this.planeY) {
          //       o.material = this.cubeMaterial[this.voxelSaveData[j].m];
          //       ++j;
          //     }
          //   }
          //   this.exportGLTF(this.scene);
          // }
        }, false);
        document.getElementById("save").addEventListener('click', () => {
          const sendData = {
            roomhost: this.roomhost,
            roomname: this.roomname,
            voxel: this.voxelSaveData,
            materials: [
              {color: this.cubeMaterial[0].color.getHex(), alpha: this.opacities[0]},
              {color: this.cubeMaterial[1].color.getHex(), alpha: this.opacities[1]},
              {color: this.cubeMaterial[2].color.getHex(), alpha: this.opacities[2]},
              {color: this.cubeMaterial[3].color.getHex(), alpha: this.opacities[3]},
              {color: this.cubeMaterial[4].color.getHex(), alpha: this.opacities[4]},
              {color: this.cubeMaterial[5].color.getHex(), alpha: this.opacities[5]},
              {color: this.cubeMaterial[6].color.getHex(), alpha: this.opacities[6]},
              {color: this.cubeMaterial[7].color.getHex(), alpha: this.opacities[7]},
              {color: this.cubeMaterial[8].color.getHex(), alpha: this.opacities[8]},
              {color: this.cubeMaterial[9].color.getHex(), alpha: this.opacities[9]},
              {color: this.cubeMaterial[10].color.getHex(), alpha: this.opacities[10]},
              {color: this.cubeMaterial[11].color.getHex(), alpha: this.opacities[11]},
              {color: this.cubeMaterial[12].color.getHex(), alpha: this.opacities[12]},
              {color: this.cubeMaterial[13].color.getHex(), alpha: this.opacities[13]},
              {color: this.cubeMaterial[14].color.getHex(), alpha: this.opacities[14]},
              {color: this.cubeMaterial[15].color.getHex(), alpha: this.opacities[15]}
            ]
          };

          console.log(sendData);
          const param = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendData),
          };
          fetch('/save', param).then( res => res.json() ).then( (data) => { console.log(data); });
        }, false);


        const param = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({roomhost: this.roomhost, roomname: this.roomname}),
        };

        fetch('/getroom', param).then( (res) => res.json() ).then( (room) => {
            this.setRoom(room);
        });

        this.camera.updateProjectionMatrix();
        this.controls.update();

        // this.socketio();


        this.loop();
    }

    toColor(num) {
      num >>>= 0;
      let b = num & 0xFF,
          g = (num & 0xFF00) >>> 8,
          r = (num & 0xFF0000) >>> 16;


          let bb;
          if (b < 16) {
            bb = "0" + b.toString(16);
          } else {
            bb = b.toString(16);
          }
          let gg;
          if (g < 16) {
            gg = "0" + g.toString(16);
          } else {
            gg = g.toString(16);
          }
          let rr;
          if (r < 16) {
            rr = "0" + r.toString(16);
          } else {
            rr = r.toString(16);
          }

      return "#" + rr + gg + bb;

    }

    setRoom(room) {
      for (const voxel of room.room.voxel) {
          this.addVoxel(voxel, room.room.materials);
      }


      for (let i = 0; i < 16; ++i) {
        this.cubeMaterial[i] = new THREE.MeshBasicMaterial({ color: room.room.materials[i].color, opacity: room.room.materials[i].alpha, transparent: true });
        document.getElementById("color" + (i + 1)).value = this.toColor(room.room.materials[i].color);
        document.getElementById("alpha" + (i + 1)).value = 100 * room.room.materials[i].alpha;        
      }
      this.rollOverMesh.material.color.set(document.getElementById("color1").value);
    }

    addVoxel(data, materials) {
        const geometry = new THREE.BoxBufferGeometry(this.BOX_SIZE, this.BOX_SIZE, this.BOX_SIZE, 2, 2, 2);
        const material = new THREE.MeshBasicMaterial( { color: materials[data.m].color, opacity: materials[data.m].alpha, transparent: true } );
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

        this.voxelSaveData.push({
          x: data.x,
          y: data.y,
          z: data.z,
          m: data.m
        });

    }

    // socketio() {
    //     this.socket.on('getUserId', (data) => {
    //         console.log("getUserId" + data);
    //         this.id = data;
    //         this.socket.emit('getUserId', {userid: data, roomhost: this.roomhost, roomname: this.roomname});
    //     });
    //     this.socket.on('connected', data => {
    //         console.log("connected" + data);


    //         if (data.room.voxel.length > 0) {
    //           for (const voxel of data.room.voxel) {
    //               this.addVoxel(voxel);
    //           }
    //         } else {
    //           fetch('/apinum').then( (res) => res.json() ).then( (num) => {
    //               fetch('/api/' + num + location.pathname).then( (res) => res.json() ).then( (room) => {
    //                   this.setRoom(room);
    //               });
    //           });
    //         }

    //     });
    //     this.socket.on('put', (data) => {
    //         console.log(data);

    //         if (data.userID != this.id) {
    //             this.addVoxel(data.voxel[data.voxel.length - 1]);
    //         }
    //         // var voxel = data.voxel[data.voxel.length - 1];//new THREE.Mesh(this.cubeGeo, this.cubeMaterial[this.materialIndex]);
    //         // // voxel.position.copy(intersect.point).add(intersect.face.normal);
    //         // // voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
    //         // this.scene.add(voxel);
    //         // var edges = new THREE.EdgesGeometry(this.cubeGeo);
    //         // this.lineBox.push( new THREE.LineSegments( edges, new THREE.LineBasicMaterial({ color: 0x000000 })) );
    //         // this.lineBox[this.lineBox.length - 1].position.//copy( intersect.point ).add( intersect.face.normal );
    //         // this.lineBox[this.lineBox.length - 1].position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );						
    //         // this.scene.add(this.lineBox[this.lineBox.length - 1]);

            
    //         // this.objects.push(voxel);
    //         // this.objectsMaterial.push(this.cubeMaterial[this.materialIndex]);

    //     });
    // }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    
        this.renderer.setSize(window.innerWidth, window.innerHeight);    
    }


    onDocumentMouseMove(event) {

        event.preventDefault();
    
        this.mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
    
        this.raycaster.setFromCamera(this.mouse, this.camera);
    
        const intersects = this.raycaster.intersectObjects(this.objects);

        if (intersects.length > 0 && (intersects[0].object == this.plane || intersects[0].object == this.planeY ) ) {
          const intersect = intersects[ 0 ];
          this.rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
          this.rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);

        }
    
        if (this.isShiftDown == false && intersects.length > 0) {
    
          const intersect = intersects[ 0 ];
          this.rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
          this.rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
    
        }
    

        if (this.isShiftDown && this.isMouseDown &&

          !(
            this.rollOverMesh.position.x == this.rollOverMeshBeforePos.x &&
            this.rollOverMesh.position.y == this.rollOverMeshBeforePos.y &&
            this.rollOverMesh.position.z == this.rollOverMeshBeforePos.z
            )


          ) {
    
            this.rollOverMeshBeforePos.set(this.rollOverMesh.position.x, this.rollOverMesh.position.y, this.rollOverMesh.position.z);
    
          event.preventDefault();
    
          this.mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
    
          this.raycaster.setFromCamera(this.mouse, this.camera);
    
          const intersects = this.raycaster.intersectObjects(this.objects);
    /*
          if (intersects.length > 0) {
    
            const intersect = intersects[ 0 ];
    
            // delete cube
    
            if (this.deleteFlag) {
    
              if (intersect.object !== this.plane && intersect.object !== this.planeY) {
    
                this.scene.remove(intersect.object);
    
                this.objectsMaterial.splice(this.objectsMaterial.indexOf(intersect.object.material), 1);
                const index = this.objects.indexOf(intersect.object);
                this.objects.splice(index, 1);

                
                for (const l of this.lineBox) {
                  this.scene.remove(l);
                }
                this.lineBox.splice(index - 2, 1);
                for (const l of this.lineBox) {
                  this.scene.add(l);
                }
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
                        i: this.materialIndex,
                        a: this.opacities[this.materialIndex],
                    },
                    
                }
                );
              }
    
            }
    
    //        this.render();
    
          }
          */
        }





        this.render();
    
        // if (isShiftDown) {
        //     cameraAngle += mouse.x + mouse.y;
        //     camera.position.set(cameraZoom * Math.cos(Math.PI / 180.0 * cameraAngle), cameraZoom, cameraZoom * Math.sin(Math.PI / 180.0 * cameraAngle));
        //     camera.lookAt(0, 0, 0);
        // }
      }
    
    onDocumentMouseDown(event) {
      this.isMouseDown = true;
        if (this.isShiftDown) {
    
    
          event.preventDefault();
    
          this.mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
    
          this.raycaster.setFromCamera(this.mouse, this.camera);
    
          var intersects = this.raycaster.intersectObjects(this.objects);
    
          if (intersects.length > 0) {
    
            var intersect = intersects[ 0 ];
    
            // delete cube
    
            if (this.deleteFlag) {
    
              if (intersect.object !== this.plane && intersect.object !== this.planeY) {
    
                this.scene.remove(intersect.object);
    
                this.objectsMaterial.splice(this.objectsMaterial.indexOf(intersect.object.material), 1);
                const index = this.objects.indexOf(intersect.object);
                this.objects.splice(index, 1);
                this.voxelSaveData.splice(index - 2, 1);
                for (const l of this.lineBox) {
                  this.scene.remove(l);
                }
                this.lineBox.splice(index - 2, 1);
                for (const l of this.lineBox) {
                  this.scene.add(l);
                }
    
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

                this.voxelSaveData.push({
                  x: Math.floor( voxel.position.x / 50 ),
                  y: Math.floor( voxel.position.y / 50 ),
                  z: Math.floor( voxel.position.z / 50 ),
                  m: this.materialIndex
                });

                // this.socket.emit("put",
                // {
                //     userID: this.id,
                //     roomhost: this.roomhost,
                //     roomname: this.roomname,
                //     voxel: {
                //         x: Math.floor( voxel.position.x / 50 ),
                //         y: Math.floor( voxel.position.y / 50 ),
                //         z: Math.floor( voxel.position.z / 50 ),
                //         m: this.materialIndex
                //     }
                // }
                // );
              }
    
            }
    
            this.render();
    
          }
        }
    
    }
    onDocumentMouseUp(event) {
      this.isMouseDown = false;
    }
    onDocumentKeyDown(event) {
    
      switch (event.keyCode) {
  
        case 16: this.isShiftDown = true; this.controls.enabled = false; break;
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
  
        case 16: this.isShiftDown = false; this.controls.enabled = true; break;
        case 38: this.isUpKeyDown = false; break;
        case 40: this.isDownKeyDown = true; break;
  
      }
  
    }
  

    render() {
//        this.renderer.setClearColor("#aaaaaa", 1.0);
        this.renderer.render(this.scene, this.camera);
    }
    
    loop() {
        this.render();
        var self = this;
        requestAnimationFrame(function(){ self.loop(); });
    }







    // import { OBJLoader } from './jsm/loaders/OBJLoader.js';
    // import { GLTFExporter } from './jsm/exporters/GLTFExporter.js';
    // import { GUI } from './jsm/libs/lil-gui.module.min.js';

    exportGLTF( input ) {

      const gltfExporter = new GLTFExporter();
      const scene2 = new THREE.Scene();
      scene2.name = "Scene2";
      const params = {
				trs: false,
				onlyVisible: true,
				truncateDrawRange: true,
				binary: false,
				maxTextureSize: 4096,
				exportScene1: this.scene
			};


      const options = {
        trs: params.trs,
        onlyVisible: params.onlyVisible,
        truncateDrawRange: params.truncateDrawRange,
        binary: params.binary,
        maxTextureSize: params.maxTextureSize
      };
      gltfExporter.parse(
        input,
        function ( result ) {

          if ( result instanceof ArrayBuffer ) {

            saveArrayBuffer( result, 'scene.glb' );

          } else {

            const output = JSON.stringify( result, null, 2 );
            console.log( output );
            saveString( output, 'scene.gltf' );

          }

        },
        function ( error ) {

          console.log( 'An error happened during parsing', error );

        },
        options
      );

    }
}

function save( blob, filename ) {
  const link = document.createElement( 'a' );
  link.style.display = 'none';
  document.body.appendChild( link ); // Firefox workaround, see #6594

  link.href = URL.createObjectURL( blob );
  link.download = filename;
  link.click();

  // URL.revokeObjectURL( url ); breaks Firefox...

}

function saveString( text, filename ) {

  save( new Blob( [ text ], { type: 'text/plain' } ), filename );

}


function saveArrayBuffer( buffer, filename ) {

  save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

}
