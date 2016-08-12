var modals = require('../modals.js');
var Errors = require('../../../../errors.js');

module.exports = function(Vue) {
	return Vue.extend({
		template: require('html!./settings.html'),
		data: function() {
			return {
				blogTitle: '',
				blogDescription: '',
				commentsModerated: false,
				commentsMessage: '',
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
						commentsModerated: this.commentsModerated,
						commentsMessage: this.commentsMessage
					})
					.then(function(res) {
						this.loading = false;

						console.log(this.$els.save)

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
					.get('/api/settings')
					.then(function(res) {
						if(res.data.error) {
							modals.alert(res.data.error.message);
						} else {
							this.blogDescription = res.data.blogDescription;
							this.blogTitle = res.data.blogTitle;
							this.commentsModerated = res.data.commentsModerated;
							this.commentsMessage = res.data.commentsMessage;
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