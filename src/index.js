const express = require('express')
const path = require('path')
const UsersStore = require('./users')
const WebSocket = require('ws')

const app = express()
const password = process.argv[2]
const users = new UsersStore('users.json')

const status = {
  loggedIn: 'LOGGED_IN',
  loggedOut: 'LOGGED_OUT',
  logout: 'LOGOUT',
  wrongPassword: 'WRONG_PWD'
}

app.use(express.static(path.join(__dirname, 'public')))
const wss = new WebSocket.Server({port: 40510})

app.use(express.static(path.join(__dirname, 'public')))
app.listen(8080, function () {
  console.log('Server started. Password is: %s', password)
})

function login (ws, message) {
  try {
    const data = JSON.parse(message)
    const nickname = data[0]
    const passwordReceived = data[1]

    if (password !== passwordReceived) {
      ws.send(status.wrongPassword)
      return
    }

    users.add(nickname)
    ws.user = nickname
    ws.send(status.loggedIn)
  } catch (e) {
    console.log(e)
  }
}

function logout (ws) {
  users.remove(ws.user)
  ws.user = ''
  ws.send(status.loggedOut)
}

// Web Socket
// Verificar se a pass é correta
// Se sim enviar array de UsersStore
// Se nao enviar erro
wss.on('connection', function (ws) {
  ws.user = ''

  const send = () => {
    ws.send(JSON.stringify(users.toArray()))
  }

  ws.on('message', (message) => {
    if (message === 'ping') {
      return
    } else if (message === status.logout) {
      return logout(ws)
    }

    login(ws, message)
  })

  ws.on('close', function close () {
    users.removeListener('change', send)
    users.remove(ws.user)
    ws.user = ''
  })

  users.on('change', send)
  send()
})
