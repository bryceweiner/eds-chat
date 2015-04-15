'use strict';

var React           = require('react');

var MessageComposer = require('./MessageComposer.react');
var MessageListItem = require('./MessageListItem.react');
var MessageStore    = require('../stores/MessageStore');
var ChannelStore    = require('../stores/ChannelStore');

function getStateFromStores() {
  return {
    messages: MessageStore.getAllForCurrentChannel(),
    channel: ChannelStore.getCurrent()
  };
}

function getMessageListItem(message) {
  return (
    <MessageListItem
      key={message.id}
      message={message}
    />
  );
}

var MessageSection = React.createClass({

  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function() {
    this._scrollToBottom();
    MessageStore.addChangeListener(this._onChange);
    ChannelStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    MessageStore.removeChangeListener(this._onChange);
    ChannelStore.removeChangeListener(this._onChange);
  },

  render: function() {
    var messageListItems = this.state.messages.map(getMessageListItem);
    return (
      <div className="message-section">
        <h3 className="message-list-heading">{this.state.channel.id}</h3>
        <ul className="message-list" ref="messageList">
          {messageListItems}
        </ul>
        <div><MessageComposer channelId={this.state.channel.id}/></div>
      </div>
    );
  },

  componentDidUpdate: function() {
    this._scrollToBottom();
  },

  _scrollToBottom: function() {
    var ul = this.refs.messageList.getDOMNode();
    ul.scrollTop = ul.scrollHeight;
  },

  _onChange: function() {
    this.setState(getStateFromStores());
  }

});

module.exports = MessageSection;
