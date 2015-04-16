'use strict';

let apps =
  {
    1: { name: 'dustdice',
         channels: [1,2]
       },
    2: { name: 'bustabit',
         channels: [3,4]
       }
  };

let channels =
  {
    1: { name: 'general', messages: [] },
    2: { name: 'support', messages: [] },
    3: { name: 'general', messages: [] },
    4: { name: 'support', messages: [] }
  };

export function *getChannel(appName, chanName) {

  let aid, app;
  found: for (;;) {
    for (aid in apps) {
      app = apps[aid];
      if (app.name === appName)
        break found;
    }
    throw 'APP_DOES_NOT_EXIST';
  }

  let cid, chan;
  found: for (;;) {
    for (cid of app.channels) {
      chan = channels[cid];
      if (chan.name === chanName)
        break found;
    }
    throw 'CHANNEL_DOES_NOT_EXIST';
  }

  return { cid: cid,
           aname: appName,
           cname: chanName
         };
}

export function *getMessages(cid) {
  return channels[cid] ? channels[cid].messages : [];
}
