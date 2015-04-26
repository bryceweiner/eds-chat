MoneyPot Chat Server
====================

Development instructions:

Create .env with

    app_id=13
    app_secret=a1e36aa4-3d55-4d15-a5bf-186c1b817903

Then install node dependencies

    npm install
    npm run start-dev

Now browse to `localhost:3000`

to rebuild the client-side javascript, run:

    npm run postinstall

or for a watch mode:  `npm run watchify`

----

Chat API information:
=================

Use `socket.io` to connect to `http://chat.moneypot.com/` (Note: No sensitive
information flows over this insecure connection)

Error handling:
--------

All callbacks given to events are called with the common practice
for handling errors `cb(err, args..)`. For other events that do not
return data to the client, but may still fail the server sends
a separate `err` event.

    socket.on('err', function(err) {
        console.log('Error code', err.code);
        console.log('Error message', err.message);
    }

In both cases the given error object will have two fields, `code` and `message`
indicating what went wrong on how the API call is correctly used.

To authenticate:
--------

    socket.emit('auth', tokenHash, callback)
    socket.emit('auth', {"token_hash": tokenHash}, callback)

Where `tokenHash` is the `sha256` of the apps access token. `callback` is called
with `(err, info)` after authenticating. You can not send messages unless you
have successfully authenticated.

Joining channels:
--------------------

To join a channel you need to provide the global MoneyPot application id
and the name of a

    socket.emit('join_channel', {"aid": appId, "chan": channelName},
        function(err, info) {
            if (err) {
                console.log('Error code', err.code);
                console.log('Error message', err.message);
            } else {
                console.log('Channel id', info.cid);
                console.log('History', info.history);
                console.log('User count', info.num_users);
            }
        });

Here `appId` is the global MoneyPot of the app and `channelName` is an existing
sub-channel for the given app. The callback is called with `(err, info)`. The
`info` object carries information about the channel, which at the moment is the
channel id `cid`, the number of users currently joined in the channel
`num_users` and an array `history` of previous chat messages . The channel id
`cid` will be used for all following communication such as sending a message to
the channel or leaving it.

Subsequent `channel_info` events will update information about the channel.

    socket.on('channel_info', function(info) {
        console.log(
            'Channel id:', info.cid,
            'User count:', info.num_users
        );
    });

In the future the `info` object for both, the `join_channel` callback and the
`channel_info`, will include further information, such as the names of people in
the channel and their roles.

Leaving channels:
---------

    socket.emit('leave_channel', { cid: channelId });


Sending messages:
---------

    socket.emit('message', { cid: channelId, text: chatMessage });

Receiving messages:
-----------

    socket.on('message', function(obj) {
        console.log(
            'Channel id: ', obj.cid,
            'Message id: ', obj.mid,
            'Sent by: ', obj.user,
            'Sent at: ', obj.time,
            'With the text: ', obj.text);
    });
