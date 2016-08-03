var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var commentSchema = mongoose.Schema({
	commentBody: {type: String, required: true, trim: true},
	name: {type: String, required: true, trim: true},
	dateCreated: {type: Date, default: Date.now},
	postId: {type: ObjectId, required: true},
	postTitle: {type: String, required: true},
	head: ObjectId,
	replies: ObjectId,
	repliesName: String,
	status: {type: String, required: true}
});

var Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;