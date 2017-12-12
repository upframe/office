var express = require ('express');
var bodyParser = require ('body-parser');
var app = express();
var fs = require('fs');

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.set('view engine', 'ejs');
app.use('/css', express.static('css'));

app.get('/', function(req, res){
  res.render('welcome');
});

app.post('/', urlencodedParser, function(req, res){
  //temos em req.body.password a password do POST
  //temos em req.body.nickname o nickname do utilizador

  //temos que verificar que a password está correta
  //vamos buscar ao ficheiro a password e apagamos espaços
  var passwordText = fs.readFileSync('thisisnotthepassword.txt', 'utf8').replace(/\s+/g, '');
  //com o body parser temos acesso ao POST na parte do body com o nome respetivo
  var passwordSubmitted = req.body.password;

  if (passwordText === passwordSubmitted) {
      //password is correct
      //
      //temos que mostrar a pagina de sucesso
      //acrescentar o utilizador à lista daqueles que aqui estão tambem
      //var team = JSON.parse(fs.readFileSync('team.json', req.body.nickname));
      //fs.appendFileSync('team.json', req.body.nickname);

      res.render('office', {nickname: req.body.nickname, users: ['ulisse', 'li'] });


  } else {
      //password is wrong :(
      res.render('welcome');
  }

});

app.listen(80);
