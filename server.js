const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const assert = require('assert');
const { dirname } = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const session = require('express-session');

const users = new Map();
const loginUsers = [];

const url = 'mongodb://localhost:27017';
const dbName = 'myMongo4';
const connectOption = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}
var apiNumber = 0;
app.get("/lib/OrbitControls.js", (req, res) => {
  res.sendFile(__dirname + "/lib/OrbitControls.js");
});
app.get("/src/main.js", (req, res) => {
  res.sendFile(__dirname + "/src/main.js");
});
app.get("/src/publicmain.js", (req, res) => {
  res.sendFile(__dirname + "/src/publicmain.js");
});

class Room {
  constructor() {
    this.voxel = [];
    this.users = [];
    this.roomhost = null;
    this.roomname = null;
    this.date = null;
    this.message = [];
  }
}

var room = [
  new Room(),
];

/*
MongoClient.connect(url, connectOption, (err, client) => {

  assert.equal(null, err);

  console.log('Connected successfully to server');

  const db = client.db(dbName);

  client.close();
});
*/

app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
//app.set('trust proxy', 1)
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60 * 1000
  }
}));



const allRoom = async (res, accountname, roomname, roomradio) => {
  const r = new Room();
  r.roomhost = accountname;
  r.roomname = roomname;
  transactionVoxelInsert(r);

  let client;
  try {
    client = await MongoClient.connect('mongodb://127.0.0.1:27017', {useNewUrlParser:true, useUnifiedTopology:true});
    const db = client.db(dbName);
    const collection = db.collection('account');

    const a = await collection.findOneAndUpdate({name: { $eq: accountname } }, {$push:{room: {name: roomname, private: roomradio, date: new Date() } } }, {upsert:true, returnNewDocument : true});
console.log("!!!!!!!!!!!!!!!!")
    console.log(a);
    if (a.lastErrorObject.n == 0) {
      console.log("error");
      // const b = await collection.findOneAndUpdate({name: { $eq: accountname } }, {$push:{room: {name: roomname, private: roomradio } } }, {upsert:true, returnNewDocument : true});
      // await addURL(b.value);

      // await res.redirect(accountname + '/' + roomname);
    } else {
      room.push(r);
      await allURL();
      await res.redirect(accountname + '/' + roomname);  
    }
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }
}


app.get('/apinum', (req, res) => {
  res.json(apiNumber);
});
const allURL = async () => {
  apiNumber += 1;
  let client;
  let login = false;

  try {
    client = await MongoClient.connect('mongodb://127.0.0.1:27017', {useNewUrlParser:true, useUnifiedTopology:true});
    const db = client.db(dbName);
    const collection = db.collection('room');
    await collection.find({}).toArray( (err, docs) => {

      if (docs.length) {
        room = docs;
      }
      console.log(docs);

    });

  } catch (error) {
    console.log(error);
  } finally {
  //    client.close();
  }
  


  try {
    client = await MongoClient.connect('mongodb://127.0.0.1:27017', {useNewUrlParser:true, useUnifiedTopology:true});
    const db = client.db(dbName);
    const collection = db.collection('account');
      await collection.find({}).toArray( (err, docs) => {
        app.get('/api/' + apiNumber, (req, res) => {
//          addURL();
          console.log(docs);
          res.json(docs);
        });

        for (const doc of docs) {
          app.get('/' + doc.name, (req, res) => {
            if (req.session.name == doc.name && req.session.password == doc.password) {
              res.sendFile(__dirname + "/user.html");
            } else {
              res.send("login error");
            }
          });

          app.get('/' + doc.name + "/lib/OrbitControls.js", (req, res) => {
            res.sendFile(__dirname + "/lib/OrbitControls.js");
          });
          app.get('/' + doc.name + "/src/main.js", (req, res) => {
            res.sendFile(__dirname + "/src/main.js");
          });
          app.get('/' + doc.name + "/src/publicmain.js", (req, res) => {
            res.sendFile(__dirname + "/src/publicmain.js");
          });
          
          app.get('/api/' + apiNumber + '/' + doc.name, (req, res) => {
//            addURL();
            res.json(doc.room);
          });


          if (doc.room) {
            for (const r of doc.room) {
              app.get('/' + doc.name + '/' + r.name, (req, res) => {

                let user = {
                  mail:"", name:"", password:"", roomid:"", tempid:"", socketid:"", roomhost:"", roomname:"",
                  color: [
                    Math.floor( Math.random() * 16 ),
                    Math.floor( Math.random() * 16 ),
                    Math.floor( Math.random() * 16 ),
                    Math.floor( Math.random() * 16 ),
                    Math.floor( Math.random() * 16 ),
                    Math.floor( Math.random() * 16 ),
                  ],
                };
              
              
                user["roomid"] = 0;
                user["tempid"] = Math.floor(Math.random() * 100000);
                // room[0].roomid = user.roomid;
                loginUsers.push(user);

                if (r.private == '0') {              

                  // for (let i = 0; i < room.length; ++i) {
                  //   if (room[i].roomhost == doc.name && room[i].roomname == r.name) {
                  //     loginUsers[loginUsers.length - 1].roomid = i;
                  //   }
                  // }
                  // transactionVoxelDownload('selectRoom', doc.name, r.name, io);

                  res.sendFile(__dirname + "/publicroom.html");
                } else if (req.session.name == doc.name && req.session.password == doc.password && (r.private == 1 || r.private == '1')) {
                  res.sendFile(__dirname + "/privateroom.html");
                } else {
                  res.send("login error");
                }
              });
            }
            
          }
          app.post('/' + doc.name, (req, res) => {

            let roomnew = {
              roomname:"", roomradio:"",
              color: [
                Math.floor( Math.random() * 16 ),
                Math.floor( Math.random() * 16 ),
                Math.floor( Math.random() * 16 ),
                Math.floor( Math.random() * 16 ),
                Math.floor( Math.random() * 16 ),
                Math.floor( Math.random() * 16 ),
              ],
            };
          
            roomnew["roomname"] = req.body.roomname;
            roomnew["roomradio"] = req.body.roomradio;

            allRoom(res, doc.name, req.body.roomname, req.body.roomradio);


          



          
            // req.session.name = req.body.name;
            // req.session.password = req.body.password;
            // transactionKururiDownload(user, res);
          
            // user["roomid"] = 0;
            // user["tempid"] = Math.floor(Math.random() * 100000);
            // room[0].roomid = user.roomid;
            // loginUsers.push(user);
          
          //  res.sendFile(__dirname + "/index.html");
          
          });
          


        }
      });
  } catch (error) {
    console.log(error);
  } finally {
//    client.close();
  }
}
allURL();

