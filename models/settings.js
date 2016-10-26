var markdown = require('markdown');

module.exports = {
	get: function (db, cb) {
		db.collection('settings').findOne({}, cb);
	},
	put: function(db, updateObj, cb) {
		if(updateObj.blogSidebar) {
			updateObj.blogSidebarHTML = markdown.parse(updateObj.blogSidebar);
		}
		
		db.collection('settings').update({}, { $set: updateObj }, cb);
	},
	init: function(db) {
		var settings = db.collection('settings');
		settings.findOne({}, function(err, doc) {
			if(doc === null) {
				settings.insert({
					blogTitle: 'Blog title',
					blogDescription: 'Your blog description here',
					blogSidebar: 'Put what you want to be in your blog side bar here.' +
						'\nYou can format it with markdown.',
					commentsModerated: true,
					commentsMessage: 'Add a comment',
					commentsAllowed: true
				});
			}
		});
	}
}