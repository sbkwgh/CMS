var Vue = require('vue/dist/vue.js');

var TagBar = Vue.extend({
	template:
		`<div id='tag-bar' v-bind:class="{'focus': ui.tagBarActive}">
			<div id='tags'>
				<template v-for='(tag, index) in tags'>
					<div class='tag' v-bind:class="{duplicate: index === duplicateIndex}" v-on:click='remove(index)'>{{tag}}</div>
				</template>
				<input v-on:focus='toggleFocusTagBar' v-on:blur='toggleFocusTagBar' type="text" v-on:keyup.13='add' v-on:keydown.8='editLast($event)' v-model='newTag' placeholder='Add new tag'>
			</div>
		</div>`,
	props: ['tags'],
	data: function() {
		return {
			newTag: '',
			duplicateIndex: -1,
			ui: {
				tagBarActive: false
			}
		}
	},
	methods: {
		toggleFocusTagBar: function() {
			this.ui.tagBarActive = !this.ui.tagBarActive;
		},
		remove: function(index) {
			this.tags.splice(index, 1);
			this.$emit('tags', this.tags);
		},
		add: function() {
			function included() {
				for(var i = 0; i < this.tags.length; i++) {
					if(this.tags[i] === this.newTag.trim()) {
						return i;
					}
				}

				return -1;
			}

			if(this.newTag.trim().length) {
				var index = included.call(this);

				if(index > -1) {
					this.duplicateIndex = index;

					setTimeout((function() {
						this.duplicateIndex = -1;
					}).bind(this), 500);
				} else {
					this.tags.push(this.newTag.trim());
					this.newTag = '';
					this.$emit('tags', this.tags);
				}	
			}
		},
		editLast: function(ev) {
			if(this.newTag.length) return;
		
				ev.preventDefault();

			var lastTag = this.tags.pop();
			this.newTag = lastTag;
			this.$emit('tags', this.tags);
		}
	}
});

module.exports = TagBar;