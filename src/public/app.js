var ws = new WebSocket('ws://localhost:40510');

function sendData () {
  var toSubmitNickname = document.getElementById("nickname").value
  var toSubmitPassword = document.getElementById("password").value
  ws.send(toSubmitNickname + "[UpframeRules]" + toSubmitPassword);
}

// TODO: the idea!
// THis is the FRONT-ENDE part.
// Here, you must:
//  - Manipulate the DOM to show/hide the elements you want or don't want when the user is logged in
//    or logged out.
//  - Connect to the Web Socket (created on index.js) and do the auth through the web socket. If it's correct
//    show the users and such. otherwhise, just tell the user the pass is incorrect.
