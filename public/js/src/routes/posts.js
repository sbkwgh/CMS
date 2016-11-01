var Vue = require('vue/dist/vue.js');
var markdown = require('markdown');
var modals = require('../modals.js');

var Posts = Vue.extend({
	template: require('html!./posts.html'),
	data: function() {
		return {
			posts: [],
			classes: {
				published: 'post-status-published',
				draft: 'post-status-draft'
			},
			noPostsMessageMain: 'Loading posts...',
			noPostsMessageBox: 'Loading...',
			selectedId: ''
		};
	},
	computed: {
		selectedPost: function() {
			var self = this;

			return this.posts.find(function(post) {
				return post._id === self.selectedId;
			});
		}
	},
	mounted: function() {
		this.getPosts();
	},
	methods: {
		getPosts: function() {
			this.$http.get('/api/posts').then(function(res) {
				if(res.data.error) {
					console.log(res.data.error);
				} else {
					this.posts = res.data;
					this.selectedId = this.posts[0]._id;

					if(!res.data.length) {
						this.noPostsMessageMain = `You haven't written any posts yet.`;
						this.noPostsMessageBox = 'No post selected';
					}
				}
			}, function(err) {
				console.log(err);
			});
		},
		selectPost: function(id) {
			this.selectedId = id;
		}, 
		editPost: function() {
			this.$router.push({ name: 'posts/post', params: {id: this.selectedId} });
		},
		deletePost: function() {
			var index = this.posts.indexOf(this.selectedPost);

			modals.confirm(
				'Are you sure you want to delete this post? ' +
				'<br/>This cannot be undone',
				function(res) {
					if(res) {
						this.$http.delete('/api/posts/' + this.selectedId).then(function(res) {
							if(res.data.error) {
								console.log(res.data.error)
							} else if(res.data.success) {
								this.posts.splice(index, 1);
								this.selectPost(this.posts[0]._id)
							}
						}, function(err) {
							console.log(err);
						});
					}
				}.bind(this),
				'red'
			);
		}
	}
});

module.exports = Posts;