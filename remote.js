var accessToken = '';
var accessManager = Twilio.AccessManager(accessToken);
var client = Twilio.Conversations.Client(accessManager);

function onInviteAccepted(conversation) {
  conversation.localMedia.attach('#local');

  conversation.on('participantConnected', function(participant) {
    participant.media.attach('#remote');
  });
}

client.inviteToConversation('sam').then(onInviteAccepted);
