const express = require('express')
const path = require('path')
const http = require('http')
const UsersStore = require('./users')
const WebSocket = require('ws')

const status = {
  loggedIn: 'LOGGED_IN',
  loggedOut: 'LOGGED_OUT',
  logout: 'LOGOUT',
  wrongPassword: 'WRONG_PWD'
}

const password = process.env.WHOSTHERE_PWD || 'default_password'
const users = new UsersStore('users.json')

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({
  server: server,
  path: '/ws'
})

app.use(express.static(path.join(__dirname, 'public')))

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

server.listen(process.env.WHOSTHERE_PORT || 8080, function () {
  console.log(`Server started on port ${server.address().port}.`)
})