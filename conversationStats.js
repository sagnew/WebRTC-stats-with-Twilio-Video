var accessToken = '';
var accessManager = Twilio.AccessManager(accessToken);
var client = Twilio.Conversations.Client(accessManager);

// Firefox implements the getStats spec more closely than Chrome does.
// In Chrome, the object passed to the success cb is structured differently.
function standardizeReport(response) {
  if (navigator.mozGetUserMedia) {
    return response;
  }

  var standardReport = {};
  response.result().forEach(function(report) {
    var standardStats = {
      id: report.id,
      type: report.type
    };
    report.names().forEach(function(name) {
      standardStats[name] = report.stat(name);
    });
    standardReport[standardStats.id] = standardStats;
  });

  return standardReport;
}

// This function wraps the getStats API and returns the correct usage
// for whichever browser the developer is using.
function getStats(pc, selector, successCb, failureCb) {
  if (navigator.mozGetUserMedia) {
    // This means we are using Firefox
    // getStats takes args in different order in Chrome and Firefox
    return pc.getStats(selector, successCb, failureCb);
  } else {
    // In Chrome, the first two arguments are reversed.
    return pc.getStats(successCb, selector, failureCb);
  }
}

// Takes a Twilio Video conversation and retrieves stats on it.
function handleConversationStats(conversation) {
  var dialog = conversation._dialogs.values().next().value;
  var peerConnection = dialog.session.mediaHandler.peerConnection;

  // var selector = peerConnection.getRemoteStreams()[0].getAudioTracks()[0];
  var selector = null;

  // ... wait a bit
  var aBit = 1000; // in milliseconds
  setTimeout(function() {
    getStats(peerConnection, selector, handleStatsReport, logError);
  }, aBit);
}

// Success callback passed to getStats()
function handleStatsReport(response) {
  var rttMeasures = [];

  report = standardizeReport(response);
  console.log(report);

  // "outboundrtp" type for firefox and "ssrc" type for Chrome with packetsSent
  // googRtt for chrome or mozRtt for firefox to get round trip time.
  if (navigator.mozGetUserMedia) {
    // User is using firefox
    for (var i in report) {
      var currentReport  = report[i];
      if (currentReport.type == "outboundrtp") {
        console.log(currentReport);
        rttMeasures.push(currentReport.mozRtt);
      }
    }
  } else {
    for (var i in report) {
      var currentReport  = report[i];
      if (currentReport.type == "ssrc" && currentReport.packetsSent) {
        console.log(currentReport);
        rttMeasures.push(currentReport.googRtt);
      }
    }
  }

  var avgRtt = average(rttMeasures);

  // this is a very simple emodel and does not take
  // packetization time, or inter-frame delay metrics into account.
  // You may calculate the e-value at each sample or at the end of the call.
  console.log(avgRtt);

  var emodel = 0;
  if (avgRtt/2 >= 500)
    emodel = 1;
  else if (avgRtt/2 >= 400)
    emodel = 2;
  else if (avgRtt/2 >= 300)
    emodel = 3;
  else if (avgRtt/2 >= 200)
    emodel = 4;
  else if (avgRtt/2 < 200)
    emodel = 5;

  console.log ("e-model: " + emodel);
}

// Logs errors passed to getStats()
function logError(error) {
  log(error.name + ": " + error.message);
}

// Averages the round trip times taken from getStats()
function average(values) {
  var sumValues = values.reduce(function(sum, value){
    value = parseInt(value, 10);
    return sum + value;
  }, 0);
  console.log(sumValues);
  return (sumValues / values.length);
}

// Begin listening for invites to Twilio Video conversations.
client.listen().then(() => {
  client.on('invite', invite => {
    invite.accept().then(conversation => {
      conversation.localMedia.attach('#local');

      conversation.on('participantConnected', participant => {
        peerParticipant = participant;
        participant.media.attach('#remote');

        handleConversationStats(conversation);
      });
    });
  });
});
