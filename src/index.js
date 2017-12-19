const express = require('express')
const path = require('path')
const UsersStore = require('./users')

const app = express()
const password = process.argv[2]
const users = new UsersStore('users.json')

var WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({port: 40510})

app.use(express.static(path.join(__dirname, 'public')))
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
  console.log('We just received a request for index.html')
})
app.listen(80, function () {
  console.log('All systems are up and listening on port 80')
  console.log('Password is: %s', password)
})

// Web Socket
// Verificar se a pass é correta
// Se sim enviar array de UsersStore
// Se nao enviar erro
wss.on('connection', function (ws) {
  ws.isAlive = true
  ws.on('pong', heartbeat)

  ws.on('message', function (message) {
    var nicknameReceived = message.split('[UpframeRules]')[0]
    var passwordReceived = message.split('[UpframeRules]')[1]
    if (passwordReceived === password) {
      console.log('received: %s', message)
      if (!users.exists(nicknameReceived)) {
        users.add(nicknameReceived)
      }
    } else {
      ws.terminate()
    }
  })

  users.on('change', function () {
    ws.send(users.toArray())
  })
})

function heartbeat () {
  this.isAlive = true
}

const interval = setInterval(function ping () {
  wss.clients.forEach(function each (ws) {
    if (ws.isAlive === false) return ws.terminate()

    ws.isAlive = false
    ws.ping('', false, true)
  })
}, 30000)

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

/*
app.get('/', function (req, res) {
  res.render('welcome', {
    nickTried: '',
    passTried: '',
    message: ''
  })
})

app.post('/', urlencodedParser, function (req, res) {
  if (password === req.body.password) {
    users.add(req.body.nickname)

    res.render('office', {
      nickname: req.body.nickname,
      users: users.toArray()
    })
  } else {
    res.render('welcome', {
      nickTried: req.body.nickname,
      passTried: req.body.password,
      message: 'Wrong password'
    })
  }
}) */
