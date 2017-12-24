const bodyElement = document.querySelector('body')
const loginElement = document.querySelector('#login')
const passwordElement = document.querySelector('input[name="password"]')
const nicknameElement = document.querySelector('input[name="nickname"]')
const logoutElement = document.querySelector('#logout')
const usersElement = document.querySelector('#users')

const status = {
  loggedIn: 'LOGGED_IN',
  loggedOut: 'LOGGED_OUT',
  logout: 'LOGOUT',
  wrongPassword: 'WRONG_PWD'
}

var ws = new window.WebSocket(`ws://${window.location.host}/ws`)

ws.addEventListener('open', (event) => {
  ws.send('ping')
})

ws.addEventListener('message', (event) => {
  switch (event.data) {
    case status.loggedIn:
      bodyElement.classList.add('loggedIn')
      passwordElement.value = ''
      nicknameElement.value = ''
      break
    case status.loggedOut:
      bodyElement.classList.remove('loggedIn')
      break
    case status.wrongPassword:
      wrongPassword()
      break
    default:
      display(JSON.parse(event.data))
  }
})

window.onbeforeunload = (event) => {
  ws.close()
}

function wrongPassword () {
  passwordElement.classList.add('invalid')
  setTimeout(() => {
    passwordElement.classList.remove('invalid')
  }, 500)
}

function login (event) {
  event.preventDefault()

  const data = [
    nicknameElement.value,
    passwordElement.value
  ]

  ws.send(JSON.stringify(data))
}

function display (users) {
  usersElement.innerHTML = ''

  users.forEach(function (text) {
    const li = document.createElement('li')
    li.appendChild(document.createTextNode(text))
    usersElement.appendChild(li)
  })
}

function logout (event) {
  event.preventDefault()
  ws.send(status.logout)
}

document.addEventListener('DOMContentLoaded', () => {
  loginElement.addEventListener('submit', login)
  logoutElement.addEventListener('click', logout)
})