const transactionKururiDownload = async (data, res) => {
  let client;
  let login = false;
  try {
    client = await MongoClient.connect('mongodb://127.0.0.1:27017', {useNewUrlParser:true, useUnifiedTopology:true});
    const db = client.db(dbName);
    const collection = db.collection('account');
      await collection.find({}).toArray( (err, docs) => {
        for (const doc of docs) {
          if (doc.name == data.name) {
            if (doc.password == data.password) {
              login = true;
              data["tempid"] = Math.floor(Math.random() * 100000);
              // room[data.roomid].roomhost = data.roomhost;
              // room[data.roomid].roomname = data.roomname;
              loginUsers.push(data);
              
              res.redirect(data.name);
            }
          }
        }
        if (!login) {
          res.send("login error");
        }
//        res.send(docs);
//        client.close();
      });
  } catch (error) {
    console.log(error);
  } finally {
//    client.close();
  }

//   try {
//     client = await MongoClient.connect('mongodb://127.0.0.1:27017', {useNewUrlParser:true, useUnifiedTopology:true});
//     const db = client.db(dbName);
//     const collection = db.collection('room');
//     await collection.deleteMany();
//   } catch (error) {
//     console.log(error);
//   } finally {
// //    client.close();
//   }

};

const transactionVoxelDownload = async (emitid, roomhost, roomname, io, socketid) => {
  if (!room[loginUsers[loginUsers.length - 1].roomid].date) {
    let client;
    let login = false;
    try {
      client = await MongoClient.connect('mongodb://127.0.0.1:27017', {useNewUrlParser:true, useUnifiedTopology:true});
      const db = client.db(dbName);
      const collection = db.collection('room');
      const doc = await collection.findOne({roomhost:roomhost, roomname: roomname});
      if (doc) {
        room[loginUsers[loginUsers.length - 1].roomid].message = doc.message;
        room[loginUsers[loginUsers.length - 1].roomid].voxel = doc.voxel;
      }
     console.log("roomid:" + loginUsers[loginUsers.length - 1].roomid);
  //        client.close();
    } catch (error) {
      console.log(error);
    } finally {
  //    client.close();
    }
  }
  loginUsers[loginUsers.length - 1].socketid = socketid;
  io.sockets.connected[socketid].emit(emitid, {
    userID: loginUsers[loginUsers.length - 1].tempid,
    roomID: loginUsers[loginUsers.length - 1].roomid,
    roomhost: loginUsers[loginUsers.length - 1].roomhost,
    roomname: loginUsers[loginUsers.length - 1].roomname,
    color: loginUsers[loginUsers.length - 1].color,
    room: room[loginUsers[loginUsers.length - 1].roomid],
  });


};



