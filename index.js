var app = require ('express')();
var http = require('http').Server(app);

app.get('/', function(req, res) {
    res.sendfile('index.html');
});

http.listen(3000, function(req, res) {
    console.log('start server on port : 3000')
});