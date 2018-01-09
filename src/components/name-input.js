import React from 'react'
import PropTypes from 'prop-types'

export default function NameInput (props) {
  const onUpdate = (event) => {
    if (event.key === 'Enter') {
      props.onUpdate(event.target.value)
      event.target.value = ''
    }
  }

  return (
    <input type='text'
      id='nickname'
      onKeyUp={onUpdate}
      placeholder="What's your name?" /> 
  )
}

NameInput.propTypes = {
  onUpdate: PropTypes.func.isRequired
}
