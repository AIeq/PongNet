"use strict";
process.title = 'PongNet';
 
var serverSocket = 7175;
var defaultFile = "Lobby.html";
// latest 100 messages
var history = [ ];
// list of currently connected clients (users)
var clients = [ ];
var webSocketServer = require('websocket').server,
    http = require('http'),
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
/**
* HTTP server
*/

var server = http.createServer(function(req, res) {
    try
    {
        if ( req.url == '/status') {
            res.writeHead(200, {'Content-Type': 'application/json'});
            var responseObject = {
                currentClients: clients.length,
                totalHistory: history.length
            }
            res.end(JSON.stringify(responseObject));
        } 
        
        
        var uri = url.parse(req.url).pathname;
        
        
        
        if(uri == "/") {
            uri += defaultFile;
        }
        var filename = path.join(process.cwd(), "../client/" + uri);

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
        res.write('505 - Internal Server Error\n');
        res.end();
        return;
    }   
});
 
server.listen(serverSocket, function() {
    console.log((new Date()) + " Server is now running at http://127.0.0.1:" +serverSocket+"/" );
});

/**
* WebSocket server
*/



/**
* Helper function for escaping input strings
*/
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Array with some colors
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
// ... in random order
colors.sort(function(a,b) { return Math.random() > 0.5; } );

var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin);
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
    var userName = false;
    var userColor = false;

    console.log((new Date()) + ' Connection accepted.');

    // send back chat history
    if (history.length > 0) {
        connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
    }

    // user sent some message
    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
            if (userName === false) { // first message sent by user is their name
                // remember user name
                userName = htmlEntities(message.utf8Data);
                // get random color and send it back to the user
                userColor = colors.shift();
                connection.sendUTF(JSON.stringify({ type:'color', data: userColor }));
                console.log((new Date()) + ' User is known as: ' + userName
                            + ' with ' + userColor + ' color.');

            } else { // log and broadcast the message
                console.log((new Date()) + ' Received Message from '
                            + userName + ': ' + message.utf8Data);
                
                // we want to keep history of all sent messages
                var obj = {
                    time: (new Date()).getTime(),
                    text: htmlEntities(message.utf8Data),
                    author: userName,
                    color: userColor
                };
                history.push(obj);
                history = history.slice(-100);

                // broadcast message to all connected clients
                var json = JSON.stringify({ type:'message', data: obj });
                for (var i=0; i < clients.length; i++) {
                    clients[i].sendUTF(json);
                }
            }
        }
    });

    // user disconnected
    connection.on('close', function(connection) {
        if (userName !== false && userColor !== false) {
            console.log((new Date()) + " Peer "
                + connection.remoteAddress + " disconnected.");
            // remove user from the list of connected clients
            clients.splice(index, 1);
            // push back user's color to be reused by another user
            colors.push(userColor);
        }
    });

});
