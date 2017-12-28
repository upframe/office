const bodyElement = document.querySelector('body')
const loginElement = document.querySelector('#login')
const passwordElement = document.querySelector('input[name="password"]')
const nicknameElement = document.querySelector('#nickname')
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

// Everytime we get a message it can either be a logged in event, a logged out event,
// a wrong password event or the users collection as a string
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

// If the user closes the page we have to warn our server that a user has disconnected
window.onbeforeunload = (event) => {
  ws.close()
}

// Wrong password sent
function wrongPassword () {
  passwordElement.classList.add('invalid')
  setTimeout(() => {
    passwordElement.classList.remove('invalid')
  }, 500)
}

// Sends login information
function login (event) {
  event.preventDefault()
  ws.send(passwordElement.value)
}

// Display the users from an array
function display (users) {
  usersElement.innerHTML = ''
  // For each user in the array we create a new li element to display it
  users.forEach(function (text) {
    const li = document.createElement('li')
    li.appendChild(document.createTextNode(text))
    usersElement.appendChild(li)
  })
}

// Send logout warning
function logout (event) {
  event.preventDefault()
  ws.send(status.logout)
}

function submitNick (event) {
  if (event.keyCode === 13) {
    ws.send(nicknameElement.value)
    nicknameElement.value = ''
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loginElement.addEventListener('submit', login)
  logoutElement.addEventListener('click', logout)
  nicknameElement.addEventListener('keyup', submitNick)
})
