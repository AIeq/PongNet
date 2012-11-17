// if user is running mozilla then use it's built-in WebSocket
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