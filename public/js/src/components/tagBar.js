module.exports = function (Vue) {
	return Vue.extend({
		template:
			`<div id='tag-bar' v-bind:class="{'focus': ui.tagBarActive}"}>
				<div id='tags'>
					<template v-for='tag in tags'>
						<div class='tag' v-bind:class="{duplicate: tag.duplicate}" v-on:click='remove($index)'>{{tag.tag}}</div>
					</template>
					<input v-on:focus='toggleFocusTagBar' v-on:blur='toggleFocusTagBar' type="text" v-on:keyup.13='add' v-on:keydown.8='editLast($event)' v-model='newTag' placeholder='Add new tag'>
				</div>
			</div>`,
		data: function() {
			return {
				tags: [],
				newTag: '',
				ui: {
					tagBarActive: false
				}
			}
		},
		computed: {
			stringTags: function() {
				return (this.tags.map(function(tag) {
					return tag.tag
				}));
			}
		},
		events: {
			tags: function(tags) {	
				this.tags = tags.map(function(tag) {
					return {tag: tag, duplicate: false};
				});
			}
		},
		methods: {
			toggleFocusTagBar: function() {
				this.ui.tagBarActive = !this.ui.tagBarActive;
			},
			remove: function(index) {
				this.tags.splice(index, 1);
				this.$dispatch('tags', this.stringTags);
			},
			add: function() {
				function included() {
					for(var i = 0; i < this.tags.length; i++) {
						if(this.tags[i].tag === this.newTag.trim()) {
							return i;
						}
					}

					return -1;
				}

				if(this.newTag.trim().length) {
					var index = included.call(this);

					if(index > -1) {
						this.tags[index].duplicate = true;
						this.tags = this.tags;

						setTimeout((function() {
							console.log
							this.tags[index].duplicate = false;
							this.tags = this.tags;
						}).bind(this), 500);
					} else {
						this.tags.push({tag: this.newTag.trim(), duplicate: false});
						this.newTag = '';
						this.$dispatch('tags', this.stringTags);
					}	
				}
			},
			editLast: function(ev) {
				if(this.newTag.length) return;
 		
 				ev.preventDefault();

				var lastTag = this.tags.pop();
				this.newTag = lastTag.tag;
				this.$dispatch('tags', this.stringTags);
			},
			event: function(name) {
				this.$dispatch('event', name);
			}
		}
	});
}