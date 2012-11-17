$(function () {
    "use strict";

    //helpers
var setObject = function(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

var getObject = function(key) {
    var value = localStorage.getItem(key);
    return value && JSON.parse(value);
}

    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        chatContent.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
                                    + 'support WebSockets.'} ));
        input.hide();
        newGame.attr('disabled', 'disabled');
        $('span').hide();
        
    } else {

        // open connection
        var connection = new WebSocket('ws://127.0.0.1:7175');


        /**
        * This method is optional. If the server wasn't able to respond to the
        * in 3 seconds then show some error message to notify the user that
        * something is wrong.
        */
        setInterval(function() {
            if (connection.readyState !== 1) {
                status.text('Error');
                input.attr('disabled', 'disabled').val('Unable to comminucate '
                                                     + 'with the WebSocket server.');
                newGame.attr('disabled', 'disabled');
            }
        }, 3000);
    }
    
    // for better performance - to avoid searching in DOM
    var chatContent = $('#chat');
    var games = $('#games');
    var input = $('#input');
    var newGame = $('#newGame');
    var status = $('#status');
    var nameField = $('#nameField');
 

    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false;

    connection.onopen = function () {
        // first we want users to enter their names
        input.removeAttr('disabled');
        newGame.attr('disabled', 'disabled');
        status.text('[Login] Enter name:');
    };

    connection.onerror = function (error) {
        // just in there were some problems with conenction...
        chatContent.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
                                    + 'connection or the server is down.</p>' } ));
    };

    // most important part - incoming messages
    connection.onmessage = function (message) {
        // try to parse JSON message. Because we know that the server always returns
        // JSON this should work without any problem but we should make sure that
        // the massage is not chunked or otherwise damaged.
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

        // NOTE: if you're not sure about the JSON structure
        // check the server source code above
        if (json.type === 'color') { // first response from the server with user's color
            myColor = json.data;
            status.text("");
            nameField.text(myName + ': ').css('color', myColor);
            input.removeAttr('disabled').focus();
            newGame.removeAttr('disabled');
            // from now user can start sending messages
        } else if (json.type === 'history') { // entire message history
            // insert every single message to the chat window
            for (var i=0; i < json.data.length; i++) {
                    var msg = json.data[i].text;
                    if(msg.indexOf("*") != 0){
                        addMessage(json.data[i].author, msg,
                                   json.data[i].color, new Date(json.data[i].time));
                    }
            }
        } else if (json.type === 'message') { // it's a single message
            input.removeAttr('disabled'); // let the user write another message
            newGame.removeAttr('disabled');
            var msg = json.data.text;
            var id = Math.floor((Math.random() * 65535))
            if(msg.indexOf("*") == 0){
                addGame(json.data.author, msg,
                json.data.color, id);
            }else{
                addMessage(json.data.author, msg,
                json.data.color, new Date(json.data.time));
            }
        } else {
            console.log('Hmm..., I\'ve never seen JSON like this: ', json);
        }
    };

    /**
* Send mesage when user presses Enter key
*/
    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) {
                return;
            }
            // send the message as an ordinary text
            connection.send(msg);
            $(this).val('');
            // disable the input field to make the user wait until server
            // sends back response
            input.attr('disabled', 'disabled');
            newGame.attr('disabled', 'disabled');

            // we know that the first message sent from a user their name
            if (myName === false) {
                myName = msg;
            }
        }
    });
    
    newGame.click(function(e) { 
            var msg = "*Game started";
            // send the message as an ordinary text
            connection.send(msg);
 
            // disable the input field to make the user wait until server
            // sends back response
            input.attr('disabled', 'disabled');
            newGame.attr('disabled', 'disabled');
 
    });
    

    /**
* Add message to the chat window
*/
    function addMessage(author, message, color, dt) {
        chatContent.append('<span><span style="color:' + color + '">' + author + '</span> '
             + ': ' + message + '<br/></span>');
 
        while(chatContent.children().length > 10) chatContent.children("span:first").remove();
           
    }
    
   /** Add game  */
    function addGame(author, message, color, id) {
        
        localStorage.setItem("name", author);
        games.append('<span>Pong Game with <span style="color:' + color + '">' + author + '</span> '
             + ' <input TYPE="button" style="width: 8em;"  VALUE="Join now" onClick="join('+id+')"> <br/></span>');
 
        while(games.children().length > 5) games.children("span:first").remove();
           
    }
    
    
});

    function join(id){
            var newUrl = "Client.html?id=" + id;
            window.location.replace(newUrl);
        }
        