var accessToken = '';
var accessManager = Twilio.AccessManager(accessToken);
var client = Twilio.Conversations.Client(accessManager);

function handleConversationStats(conversation) {
  var dialog = conversation._dialogs.values().next().value;
  var peerConnection = dialog.session.mediaHandler.peerConnection;
  var selector = null;
  var packets = 0;

  setInterval(function() {
    // Works in FireFox
    // peerConnection.getStats(selector, function(report) {
    //   for(var i in report) {
    //     var currentReport = report[i];
    //     if(currentReport.type === 'outboundrtp') {
    //       console.log(currentReport);
    //       packets += currentReport.packetsSent;
    //     }
    //   }
    //   console.log('Number of packets sent so far: ' + packets);
    // }, function(error) {
    //   console.log('Oh no I messed up: ' + error);
    // });

    // Works in Chrome
    peerConnection.getStats(function(report) {
      report = standardizeReport(report);
      console.log(report);

      for(var i in report) {
        var currentReport = report[i];
        if(currentReport.type === 'ssrc' && currentReport.packetsSent) {
          console.log(currentReport);
          packets += parseInt(currentReport.packetsSent, 10);
        }
      }
      console.log('Number of packets sent so far: ' + packets);
    }, selector, function(error) {
      console.log('Oh no I messed up: ' + error);
    });
  }, 5000);
}

function standardizeReport(response) {
  if(navigator.mozGetUserMedia) {
    return response;
  }

  var standardReport = {};
  response.result().forEach(function(report) {
    var standardStats = {
      id: report.id,
      type: report.type,
    };
    report.names().forEach(function(name) {
      standardStats[name] = report.stat(name);
    });
    standardReport[standardStats.id] = standardStats;
  });

  return standardReport;
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
