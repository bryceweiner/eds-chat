'use strict';

var React              = require('react');
var ChannelListItem    = require('../components/ChannelListItem.react');

var MessageStore       = require('../stores/MessageStore');
var ChannelStore       = require('../stores/ChannelStore');

function getStateFromStores() {
  return {
    channels: ChannelStore.getAllSorted(),
    currentChannelId: ChannelStore.getCurrentId()
  };
}

var ChannelSection = React.createClass({

  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function() {
    ChannelStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    ChannelStore.removeChangeListener(this._onChange);
  },

  render: function() {
    var channelListItems = this.state.channels.map(function(channel) {
      return (
        <ChannelListItem
          key={channel.cid}
          channel={channel}
          currentChannelId={this.state.currentChannelId}
        />
      );
    }, this);
    return (
      <div className="channel-section">
        <ul className="channel-list">
          {channelListItems}
          </ul>
      </div>
    );
  },

  _onChange: function() {
    this.setState(getStateFromStores());
  }

});

module.exports = ChannelSection;
