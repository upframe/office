const fs = require('fs')
const EventEmitter = require('events')

class UsersStore extends EventEmitter {
  constructor (path) {
    super()
    this.path = path
    this.store = []

    if (fs.existsSync(path)) {
      this._read()
    } else {
      this._write()
    }
  }

  _read () {
    this.store = JSON.parse(fs.readFileSync(this.path))
  }

  _write () {
    this.emit('change', this.store)
    fs.writeFileSync(this.path, JSON.stringify(this.store))
  }

  add (user) {
    let index = this.store.indexOf(user)
    if (index === -1) {
      this.store.push(user)
      this._write()
    }
  }

  remove (user) {
    let index = this.store.indexOf(user)
    if (index !== -1) {
      this.store.splice(index, 1)
      this._write()
    }
  }

  exists (user) {
    return this.store.indexOf(user) !== -1
  }

  toArray () {
    return this.store
  }
}

module.exports = UsersStore
