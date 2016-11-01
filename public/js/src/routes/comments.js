var Vue = require('vue/dist/vue.js');
var modals = require('../modals.js');
var Tooltip = require('../tooltip.js');
var Errors = require('../../../../errors.js');

var Comments = Vue.extend({
	template: require('html!./comments.html'),
	data: function() {
		return {
			categories: [
				{name: 'All comments', icon: 'comments-o', selected:true},
				{name: 'Pending', icon: 'clock-o', selected:false},
				{name: 'Approved', icon: 'check', selected:false},
				{name: 'Removed', icon: 'times', selected:false},
				{name: 'Settings', icon: 'cogs', selected:false}
			],
			comments: [],
			sortBy: 'time',
			loadingText: 'Loading...'
		};
	},
	computed: {
		filteredComments: function() {
			var selected = this.categories.filter(category => category.selected)[0];
			var sortedComments = this.comments.sort(function(a, b) {
				if(this.sortBy === 'time') {
					return new Date(b.dateCreated) - new Date(a.dateCreated);
				} else {
					if(a.postTitle > b.postTitle) {
						return 1;
					}
					if(a.postTitle < b.postTitle) {
						return -1;
					}
					return 0;
				}
			}.bind(this));

			if(selected.name === 'All comments') {
				return sortedComments;
			} else if(selected.name !== 'Settings') {
				return sortedComments.filter(comment => comment.status === selected.name.toLowerCase());
			}
		}
	},
	methods: {
		selectCategory: function(name) {
			if(name === 'Settings') {
				this.$router.push('settings');
				return;
			}

			this.categories.map(function(category) {
				if(category.selected && category.name !== name) category.selected = false;
				if(category.name === name) category.selected = true;

				return category;
			});

			this.categories = this.categories;
		},
		moderate: function(id, index, action) {
			this.$http
				.put('/api/comments/moderate/' + id, {status: action})
				.then(function(res) {
					if(res.data.error) {
						modals.alert(res.data.error.message);
					} else {
						Vue.set(this.comments, index, res.data);
					}
				}, function(err) {
					console.log(err);
					modals.alert(Errors.unknown.message);
				});
		},
		deletePost: function(id, comment) {
			modals.confirm(
				'Are you sure you want to permanently delete this comment?' + 
				'<br/>This cannot be undone',
				function(res) {
					if(res) {
						this.$http
							.delete('/api/comments/moderate/' + id)
							.then(function(res) {
								if(res.data.error) {
									modals.alert(res.data.error.message);
								} else {
									var index = this.comments.indexOf(comment);
									this.comments.splice(index, 1);
								}
							}, function(err) {
								console.log(err);
								modals.alert(Errors.unknown.message);
							});
					}
				}.bind(this),
				'red'
			)
		},
		openPost: function(id) {
			window.open('/api/posts/' + id + '/redirect');
		},
		fetchData: function() {
			this.$http
				.get('/api/comments')
				.then(function(res) {
					if(res.data.error) {
						modals.alert(res.data.error.message);
					} else {
						this.comments = res.data;
						this.loadingText = 'No comments'
					}

				}, function(err) {
					console.log(err);
					modals.alert(Errors.unknown.message);
				});
		}
	},
	created: function() {
		this.fetchData();
	},
	watch: {
		'$route': 'fetchData'
	},
	mounted: function() {
		var self = this;

		this.$nextTick(function() {
			Tooltip('#comment-box-bar span', {
				items: [
					{title: 'Time', click: function() {
						self.sortBy = 'time';
					}},
					{title: 'Post', click: function() {
						self.sortBy = 'post';
					}}
				]
			});
		});
	}
});

module.exports = Comments;