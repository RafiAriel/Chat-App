const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
const port = process.env.PORT || 5000;


const isEmpty = inputObject => {
  return Object.keys(inputObject).length === 0;
};
 
const rooms = {}

if(isEmpty(rooms))
{
  rooms["Gaming"] = { users: {} }
  io.emit('room-created', "Gaming")

  rooms["Politics"] = { users: {} }
  io.emit('room-created', "Politics")

  
  rooms["Football"] = { users: {} }
  io.emit('room-created', "Football")
}


app.get('/', (req, res) => {
  res.render('index', { rooms: rooms, port: port }) 
})

app.post('/room', (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect('/')
  }
  rooms[req.body.room] = { users: {} }
  // res.redirect(req.body.room)
  io.emit('room-created', req.body.room)
  res.redirect("/");
  
  
})

// name.swal("Good job!", "You clicked the button!", "success")

app.get('/:room', (req, res) => {
 
  res.render('room', { roomName: req.params.room, port:port })
})


server.listen(port)



io.on('connection', socket => {
  socket.on('new-user', (room, name) => {
    socket.join(room)
    rooms[room].users[socket.id] = name
    socket.broadcast.to(room).emit('user-connected', name)
  })
  socket.on('send-chat-message', (room, message) => {
    socket.broadcast.to(room).emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
  })
  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.broadcast.to(room).emit('user-disconnected', rooms[room].users[socket.id])
      delete rooms[room].users[socket.id]
    })
  })
})

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}

module.exports={
  port
};


