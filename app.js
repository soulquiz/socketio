var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var cmd = require('node-cmd');

var port = 8080;

var server = app.listen(port, function () {
    console.log('Listening on port: ' + port);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.render('index');
});

var io = require('socket.io').listen(server);
var client = 0;
io.on('connection', function (socket) {
    console.log('a user connected');
    client++;

    io.emit('status', client + ' client connected');
    getListFiles(function(fileList) {
        io.emit('fileList', fileList);
    });

    socket.on('chat', function (message) {
        io.emit('chat', message)
    });

    socket.on('delete', function(state) {
        var file_path = "/home/guser/Desktop/"
        var fileName = "test (another copy)"
        deleteFile(file_path, fileName, function(err){
            if(!err) {
                console.log('success')
                getListFiles(function(fileList) {
                    io.emit('fileList', fileList);
                });
            } else {
                console.log(err)
            }
        });
    });

    socket.on('disconnect', function () {
        client--;
        console.log('discconnected')
        io.emit('status', client + ' client connected');

    });
});

// list files in file path (return json filename and size)
app.get('/listfile', function (req, res) {
    var file_path = "/home/guser/Desktop/"


    cmd.get(
        'ls -shp --block-size=MB ' + file_path, function (err, data, stderr) {
            if (!err) {

                var file_size_arr = data.split("\n");
                file_size_arr.splice(-1, 1)  // remove " " last element
                file_size_arr.splice(0, 1)  // remove " total information " at first element


                // get only file name 
                cmd.get('ls -p ' + file_path, function (err, data, stderr) {
                    if (!err) {
                        var file_name_arr = data.split("\n");
                        file_name_arr.splice(-1, 1)  // remove " " last element
                        var file_size_obj = {};
                        for (var i = 0; i < file_size_arr.length; i++) {

                            if (!file_name_arr[i].includes('\\')) {  // ignore file that has \ in filename because gridftp not support
                                file_size_obj[file_name_arr[i]] = file_size_arr[i].replace(file_name_arr[i], '')  // remove file name from string file size+filename
                            }


                        }

                        res.json(file_size_obj)
                    } else {
                        console.log('error', err)
                    }
                })
            } else {
                console.log('error', err)
            }
        }
    )
})

function getListFiles(next) {
    var file_path = "/home/guser/Desktop/"


    cmd.get(
        'ls -shp --block-size=MB ' + file_path, function (err, data, stderr) {
            if (!err) {

                var file_size_arr = data.split("\n");
                file_size_arr.splice(-1, 1)  // remove " " last element
                file_size_arr.splice(0, 1)  // remove " total information " at first element


                // get only file name 
                cmd.get('ls -p ' + file_path, function (err, data, stderr) {
                    if (!err) {
                        var file_name_arr = data.split("\n");
                        file_name_arr.splice(-1, 1)  // remove " " last element
                        var file_size_obj = {};
                        for (var i = 0; i < file_size_arr.length; i++) {

                            if (!file_name_arr[i].includes('\\')) {  // ignore file that has \ in filename because gridftp not support
                                file_size_obj[file_name_arr[i]] = file_size_arr[i].replace(file_name_arr[i], '')  // remove file name from string file size+filename
                            }


                        }

                        next(file_size_obj)
                    } else {
                        console.log('error', err)
                    }
                })
            } else {
                console.log('error', err)
            }
        }
    )
}

function deleteFile(file_path, filename, next) {
    cmd.get("rm -rf '" + file_path + filename + "'", function (err, data, stderr) {
      next(err)
    })
  }