function setSelected(route) {
	this.menuItems.map(function(item) {
		if(item.selected && item.route !== route) item.selected = false;
		if(item.route === route) item.selected = true;

		return item;
	});

	this.$set('menuItems', this.menuItems);
}

module.exports = function(Vue, router) {
	return Vue.extend({
		data: function() {
			return {
				menuItems: [
					{name: 'Dashboard', route: '/dashboard', icon: 'dashboard', selected: false},
					{name: 'Blog posts', route: '/posts', icon: 'pencil-square', selected: false},
					{name: 'Comments', route: '/comments', icon: 'comments', selected: false},
					{name: 'Design', route: '/design', icon: 'paint-brush', selected: false},
					{name: 'Settings', route: '/settings', icon: 'cogs', selected: false}
				]
			}
		},
		template: 
			`<div class='navigation-menu'>
				<div v-for='menuItem in menuItems' class='menu-item' v-bind:class='{"selected": menuItem.selected}' v-on:click='changeRoute(menuItem.route)'>
					<i class='fa fa-fw fa-{{menuItem.icon}}'></i>
					<span>{{menuItem.name}}</span>
				</div>
			</div>`,
		methods: {
			changeRoute(route) {
				setSelected.call(this, route);
				router.go(route);
			}
		},
		mounted: function() {
			var self = this;
			
			router.afterEach(function (transition) {
				var route = '/'+transition.to.path.split('/')[1];
				setSelected.call(self, route);
			});
		}
	});
};