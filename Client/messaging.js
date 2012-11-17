window.WebSocket = window.WebSocket || window.MozWebSocket;
if (!window.WebSocket) {
    alert("fail"); 
} else {
    // open connection
    var connection = new WebSocket('ws://127.0.0.1:7175');

    setInterval(function() {
        if (connection.readyState !== 1) {
            alert("Connection lost"); 
        }
    }, 3000);
}

function sendCommand(values){

    var msg = JSON.stringify(values);
    connection.send("+" + msg);

}