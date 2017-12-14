const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const UsersStore = require('./users')

const app = express()
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const password = process.argv[2]
const users = new UsersStore('users.json')

app.use(express.static(path.join(__dirname, 'public')))

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

app.listen(80)
