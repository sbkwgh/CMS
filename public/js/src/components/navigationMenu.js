var Vue = require('vue/dist/vue.js');

var NavigationMenu = Vue.extend({
	data: function() {
		return {
			selected: '',
			menuItems: [
				{name: 'Dashboard', route: '/dashboard', icon: 'fa-dashboard'},
				{name: 'Blog posts', route: '/posts', icon: 'fa-pencil-square'},
				{name: 'Comments', route: '/comments', icon: 'fa-comments'},
				{name: 'Design', route: '/design', icon: 'fa-paint-brush'},
				{name: 'Settings', route: '/settings', icon: 'fa-cogs'}
			]
		}
	},
	template: 
		`<div class='navigation-menu'>
			<template v-for='menuItem in menuItems'>
				<router-link
					class='menu-item'
					v-bind:class='{"selected": selected === menuItem.route}'
					v-on:click='changeRoute(menuItem.route)'
					v-bind:to='menuItem.route'
				>
					<i class='fa fa-fw' :class='menuItem.icon'></i>
					<span>{{menuItem.name}}</span>
				</router-link>
			</template>
		</div>`,
	methods: {
		changeRoute: function(route) {
			this.selected = route;
		}
	},
	mounted: function() {
		var self = this;

		this.selected = '/'+ this.$route.path.split('/')[1];

		this.$router.beforeEach(function(to, from, next) {
			var route = '/'+to.path.split('/')[1];
			this.selected = '/'+ to.path.split('/')[1];
		});
	}
});

module.exports = NavigationMenu;