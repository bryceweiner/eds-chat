'use strict';

var ClientAction = require('../actions/ClientAction');
var React        = require('react');
var cx           = require('classnames');

var ReactPropTypes = React.PropTypes;

var ChannelLeaveButton = React.createClass({

  propTypes: {
    channel:          ReactPropTypes.object
  },

  render: function() {
    var channel     = this.props.channel;
    return (
      <div
        className="channel-leave-button"
        onClick={this._onClick}
      >X</div>
    );
  },

  _onClick: function() {
    ClientAction.leaveChannel(this.props.channel.cid);
  }

});

var ChannelListItem = React.createClass({

  propTypes: {
    channel:          ReactPropTypes.object,
    currentChannelId: ReactPropTypes.number
  },

  render: function() {
    var channel     = this.props.channel;
    var unreadCount = channel.unreadCount;
    return (
      <li className={cx({
          'channel-list-item': true,
          'active': channel.cid === this.props.currentChannelId
          })}>
        <h5 className="channel-name" onClick={this._onClick}>
          {channel.name + ' (' + unreadCount +')'}
        </h5>
        <ChannelLeaveButton
          channel={channel}
        />
      </li>
    );
  },

  _onClick: function() {
    ClientAction.clickChannel(this.props.channel.cid);
  }

});

module.exports = ChannelListItem;
