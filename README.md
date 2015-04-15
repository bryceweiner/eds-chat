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

Use `socket.io` to connect to `http://chat.moneypot.com/` (Note: No sensitive information flows over this insecure connection)


To authenticate:
--------

    socket.emit('auth', tokenHash, callback)

Where `tokenHash` is the `sha256` of the apps access token. `callback` is called with `(err, info)` after authenticating. You can not send messages unless you have successfully authenticated.


Sending messages:
---------

    socket.emit('message', { cid: '#ChannelName', text: 'hai' });

Receiving messages:
-----------

    socket.on('message', function(obj) {
        console.log('Channel Name: ', obj.cid,
        'Sent by: ', obj.user,
        'Sent at: ', obj.time,
        'With the text: ', obj.text);
    });
