var serverSocket = 7175;

var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs');
    
var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"};

var server = http.createServer(function(req, res) {
    try
    {
        var uri = url.parse(req.url).pathname;
        if(uri == "/") {
            uri = "/Client.html";
        }
        var filename = path.join(process.cwd(), uri);

        fs.exists(filename, function(exists) {
         
            if(!exists) {
                console.log("not found: " + filename);
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.write('404 Not Found\n');
                res.end();
                return;
            }
            var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
            res.writeHead(200, {'Content-Type':mimeType});

            var fileStream = fs.createReadStream(filename);
            fileStream.pipe(res);
      

        }); //end path.exists
    }
    catch(err)
    {
        console.log("Fatal error: " + err);
        res.writeHead(505, {'Content-Type': 'text/plain'});
        res.write('505 Internal server Error\n');
        res.end();
        return;
    }   
});
server.listen(serverSocket);
console.log('Server running at http://127.0.0.1:'+serverSocket+'/');