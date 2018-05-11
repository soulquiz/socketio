var express = require('express');
var app = express();
var path = require('path');
var port = 8080;

var server = app.listen(port, function() {
    console.log('Listening on port: ' + port);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', function(req, res) {
    res.render('index');
});

var io = require('socket.io').listen(server);
var client = 0;
io.on('connection', function(socket) {
    console.log('a user connected');
    client++;
    
    io.emit('status', client + ' client connected');
    

    socket.on('chat', function(message) {
        io.emit('chat', message)
    });

    socket.on('disconnect', function() {
        client--;
        console.log('discconnected')
        io.emit('status', client + ' client connected');
        
    });
});