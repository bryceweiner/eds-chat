'use strict';

var ClientAction = require('../actions/ClientAction');
var React        = require('react');
var cx           = require('classnames');

var ReactPropTypes = React.PropTypes;

var ChannelListItem = React.createClass({

  propTypes: {
    channel:          ReactPropTypes.object,
    currentChannelId: ReactPropTypes.number
  },

  render: function() {
    var channel     = this.props.channel;
    var unreadCount = channel.unreadCount;
    return (
      <li
        className={cx({
          'channel-list-item': true,
          'active': channel.cid === this.props.currentChannelId
        })}
        onClick={this._onClick}>
        <h5 className="channel-name">{channel.name}</h5>
        <div className="channel-unread">
          ({unreadCount})
        </div>
      </li>
    );
  },

  _onClick: function() {
    ClientAction.clickChannel(this.props.channel.cid);
  }

});

module.exports = ChannelListItem;
