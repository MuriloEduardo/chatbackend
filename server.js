// Get dependencies
let express = require('express');
let path = require('path');
let http = require('http');
let bodyParser = require('body-parser');
let io = require('socket.io');

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

app.use(express.static(__dirname + '../../bubbletalk-widget/dist'));


// Set our api routes
app.use('/api', api);
app.use('/widget', widget);

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

io.on('connection', (socket) => {
  console.log('user %s connected', socket.id);
  
  socket.on('disconnect', function(){
    console.log('user %s disconnected', socket.id);
  });
  
  socket.on('add-message', (message) => {
    io.emit('message', {type:'new-message', text: message});    
  });
});

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log('Rodando em: %s', port));