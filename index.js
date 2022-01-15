const express = require('express');
const http = require('http')
const socketio = require('socket.io') 
const cors = require('cors')

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');


const PORT = process.env.PORT || 5000
// const PORT = 5000

const router = require('./router');
const { callbackify } = require('util');

const app = express();
const server = http.createServer(app);
const io = socketio(server , {
  cors: {
    origin: "https://tabletopassistant.netlify.app",
    methods: ["GET", "POST"]
  }
})


// const io = socketio(server , {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"]
//   }
// })
app.use(cors())
app.use(router)








io.on('connect', (socket) => {
  socket.on('join', ({name, room, role }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room, role})

    if(error) return callback(error)  // if there is an arror it gets out of the function with return
    
    socket.join(user.room);         // this is what joins the specific user to the room

    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to ${user.room}` } )
    socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name}, has joined the party!`})

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    console.log("User has Joined!")
    callback();
  })
    

  socket.on('sendPlayerData', (stats, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('stats', { user: user.name, text: stats});

    // callback();
  });

  socket.on('sendPlayerRoll', (number, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('number', { user: user.name, number: number});

    // callback();
  });

  socket.on('sendMapData', (map, callback) => {
    const user = getUser(socket.id);
    
    io.to(user.room).emit('map', {map: map})
  })

 // under construction 
  socket.on('sendNPCData', (npc, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('npc', {name: npc.name, portrait: npc.portrait, notes: []})
  })


  socket.on('deleteNPCData', (npc, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('deleteNPC', {name: npc})
  })


  socket.on('sendNPCNote', (name, note, icon, myName) => {
    const user = getUser(socket.id);
    

    io.to(user.room). emit('noteTransfer', {name: name, note:note, icon:icon, poster:[myName]})
  })


  socket.on('sendPlayerMessage', (message, recipients, name, icon) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('playerMessage', {message: message, recipients: recipients, name: name, icon: icon})
  })


  socket.on('sendPlayerPosition', (position, name, icon) => {
    const user = getUser(socket.id);
    
    io.to(user.room).emit('sendPlayerPosition', {position: position, icon: icon, name: name})
  })

  socket.on('sendMonsterInfo', (monsterGroup) => {
    const user  = getUser(socket.id)

    io.to(user.room).emit('sendMonsterInfo', monsterGroup)
  })

  socket.on('clearMonsterInfo', (clearValue) => {
    const user = getUser(socket.id)

    io.to(user.room).emit('clearMonsterInfo', clearValue)
  })

  socket.on('clearPlayerPosition', (clearValue) => {
    const user = getUser(socket.id)

    io.to(user.room).emit('clearPlayerPosition', clearValue)
  })

  socket.on('sendCombatMap', (map) => {
    const user = getUser(socket.id)

    io.to(user.room).emit('sendCombatMap', map)
  })


  socket.on('logout', (name) => {
    const user = getUser(socket.id)

    io.to(user.room).emit('logout', name)
  })
  

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }
  })
});







server.listen(PORT, () => console.log(`Server has Started on port ${PORT}`));