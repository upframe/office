var ws = new window.WebSocket('ws://localhost:40510')

ws.addEventListener('open', (event) => {
  ws.send('ping')
})

ws.addEventListener('message', (event) => {
  // recebe os utilizadores e mostra
  var received = JSON.parse(event.data)
  display(received)
  //received.forEach(function (entry) {
  //  console.log(entry)
  //  function1(entry)
  //})
})

window.onbeforeunload = (event) => {
  ws.close()
}
// ---------

function onLogin () {
    var loginArray = [document.getElementById('nickname').value, document.getElementById('password').value]
    ws.send(JSON.stringify(loginArray))
}

function display(users) {
  hideLoggin()
  var ul = document.getElementById("list");
  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }
  users.forEach(function (text) {
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(text));
    ul.appendChild(li);
  })
}

function hideLoggin() {
    var x = document.getElementById("form")
    x.style.display = "none"
    var y = document.getElementById("list")
    y.style.display = "block"
    var z = document.getElementById("logout")
    z.style.display = "block"
}

function showLogin() {
  var x = document.getElementById("form")
  x.style.display = "block"
  var y = document.getElementById("list")
  y.style.display = "none"
  var z = document.getElementById("logout")
  z.style.display = "none"
  ws.close()
}

//var x = document.getElementById("myDIV");
//if (x.style.display === "none") {
//    x.style.display = "block";
//} else {
//    x.style.display = "none";
//}
// TODO: the idea!
// THis is the FRONT-ENDE part.
// Here, you must:
//  - Manipulate the DOM to show/hide the elements you want or don't want when the user is logged in
//    or logged out.
//  - Connect to the Web Socket (created on index.js) and do the auth through the web socket. If it's correct
//    show the users and such. otherwhise, just tell the user the pass is incorrect.
