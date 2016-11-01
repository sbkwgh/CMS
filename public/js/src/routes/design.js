var Vue = require('vue/dist/vue.js');

var Design = Vue.extend({
	template: require('html!./design.html'),
	data: function() {
		return {
			selected: 'a',
			templates: [
				{name: 'a'},
				{name: 'b'},
				{name: 'c'}
			]
		}
	},
	methods: {
		select: function(name) {
			this.selected = name;
		}
	}
});

module.exports = Design;