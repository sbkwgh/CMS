module.exports = {
	get: function (db, cb) {
		db.collection('settings').findOne({}, cb);
	},
	put: function(db, updateObj, cb) {
		db.collection('settings').update({}, updateObj, cb);
	},
	init: function(db) {
		var settings = db.collection('settings');
		settings.findOne({}, function(err, doc) {
			if(doc === null) {
				settings.insert({
					blogTitle: 'Blog title',
					blogDescription: 'Your blog description here',
					commentsModerated: true,
					commentsMessage: 'Add a comment',
					commentsAllowed: true
				});
			}
		});
	}
}