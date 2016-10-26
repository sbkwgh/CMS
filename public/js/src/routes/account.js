var modals = require('../modals.js');
var Errors = require('../../../../errors.js');

module.exports = function(Vue) {
	return Vue.extend({
		template: require('html!./account.html'),
		data: function() {
			return {
				author: '',
				biography: '',
				password: '',
				confirmPassword: '',
				loading: false
			}
		},
		methods: {
			saveSettings: function() {
				this.loading = true;

				this.$http
					.put('/api/settings', {
						blogTitle: this.blogTitle,
						blogDescription: this.blogDescription,
						blogSidebar: this.blogSidebar,
						commentsModerated: this.commentsModerated,
						commentsMessage: this.commentsMessage,
						commentsAllowed: this.commentsAllowed
					})
					.then(function(res) {
						this.loading = false;

						if(res.data.error) {
							titleTooltip(this.$els.save, res.data.error.message, 5000);
						} else {
							titleTooltip(this.$els.save, 'Settings saved', 5000);
						}
					}, function(err) {
						this.loading = false;
						console.log(err);
						titleTooltip(this.$els.save, Errors.unknown.message, 5000);
					});
			}
		},
		route: {
			data: function(transition) {
				this.$http
					.get('/api/account')
					.then(function(res) {
						if(res.data.error) {
							modals.alert(res.data.error.message);
						} else {
							this.author = res.data.author;
							this.biography = res.data.biography || '';
						}

						transition.next();
					}, function(err) {
						console.log(err);
						modals.alert(Errors.unknown.message);
						transition.next();
					});
			}
		}
	});
};