const transactionKururiInsert = async (data, res) => {
  let client;
  data = Object.assign(data, {date: new Date() });
  try {
    client = await MongoClient.connect('mongodb://127.0.0.1:27017', {useNewUrlParser:true, useUnifiedTopology:true});
    const db = client.db(dbName);
    const collection = db.collection('account');
    const a = await collection.updateOne({mail:data.mail, password:data.password, name:data.name, date:data.date, room: [{ name: data.room.name, private: data.room.private }]}, {$set:data}, true );
    if (a.result.n == 0) {
      await collection.insertOne(data);
    }
    const r = new Room();
    r.roomhost = data.name;
    r.roomname = data.room.name;
    room.push(r);
    await allURL();
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }
};

const transactionVoxelInsert = async (data, res) => {
  let client;
  data = Object.assign(data, {date: new Date() });
  try {
    client = await MongoClient.connect('mongodb://127.0.0.1:27017', {useNewUrlParser:true, useUnifiedTopology:true});
    const db = client.db(dbName);
    const collection = db.collection('room');
console.log(data.message);
    const a = await collection.updateOne({
      roomhost: data.roomhost, roomname: data.roomname//, voxel: data.voxel, users: data.users, date:data.date
    }, {$set:data}, true );
    if (a.result.n == 0) {
      await collection.insertOne({roomhost: data.roomhost, roomname: data.roomname, message: data.message, voxel: data.voxel, users: data.users, date: data.date});
    } else {
      console.log("insert error");
    }
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }
};


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/login.html");
//  res.sendFile(__dirname + "/index.html");
});
app.get('/signup', (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

app.post('/signup', async (req, res) => {
  let client;
  let exist = false;
  try {
    client = await MongoClient.connect('mongodb://127.0.0.1:27017', {useNewUrlParser:true, useUnifiedTopology:true});
    const db = client.db(dbName);
    const collection = db.collection('account');
      await collection.find({}).toArray( (err, docs) => {
        console.log(docs);
        for (const doc of docs) {
//          console.log(doc.mail);
          if (doc.mail == req.body.mail){
            console.log(req.body.mail);
            exist = true;
          }
        }

        if (req.body.name == "api" ||
            req.body.name == "apinum") {
          exist = true;
        }

        let user = {mail:"", name:"", password:""};

        if (!exist && req.body.mail != "" && req.body.password != "") {
          user["room"] = [{ name: req.body.name, private: '1', date: new Date()}];
          user["mail"] = req.body.mail;
          user["password"] = req.body.password;
          user["name"] = req.body.name;//user.mail.substr(0, user.mail.indexOf("@"));
      //  transactionKururiDownload(req.body, res);
          transactionKururiInsert(user, res);
      
          res.sendFile(__dirname + "/signuped.html");
        } else {
          res.sendFile(__dirname + "/signuperror.html");
        }
      

      });
  } catch (error) {
    console.log(error);
  } finally {
//    client.close();
  }


});


app.post('/', (req, res) => {

  let user = {
    mail:"", name:"", password:"", roomid:"", tempid:"", socketid:"", roomhost:"", roomname:"",
    color: [
      Math.floor( Math.random() * 16 ),
      Math.floor( Math.random() * 16 ),
      Math.floor( Math.random() * 16 ),
      Math.floor( Math.random() * 16 ),
      Math.floor( Math.random() * 16 ),
      Math.floor( Math.random() * 16 ),
    ],
  };

  user["mail"] = req.body.mail;
  user["password"] = req.body.password;
  user["name"] = req.body.name;//user.mail.substr(0, user.mail.indexOf("@"));
//  user["roomid"] = req.body.select;

  req.session.name = req.body.name;
  req.session.password = req.body.password;
  transactionKururiDownload(user, res);

  user["roomid"] = 0;
  user["tempid"] = Math.floor(Math.random() * 100000);
  // room[0].roomid = user.roomid;
  loginUsers.push(user);

//  res.sendFile(__dirname + "/index.html");

});



io.on('connection', socket => {

  let connected = false;
  let index = 0;
  for (const l of loginUsers) {
    if (l.socketid == socket.id) {
      connected = true;
      break;
    }
    ++index;
  }

  if (connected) {
    io.sockets.connected[socket.id].emit('connected', {
      userID: loginUsers[index].tempid,
      // roomID: loginUsers[index].roomid,
      color: loginUsers[index].color,
      room: room[0],
    });
  } else {
    io.sockets.connected[socket.id].emit('getUserId', loginUsers[loginUsers.length - 1].tempid);
  }
  socket.on('getUserId', data => {
    if (data == null) {
    let user = {
      mail:"", name:"", password:"", roomid:"", tempid:"", socketid:"",
      color: [
        Math.floor( Math.random() * 16 ),
        Math.floor( Math.random() * 16 ),
        Math.floor( Math.random() * 16 ),
        Math.floor( Math.random() * 16 ),
        Math.floor( Math.random() * 16 ),
        Math.floor( Math.random() * 16 ),
      ],
    };
    user["roomid"] = 0;
    user["tempid"] = Math.floor(Math.random() * 100000);
    user["socketid"] = socket.id;
    // room[0].roomid = user.roomid;
    loginUsers.push(user);

    transactionVoxelDownload('connected', data.roomhost, data.roomname, io, socket.id);
    } else {
  let index = loginUsers.length - 1;
/*
  for (const l of loginUsers) {
    if (l.tempid == data) {
      break;
    }
    ++index;
  }
*/
console.log("index:"+index);
    var rr;
    for (const r of room) {
      if (r.roomhost == data.roomhost && r.roomname == data.roomname) {
        rr = r;
      }
    }
    io.sockets.connected[socket.id].emit('connected', {
      userID: data.userid,//loginUsers[index].tempid,
//      roomID: 0,//loginUsers[index].roomid,
      //color: loginUsers[index].color,
      color: [
        Math.floor( Math.random() * 16 ),
        Math.floor( Math.random() * 16 ),
        Math.floor( Math.random() * 16 ),
        Math.floor( Math.random() * 16 ),
        Math.floor( Math.random() * 16 ),
        Math.floor( Math.random() * 16 ),
      ],
      room: rr,
    });
    }
  });
  // socket.on('selectRoom', data => {
  //   loginUsers[loginUsers.length - 1].roomid = data;    
  //   transactionVoxelDownload('selectRoom', data.roomhost, data.roomname, io, socket.id);
  // });
  socket.on('saveRoom', data => {
//    room[data].date = new Date();
//    room[data].roomid = data;
    room[data.roomid].roomhost = data.roomhost;
    room[data.roomid].roomname = data.roomname;
    
    for (const r of room) {
      if (r.roomhost == data.roomhost && r.roomname == data.roomname) {
        transactionVoxelInsert(r);
      }
    }
  });

  socket.on('loadRoom', data => {
  });

  socket.on('put', data => {
    console.log(data);
    console.log(room);
    for (const r of room) {
      if (r.roomhost == data.roomhost && r.roomname == data.roomname) {
        console.log("put success");
        r.voxel.push(data.voxel);
        io.emit('put', {
            // roomID: data.roomID,
            roomhost: data.roomhost,
            roomname: data.roomname,
            userID: data.userID,
            voxel: r.voxel,
        });
      }
    }
  });

  socket.on('deleteVoxel', data => {
    room[data.roomID].date = new Date();
    room[data.roomID].voxel.splice(data.index, 1);
    console.log(data.voxel);
    io.emit('deleteVoxel', {
        roomID: data.roomID,
        roomhost: data.roomhost,
        roomname: data.roomname,
        userID: data.userID,
        index: data.index,
    });
  });

  socket.on('deleteAll', data => {
    room[data.roomID].date = new Date();
    room[data.roomID].voxel.length = 0;
    room[data.roomID].voxel = [];
    
    console.log("deleteAll");
    io.emit('deleteAll', {
        roomhost: data.roomhost,
        roomname: data.roomname,
        roomID: data.roomID,
        userID: data.userID,
    });
  });

  socket.on('updatePosition', data => {
      users.set(socket.id, {
          clientID: data.clientID,
          position: data.position
      });
      io.emit('updatePosition', data);
  });

  socket.on('sendMessage', data => {
    for (const r of room) {
      if (r.roomhost == data.roomhost && r.roomname == data.roomname) {
        r.message.push(data.message);
      }
    }
    io.emit('recieveMessage', data);
  });
  // socket.on("disconnect",  () => {
  //     if (users.has(socket.id)) {
  //         io.emit('disconnected', users.get(socket.id).clientID);
  //         users.delete(socket.id);
  //         console.log('client disconnected:');
  //         console.log(Array.from(users.values()).reduce((acc, c) => {
  //             return acc + c.clientID + ', '
  //         }, '').slice(0, -2));
  //     }
  // });
});



http.listen(8080, () => {
  console.log('listening on :8080');
});
