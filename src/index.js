const express = require('express')
const path = require('path')
const UsersStore = require('./users')
const WebSocket = require('ws')

const app = express()
const password = process.argv[2]
const users = new UsersStore('users.json')

var WebSocketServer = require('ws').Server

app.use(express.static(path.join(__dirname, 'public')))
const wss = new WebSocket.Server({port: 40510})

app.use(express.static(path.join(__dirname, 'public')))
app.listen(80, function () {
  console.log('Server started. Password is: %s', password)
})

// Web Socket
// Verificar se a pass é correta
// Se sim enviar array de UsersStore
// Se nao enviar erro
wss.on('connection', function (ws) {
  var thisUser = ''
  //ws.isAlive = true
  ws.isAuthenticated = false
  //ws.on('pong', heartbeat)

  ws.on('message', (message) => {
    if (message === 'ping') {
      return
    } else if (message === 'LogMeOut') {
      ws.isAuthenticated = false
      users.remove(thisUser)
      return
    }
    let splitted = JSON.parse(message)
    let nickname = splitted[0]
    let passwordReceived = splitted[1]
    console.log(message)
    if (password !== passwordReceived) {
      return
    }
    console.log(nickname)
    ws.isAuthenticated = true
    thisUser = nickname
    users.add(nickname)
  })

  ws.on('close', function close () {
    ws.isAuthenticated = false
    users.remove(thisUser)
    console.log('disconnected')
  })

  users.on('change', () => {
    console.log('detected change1')
    if (ws.isAuthenticated) {
      ws.send(JSON.stringify(users.toArray()))
    }
  })
})

//function heartbeat () {
//  this.isAlive = true
//}

//const interval = setInterval(function ping () {
//  wss.clients.forEach(function each (ws) {
//    if (ws.isAlive === false) return ws.terminate()

//    ws.isAlive = false
//    ws.ping('', false, true)
//  })
//}, 30000)

// TODO: the idea!
// THis is the SERVER-SIDE part which is VERY small!
// For the FRONT-END, check ./public/app.js
// All of the HTML, CSS and FRONT-END JS will be static files.
// Here, you only need to implement one web socket (WS). This websocke
// must do the following:
//  - Process Authenthication
//  - If the pass is incorrect, then close the connection
//  - If the pass is correct, then keep the WS alive.
//  - Listen to changes on users (through "users.on('change', callback)")
//    and send them through the web socket.
//
// Please check this link: https://medium.com/factory-mind/websocket-node-js-express-step-by-step-using-typescript-725114ad5fe4
// They use TypeScript but it's basically the same thing. Hope you get the idea.
