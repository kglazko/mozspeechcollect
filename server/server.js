var fs = require('fs');
var http = require('http');
// Serve client side statically
var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);

// Start Binary.js server
var BinaryServer = require('binaryjs').BinaryServer;
var bs = BinaryServer({server: server});

// Wait for new user connections
bs.on('connection', function(client){
  // Incoming stream from browsers
  client.on('stream', function(stream, meta){
  	if ( meta.name != "next" ){
	    var file = fs.createWriteStream(__dirname+ '/public/' + meta.name);
	    stream.pipe(file);
	} else {
			fs.readdir(process.cwd() + '/public/', function (err, files) {
			  if (err) {
			    console.log(err);
			    return;
			  }
			  var hasfiles = false;
			  for (var i = 0; i < files.length; i++){
			  	if (files[i].indexOf(".opus") > -1) {
			  		var path = files[i].replace(".opus",".txt");
			  		var filename = files[i];

			  		if (!fs.existsSync(__dirname+ '/public/' + path)){
				  			console.log("not exists: " + __dirname+ '/public/' + path);
				  			console.log("send next" + filename);
				  			stream.write({next: filename, n: "ok"});
				  			hasfiles = true;
			  		}
			  	}
			  }
			  if (!hasfiles){
				console.log("send nok too" + hasfiles);
  				stream.write({n: "nok"});
  			  }
			});
		}
  });
});

server.listen(9000);
console.log('HTTP and BinaryJS server started on port 9000');