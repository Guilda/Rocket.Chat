/* globals msgStream */
Meteor.methods({
	setCuration(curation, messageId) {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'setCuration' });
		}

		let message = RocketChat.models.Messages.findOneById(messageId);

		let room = Meteor.call('canAccessRoom', message.rid, Meteor.userId());

		if (!room) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'setCuration' });
		}

		const user = Meteor.user();

		if (Array.isArray(room.muted) && room.muted.indexOf(user.username) !== -1) {
			RocketChat.Notifications.notifyUser(Meteor.userId(), 'message', {
				_id: Random.id(),
				rid: room._id,
				ts: new Date(),
				msg: TAPi18n.__('You_have_been_muted', {}, user.language)
			});
			return false;
		} else if (Array.isArray(room.usernames) && room.usernames.indexOf(user.username) === -1) {
			return false;
		}

		if (message.curations && message.curations[curation] && message.curations[curation].usernames.indexOf(user.username) !== -1) {
			message.curations[curation].usernames.splice(message.curations[curation].usernames.indexOf(user.username), 1);

			if (message.curations[curation].usernames.length === 0) {
				delete message.curations[curation];
			}

			if (_.isEmpty(message.curations)) {
				delete message.curations;
				RocketChat.models.Messages.unsetCurations(messageId);
			} else {
				RocketChat.models.Messages.setCurations(messageId, message.curations);
			}
		} else {
			if (!message.curations) {
				message.curations = {};
			}
			if (!message.curations[curation]) {
				message.curations[curation] = {
					usernames: []
				};
			}
			message.curations[curation].usernames.push(user.username);

			RocketChat.models.Messages.setCurations(messageId, message.curations);
		}

		msgStream.emit(message.rid, message);

		return;
	}
});
