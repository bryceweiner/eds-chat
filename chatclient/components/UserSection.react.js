'use strict';

var React     = require('react');
var Vault     = require('../constants/Vault.js');
var UserStore = require('../stores/UserStore');

function getStateFromStores() {
  return {
    user: UserStore.get()
  };
}

var UserSection = React.createClass({

  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function() {
    UserStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    UserStore.removeChangeListener(this._onChange);
  },

  render: function() {
    var user = this.state.user;
    var heading =
      // Fully logged in
      user.loggedIn ?
        (<h3 className="user-name">
           {"Logged in as " + user.name}
         </h3>) :
      // Not logged in yet, but we have a token hash.
      user.tokenHash ?
        (<h3 className="user-name">
           Logging in ...
         </h3>) :
      // Not logged in and no token hash.
        (<h3 className="user-name">
           <a href={Vault.AUTHORIZE_URL}>
             Log into MoneyPot
           </a>
         </h3>);
    return (
      <div className="user-section">
        {heading}
      </div>
    );
 ;
  },

  _onChange: function() {
    this.setState(getStateFromStores());
  }

});

module.exports = UserSection;
