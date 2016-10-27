var markdown = require('markdown');
var modals = require('../modals.js');

module.exports = function(Vue) {
	return Vue.extend({
		template: require('html!./posts.html'),
		data: function() {
			return {
				posts: [],
				classes: {
					published: 'post-status-published',
					draft: 'post-status-draft'
				},
				noPostsMessageMain: 'Loading posts...',
				noPostsMessageBox: 'Loading...'
			};
		},
		computed: {
			selected: function() {
				return this.posts.find(function(post) {
					return post.selected
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
						this.$set('posts', res.data.map(function(post, index) {
							post.selected = false;
							if(!index) {
								post.selected = true;
							}

							return post;
						}));

						if(!res.data.length) {
							this.noPostsMessageMain = `You haven't written any posts yet.`;
							this.noPostsMessageBox = 'No post selected';
						}
					}
				}, function(err) {
					console.log(err);
				});
			},
			selectPost: function(slug) {
				this.posts.map(function(post) {
					if(post.selected && post.slug !== slug) post.selected = false;
					if(post.slug === slug) post.selected = true;

					return post;
				});

				this.$set('posts', this.posts);
			}, 
			editPost: function() {
				var id = this.posts.find(function(post) {
					return post.selected;
				})._id;
				this.$router.push({ name: 'posts/post', params: {id: id} });
			},
			deletePost: function() {
				var selected = this.selected;
				var selectedIndex;

				this.posts.forEach(function(post, index) {
					if(post.slug === selected.slug) {
						selectedIndex = index; 
					}
				});

				modals.confirm(
					'Are you sure you want to delete this post? ' +
					'<br/>This cannot be undone',
					function(res) {
						if(res) {
							this.$http.delete('/api/posts/' + selected._id).then(function(res) {
								if(res.data.error) {
									console.log(res.data.error)
								} else if(res.data.success) {
									this.posts.$remove(this.posts[selectedIndex]);
									this.selectPost(this.posts[0].slug)
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
};