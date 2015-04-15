'use strict';

const React = require('react');
const ReactPropTypes = React.PropTypes;

const MessageListItem = React.createClass({

  propTypes: {
    message: ReactPropTypes.object
  },

  render: function() {
    var message = this.props.message;
    return (
      <li className="message-list-item">
        <span className="message-time">{message.date.toLocaleTimeString()}</span>
        <span className="message-author-name">{message.username}:</span>
        <span className="message-text">{message.text}</span>
      </li>
    );
  }

});

module.exports = MessageListItem;
