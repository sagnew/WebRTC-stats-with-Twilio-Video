var accessToken = '';
var accessManager = Twilio.AccessManager(accessToken);
var client = Twilio.Conversations.Client(accessManager);

function handleConversationStats(conversation) {
  console.log('Finish this next');
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
