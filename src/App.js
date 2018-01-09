import React, { Component } from 'react'
import firebase from 'firebase'

import NameInput from './components/name-input'
import Login from './components/login'

const password = process.env.REACT_APP_PASSWORD ||
  '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8' // sha256 for 'password'
const database = firebase.database()
const auth = firebase.auth()

class App extends Component {
  state = {
    loggedIn: false,
    ref: null,
    users: {}
  }

  componentDidMount () {
    const online = database.ref('users')
    online.on('value', (snapshot) => {
      this.setState({ users: snapshot.val() })
    })
  }

  updateUser = (name) => {
    const updates = {}
    updates['/users/' + this.state.ref.key] = name
    database.ref().update(updates)
  }

  onLogin = () => {
    auth.signInAnonymously()
    this.setState({
      loggedIn: true,
      ref: database.ref().child('users').push()
    })

    window.addEventListener('beforeunload', this.onLogout)
  }

  onLogout = () => {
    auth.signOut()
    this.state.ref.remove()
    this.setState({
      loggedIn: false,
      ref: null
    })

    window.removeEventListener('beforeunload', this.onLogout)
  }

  render() {
    let users = []
    for (const key in this.state.users) {
      users.push(<li key={key}>{this.state.users[key]}</li>)
    }

    return (
      <div>
        <h1>Who's in the office?</h1>

        { this.state.loggedIn &&
          <NameInput onUpdate={this.updateUser} />
        }

        <ul id="users">
          {users}
        </ul>

        { this.state.loggedIn ? (
          <button onClick={this.onLogout} id='logout'>Logout</button>
        ) : (
          <Login password={password} onLogin={this.onLogin} />
        )}
      </div>
    );
  }
}

export default App;
