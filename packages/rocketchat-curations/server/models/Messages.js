RocketChat.models.Messages.setCurations = function(messageId, curations) {
	return this.update({ _id: messageId }, { $set: { curations: curations }});
};

RocketChat.models.Messages.unsetCurations = function(messageId) {
	return this.update({ _id: messageId }, { $unset: { curations: 1 }});
};
