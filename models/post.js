var mongoose = require('mongoose');
var markdown = require( "markdown" ).markdown;
var truncate = require('html-truncate');
var shortid = require('shortid');
var Errors = require('../errors.js');

var postSchema = mongoose.Schema({
	title: {type: String, required: true, trim: true},
	markdown: String,
	user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	date: {
		default: Date.now,
		type: Date
	},
	tags: [{
		type: String,
		trim: true
	}],
	published: {type: Boolean, require: true, default: false},
	slug: String,
	commentsAllowed: Boolean
});

postSchema.virtual('dateString').get(function() {
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Nov', 'Oct', 'Dec'];

	return (
		this.date.getDate() + ' ' + 
		months[this.date.getMonth()] + ' ' +
		this.date.getFullYear() + ', ' +
		this.date.toTimeString().slice(0,5)
	);
});

postSchema.virtual('bodyHTML').get(function() {
	return markdown.toHTML(this.markdown);
});
postSchema.virtual('truncatedHTML').get(function() {
	return truncate(this.bodyHTML, 1000, {keepImageTag: true});
});

postSchema.statics.findPostById = function(id, cb) {
	if(!id.match(/^[0-9a-fA-F]{24}$/)) {
		cb(Errors.invalidId);
		return;
	}

	Post.findById(id, function(err, post) {
		if(err) {
			console.log(err);
			cb(Errors.unknown);
			return;
		} else if(!post) {
			cb(Errors.postNotFound)
			return;
		} else {
			cb(null, post);
		}
	});
};

postSchema.pre('save', function(next) {
	if(this.body === undefined) {
		this.body = '';
	}
	if(this.slug === undefined) {
		var dashedTitle = this.title.split(' ').join('-');
		var slug;
		if(this.title.length <= 60) {
			slug = dashedTitle;
		} else {
			slug = dashedTitle.slice(0, 30) + '...' + dashedTitle.slice(-30, dashedTitle.length);
		}

		if(slug.slice(-1) === '-') {
			slug = slug.slice(0, -1);
		}

		slug = slug + '-' + shortid.generate();
		this.slug = slug;
	}

	next();
});

var Post = mongoose.model('Post', postSchema);

module.exports = Post;