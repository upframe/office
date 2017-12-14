var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var fs = require('fs')
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var password = process.argv[2]

function userIsLoggedIn (user) {
  return fs.readFileSync('users.txt').toString().split("\n").includes(user)
}

function usersFileExists () {
  return fs.existsSync('users.txt')
}

app.set('view engine', 'ejs')
app.use('/css', express.static('css'))

app.get('/', function (req, res) {
  res.render('welcome', { nickTried: '', passTried: '', message: '' })
});

app.post('/', urlencodedParser, function (req, res) {
  var utilizadoresOnline = []
  if ( password === req.body.password ) {
    if ( !usersFileExists() ) {
      fs.writeFileSync('users.txt', '')
    }
    if ( userIsLoggedIn(req.body.nickname) ) {
      //nao precisamos por nada em disco
      utilizadoresOnline = fs.readFileSync('users.txt').toString().split("\n")
    } else {
      //precisamos de adicionar o user a lista
      utilizadoresOnline = fs.readFileSync('users.txt').toString().split("\n").push(req.body.nickname)
      fs.unlinkSync('users.txt')
      for (var i = 0, len = utilizadoresOnline.length; i < len; i++) {
        fs.appendFileSync('users.txt', utilizadoresOnline[i])
      }
    }
    res.render('office', { nickname: req.body.nickname, users: utilizadoresOnline })
  } else {
    res.render('welcome', { nickTried: req.body.nickname, passTried: req.body.password, message: 'Wrong password' })
  }
})

app.listen(80)
