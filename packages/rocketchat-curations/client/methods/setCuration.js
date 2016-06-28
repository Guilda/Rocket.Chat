Meteor.methods({
	setCuration(curation, messageId) {
		if (!Meteor.userId()) {
			throw new Meteor.Error(203, 'User_logged_out');
		}

		const user = Meteor.user();

		let message = RocketChat.models.Messages.findOne({ _id: messageId });
		let room = RocketChat.models.Rooms.findOne({ _id: message.rid });

		if (Array.isArray(room.muted) && room.muted.indexOf(user.username) !== -1) {
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

		return;
	}
});
