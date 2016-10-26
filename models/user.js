var mongoose = require('mongoose');
var Post = require('./post.js');
var hashGen = require('password-hash-and-salt');
var shortid = require('shortid');

var userSchema = mongoose.Schema({
	username: {type: String, required: true},
	author: {type: String, required: true},
	authorId: String,
	hash: {type: String, required: true},
	biography: String
});

userSchema.options.toJSON = {
	transform: function(doc, ret, options) {
		delete ret.hash;
		return ret;
	}
};

userSchema.pre('save', function(next) {
	var self = this;

	this.authorId = author.replace(/\s/g, '-') + '-' + shortid.generate();

	hashGen(this.hash).hash(function(err, hash) {
		if(err) {
			self.invalidate('user', err)
			next(err)
		} else {
			self.hash = hash;
			next();
		}
	});
});

userSchema.statics.findPostsByUser = function(authorId, cb) {
	User.findOne({authorId: authorId}, function(err, user) {
		if(err) {
			cb(err);
		} else if(!user) {
			cb(null, {})
		} else {
			var JSONUser = user.toJSON();

			Post.find({authorId: user.authorId}, function(err, posts) {
				if(err) {
					cb(err);
				} else {
					JSONUser.posts = posts.map( p => p.toJSON({virtuals: true}) );

					cb(null, JSONUser);
				}
			});
		}
	});
};

userSchema.statics.findUserAndCompareHashes = function(username, password, cb) {
	if(typeof username !== 'string' && typeof password !== 'string') {
		cb('invalid parameters');
		return;
	}

	User.findOne({username: username}, function(err, user) {
		if(err) {
			cb(err);
			return;
		}
		if(!user) {
			cb('user not found');
			return;
		}

		hashGen(password).verifyAgainst(user.hash, function(err, verified) {
			cb(err, verified, user);
		});
	})
};

var User = mongoose.model('User', userSchema);

module.exports = User;