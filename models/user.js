var mongoose = require('mongoose');
var hashGen = require('password-hash-and-salt');

var userSchema = mongoose.Schema({
	username: {type: String, required: true},
	author: {type: String, required: true},
	hash: {type: String, required: true},
});

userSchema.pre('save', function(next) {
	var self = this;
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