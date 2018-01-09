import React, { Component } from 'react'
import PropTypes from 'prop-types'

import sha256 from '../utils/sha256'

export default class Login extends Component {
  static propTypes = {
    password: PropTypes.string.isRequired,
    onLogin: PropTypes.func.isRequired
  }

  state = {
    wrong: false,
    password: null
  }

  showWrong = () => {
    this.setState({ wrong: true })
    setTimeout(() => {
      this.setState({ wrong: false })
    }, 500)
  }

  handleChange = (event) => {
    this.setState({password: event.target.value})
  }

  handleSubmit = (event) => {
    event.preventDefault()

    sha256(this.state.password).then((hash) => {
      if (hash.toLowerCase() === this.props.password) {
        this.props.onLogin()
      } else {
        this.showWrong()
      }
    })
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit} id="login">
        <input type="password"
          className={ this.state.wrong ? 'invalid' : '' }
          value={this.state.value}
          onChange={this.handleChange}
          placeholder="Password" />
        <input type="submit" value="Login"/>
      </form>
    )
  }
}
