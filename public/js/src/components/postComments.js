var Errors = require('../../../../errors.js');
var rem = require('../rem.js');

module.exports = function(Vue) {
	return Vue.extend({
		template: require('html!./postComments.html'),
		props: ['postId', 'commentsMessage'],
		data: function() {
			return {
				commentsAllowed: true,

				name: '',
				commentBody: '',
				highlight: '',
				head: '',
				comments: [],
				replies: {
					_id: '',
					name: ''
				},

				ui: {
					savingComment: false,
					loadingMessage: 'Loading...'
				}
			};
		},
		computed: {
			sortedComments: function() {
				var comments = this.comments;
				var threads = {};
				var sorted = [];


				for(var comment of comments) {
					if(comment.head) {
						if(!threads[comment.head]) { threads[comment.head] = [] };

						threads[comment.head].push(comment);
					}
				}
				for(var comment of comments) {
					if(!comment.head) {
						sorted.push(comment);
						if(threads[comment._id]) {
							sorted.push(...threads[comment._id])
						}
					}
				}

				return sorted;
			}
		},
		methods: {
			addComment: function() {
				if(!this.name.trim().length || !this.commentBody.trim().length) return;

				var commentObj = {
					name: this.name.trim(),
					commentBody: this.commentBody.trim(),
					time: new Date(),
					postId: this.postId,
					head: this.head || undefined,
					replies: this.replies._id || undefined,
					repliesName: this.replies.name || undefined
				}

				this.ui.savingComment = true;

				this.$http
					.post('/api/comments', commentObj)
					.then(function(res) {
						if(res.data.error) {
							titleTooltip(this.$els.addComment, 'Error saving comment', 5000);
						} else {
							res.data.moderatedMessage = 
								`<i class='fa fa-clock-o fa-fw'></i> This comment is awaiting moderation`;
							this.comments.push(res.data);

							this.commentBody = '';
							this.name = '';
							this.replies._id = '';
							this.replies.name = '';

							titleTooltip(
								this.$els.addComment, 
								'Comment saved' + (res.data.status === 'pending' ? ' - waiting to be approved' : ''), 
								5000
							);
						}

						this.ui.savingComment = false;
					}, function(err) {
						titleTooltip(this.$els.addComment, 'Error saving comment', 5000);
						this.ui.savingComment = false;
					});
			},
			replyComment: function(comment) {
				this.replies.name = comment.comment.name;
				this.replies._id = comment.comment._id;

				this.head = comment.comment.head || comment.comment._id;
			},
			cancelReply: function() {
				this.replies.name = '';
				this.replies._id = '';
			},
			highlightComment(_id) {
				this.highlight = _id;
				setTimeout(function() {
					this.highlight = '';
				}.bind(this), 1500);
			}
		},
		ready: function() {
			correctHeaderTop();

			function getComment(node) {
				if(!node.parentElement) return null;

				if(node.matches('.comment')) {
					return node;
				} else {
					return getComment(node.parentElement);
				}
			}

			this.$http
				.get('/api/comments/' + this.postId)
				.then(function(res) {
					if(!res.data.error) {
						this.comments = res.data.map(function(comment) {
							if(comment.status === 'pending') {
								comment.moderatedMessage =
									`<i class='fa fa-clock-o fa-fw'></i> This comment is awaiting moderation`;
							} else if(comment.status === 'removed') {
								comment.moderatedMessage = 
									`<i class='fa fa-times fa-fw'></i> This comment has been removed by moderators`;
							}

							return comment;
						});
						this.ui.loadingMessage = 'No comments - add yours'
					} else if(res.data.error.name === 'commentsDisabled') {
						this.commentsAllowed = false;
					}
					correctHeaderTop();
				}, function(err) {
					this.ui.loadingMessage = 'Something went wrong loading comments. Try refreshing the page';
					console.log(err);
				});

			document.querySelector('.comments-box').addEventListener('mouseover', function(ev) {
				var comment = getComment(ev.target);
				if(!comment) return;

				var reply = comment.querySelector('.comment-reply');
				if(!reply) return;

				reply.classList.add('show');
			});
			document.querySelector('.comments-box').addEventListener('mouseout', function(ev) {
				var comment = getComment(ev.target);
				if(!comment) return;

				var reply = comment.querySelector('.comment-reply');
				if(!reply) return;

				reply.classList.remove('show');
			});
		}
	});
};

var ticking = false;
var correctHeaderTop = function() {
	var $comments = document.querySelector('#comments');
	var $header = document.querySelector('header');
	var $sidebar = document.querySelector('#sidebar');
	var bodyRect = document.body.getBoundingClientRect();

	var sidebarStatic = getComputedStyle($sidebar).position === 'static';

	if(!$comments) return;
	if(getComputedStyle($header).position === 'static') return;

	if(bodyRect.height - $comments.getBoundingClientRect().top >= 0) {
		if($header.style.top) return;

		$header.style.position = 'absolute';
		$header.style.top = -bodyRect.top + rem(3.5) + 'px';

		if(!sidebarStatic) {
			$sidebar.style.top = -bodyRect.top + rem(15.5) + 'px';
			$sidebar.style.position = 'absolute';
		}

		
	} else {
		$header.style.position = 'fixed';
		$header.style.top = null;

		if(!sidebarStatic) {
			$sidebar.style.position = 'fixed';
			$sidebar.style.top = null;
		}
		
	}
}
window.addEventListener('scroll', function() {
	if(ticking) return;
	setTimeout(function() {
		correctHeaderTop();
		ticking = false;
	}, 5);
	ticking = true;
});