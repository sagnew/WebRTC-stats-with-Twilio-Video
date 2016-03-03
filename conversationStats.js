var accessToken = '';
var accessManager = Twilio.AccessManager(accessToken);
var client = Twilio.Conversations.Client(accessManager);

function handleConversationStats(conversation) {
  var dialog = conversation._dialogs.values().next().value;
  var peerConnection = dialog.session.mediaHandler.peerConnection;
  var selector = null;
  var packets = 0;

  setInterval(function() {
    Works in FireFox
    peerConnection.getStats(selector, function(report) {
      for(var i in report) {
        var currentReport = report[i];
        if(currentReport.type === 'outboundrtp') {
          console.log(currentReport);
          packets += currentReport.packetsSent;
        }
      }
      console.log('Number of packets sent so far: ' + packets);
    }, function(error) {
      console.log('Oh no I messed up: ' + error);
    });

    // Doesn't work in Chrome yet
    // peerConnection.getStats(function(report) {
    //   console.log(report);
    //   for(var i in report) {
    //     var currentReport = report[i];
    //     if(currentReport.type === 'outboundrtp') {
    //       console.log(currentReport);
    //       packets += currentReport.packetsSent;
    //     }
    //   }
    //   console.log('Number of packets sent so far: ' + packets);
    // }, selector, function(error) {
    //   console.log('Oh no I messed up: ' + error);
    // });
  }, 5000);
}

function standardizeReport(report) {
  // Implement this next.
}

function onInviteAccepted(conversation) {
  conversation.localMedia.attach('#local');

  conversation.on('participantConnected', function(participant) {
    participant.media.attach('#remote');

    handleConversationStats(conversation);
  });
}

client.listen().then(function () {
  client.on('invite', function(invite) {
    invite.accept().then(onInviteAccepted);
  });
});

console.log('Hello Keeyon, s_haha_n, Niko, Gutomaia jer_dude, NichtBela and sir_majestic');
console.log('Also hello to Devin, Brent, Manny and Mheetu');
console.log('zykO rules and Trohnics is my pizza brother');
