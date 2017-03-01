// Get dependencies
let express = require('express');
let path = require('path');
let http = require('http');
let bodyParser = require('body-parser');
let passport = require('passport');
let io = require('socket.io');
let mongoose = require('mongoose');
let configDB = require('./config/database');

mongoose.connect(configDB.url, (err, res) => {
  mongoose.Promise = global.Promise;
  if(err) throw err;
  console.info('MongoDB Conectado');
});

// Get our API routes
let api = require('./routes/api');
let widget = require('./routes/widget');

let app = express();

let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:4200');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

// Parsers for POST data
app.use(allowCrossDomain);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
require('./config/passport')(passport);

app.use(express.static(__dirname + '../../bubbletalk-widget/dist'));


// Set our api routes
app.use('/api', api);
app.use('/widget', widget);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

/**
 * Get port from environment and store in Express.
 */
let port = process.env.PORT || 3000;
app.set('port', port);

/**
 * Create HTTP server.
 */
let server = http.createServer(app);

io = io.listen(server);

let users = {};
io.sockets.on('connection', (socket) => {

  // SET'S //
  //////////
  socket.on('set:user', (user) => {
    socket.emit('set:user', {socket_id: socket.id});
    users[socket.id] = socket;
  });

  socket.on('set:room', (room) => {
    if(socket.room)
      socket.leave(socket.room);
    socket.room = room;
    socket.join(room);

    // "Callback" para dar boas vindas ao usuario que entrou
    io.sockets.in(room).emit('join:room', {socket_id: socket.id});

    console.log(io.sockets.adapter.rooms)
    console.log(room)
  });

  // CHANGE'S //
  /////////////

  // NEW'S //
  //////////
  socket.on('new:message', (message) => {
    console.log(message)
    if(message.conversa._id in users) {
      users[message.conversa._id].emit('message', {socket_id: socket.id, type:'new-message', text: message.message});
    } else {
      io.emit('message', {socket_id: socket.id, type:'new-message', text: message.message});
    }
  });

  // ANY'S //
  //////////
  socket.on('disconnect', function(){
    console.log('user %s disconnected', socket.id);
    socket.broadcast.to(socket.room).emit('left:room', {socket_id: socket.id});

    socket.leave(socket.room);

    delete users[socket.id];
  });
});

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log('Rodando em: %s', port));