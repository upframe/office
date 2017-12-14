const express = require('express')
const bodyParser = require('body-parser')
const UsersStore = require('./users')

const app = express()
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const password = process.argv[2]
const users = new UsersStore('users.json')

app.set('view engine', 'ejs')
app.use('/css', express.static('css'))

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
})

app.listen(80)
