var Vue = require('vue/dist/vue.js');
var markdown = require('markdown');
var modals = require('../modals.js');
var wordCount = require('html-word-count');
var tooltip = require('../tooltip.js');
var Errors = require('../../../../errors.js');

function pluralize(number, word) {
	if(!number || number > 1) {
		return number + ' ' + word + 's';
	} else {
		return number + ' ' + word;
	}
}

function getInputSelection(el) {
    var start = 0, end = 0, normalizedValue, range,
        textInputRange, len, endRange;

    if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
        start = el.selectionStart;
        end = el.selectionEnd;
    } else {
        range = document.selection.createRange();

        if (range && range.parentElement() == el) {
            len = el.value.length;
            normalizedValue = el.value.replace(/\r\n/g, "\n");

            // Create a working TextRange that lives only in the input
            textInputRange = el.createTextRange();
            textInputRange.moveToBookmark(range.getBookmark());

            // Check if the start and end of the selection are at the very end
            // of the input, since moveStart/moveEnd doesn't return what we want
            // in those cases
            endRange = el.createTextRange();
            endRange.collapse(false);

            if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                start = end = len;
            } else {
                start = -textInputRange.moveStart("character", -len);
                start += normalizedValue.slice(0, start).split("\n").length - 1;

                if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                    end = len;
                } else {
                    end = -textInputRange.moveEnd("character", -len);
                    end += normalizedValue.slice(0, end).split("\n").length - 1;
                }
            }
        }
    }

    return {
        start: start,
        end: end
    };
}

function replaceSelectedText(start, end) {
	var el = document.querySelector("#markdown-editor textarea");

    var sel = getInputSelection(el), val = el.value;
    var selected = val.slice(sel.start, sel.end);
    el.value = val.slice(0, sel.start) + start + val.slice(sel.start, sel.end) + end + val.slice(sel.end);
    el.focus();
    el.setSelectionRange(sel.start+start.length, sel.start + (start + selected).length);

    return el.value;
}

var PostsNew = Vue.extend({
	template: require('html!./postsNew.html'),
	components: {
		'tag-bar': require('../components/tagBar.js')
	},
	data: function() {
		return {
			tags: [],
			title: '',
			markdown: '',
			published: false,
			slug: '',
			commentsAllowed: true,
			ui: {
				markdownEditorActive: false,
				tagBarActive: false,
				isSavedPost: !!this.$route.params.id,
				saving: false,
				savingOptions: false
			}
		}
	},
	computed: {
		html: function() {
			return markdown.parse(this.markdown);
		},
		wordCountString: function() {
			var count = wordCount(this.html);
			return pluralize(count, 'word');
		},
		random: function() {
			return Math.random();
		}
	},
	events: {
		tags: function(tags) {
			this.tags = tags;
		}
	},
	methods: {
		bold: function() {
			this.markdown = replaceSelectedText("__", "__");
		},
		italic: function() {
			this.markdown = replaceSelectedText("*", "*");
		},
		link: function() {
			var self = this;
			modals.prompt('Enter the URL for the link', 'e.g. https://google.com', function(val) {
				if(val) {
					self.markdown = replaceSelectedText('[', '](' + val.trim() + ')');
				}
			}, 'green');
		},
		bulletPoint: function() {
			this.markdown = replaceSelectedText('   * ', '');
		},
		image: function() {
			var self = this;
			modals.file({
				placeholder: 'Or enter the URL of the image',
				message: 'Drag and drop an image here or',
				accept: 'image/*',
				leftButton: 'Add image',
				upload: '/api/images'
			}, function(err, val) {
				if(err) {
					modals.alert(err.message);
				} else if(val) {
					self.markdown = replaceSelectedText('![', '](' + val.trim() + ')');
				}
			}, 'green');
		},
		saveButton: function() {
			if(this.$route.path === '/posts/new') {
				this.createPost();
			} else {
				this.updatePost({}, {button: 'save', message: 'All changes saved'});
			}
		},
		toggleFocusMarkdownEditor: function() {
			this.ui.markdownEditorActive = !this.ui.markdownEditorActive;
		},

		buttonMessage: function(button, message) {
			console.log(this.$refs)

			if(button === 'save') {
				titleTooltip(this.$refs.saveButton, message, 3000);
			} else if(button === 'options') {
				titleTooltip(this.$refs.optionsButton, message, 3000);
			}
		},

		updatePost(postObjAdditions, message) {
			var id = this.$route.params.id;
			var postObj = {
				title: this.title,
				markdown: this.markdown,
				tags: this.tags,
				commentsAllowed: this.commentsAllowed
			};
			for(var key in postObjAdditions) {
				postObj[key] = postObjAdditions[key];
			}

			var toggleSaving = () => {
				if(message && message.button !== 'save') {
					this.ui.savingOptions = !this.ui.savingOptions;
				} else {
					this.ui.saving = !this.ui.saving;
				}
			};

			toggleSaving();
			this.$http.put('/api/posts/' + id, postObj).then(function(res) {
				if(res.data.error) {
					modals.alert(res.data.error.message);
				} else if(message) {
					this.buttonMessage(message.button, message.message);
				}
				toggleSaving();
			}, function(err) {
				console.log(err);
				modals.alert(Errors.unknown.message);
				toggleSaving();
			});
		},
		createPost(postObjAdditions, message) {
			var postObj = {
				title: this.title,
				markdown: this.markdown,
				tags: this.tags,
				commentsAllowed: this.commentsAllowed
			};
			for(var key in postObjAdditions) {
				postObj[key] = postObjAdditions[key];
			}

			console.log(postObj)

			this.ui.saving = true;
			
			this.$http.post('/api/posts', postObj).then(function(res) {
				if(res.data.error) {
					modals.alert(res.data.error.message);
				} else {
					this.buttonMessage('save', 'Draft saved');
					this.$router.push('post/' + res.data._id);
				}
				this.ui.saving = false;
			}, function(err) {
				console.log(err);
				modals.alert(Errors.unknown.message);
				this.ui.saving = false;
			});
		},
		deletePost: function() {
			var id = this.$route.params.id;

			modals.confirm(
				'Are you sure you want to delete this draft and published post? ' +
				'<br/>This cannot be undone',
				function(res) {
					if(res) {
						this.$http.delete('/api/posts/' + id).then(function(res) {
							if(res.data.error) {
								modals.alert(res.data.error.message)
							} else if(res.data.success) {
								this.$router.push('posts');
							}
						}, function(err) {
							console.log(err);
							modals.alert(Errors.unknown.message);
						});
					}
				}.bind(this),
				'red'
			);
		},
		togglePublished: function() {
			var status = !this.published;
			var message = status ? 'Post published' : 'Post unpublished';

			this.updatePost({published: status}, {button: 'options', message: message});
			this.published = status;
		},
		toggleComments: function() {
			var id = this.$route.params.id;

			this.commentsAllowed = !this.commentsAllowed;
			this.ui.savingOptions = true;

			this.$http.put('/api/posts/' + id, {commentsAllowed: this.commentsAllowed}).then(function(res) {
				if(res.data.error) {
					modals.alert(res.data.error.message);
				} else {
					this.buttonMessage('options', this.commentsAllowed ? 'Comments enabled' : 'Comments disabled');
				}
				this.ui.savingOptions = false;
			}, function(err) {
				console.log(err);
				modals.alert(Errors.unknown.message);
				this.ui.savingOptions = false;
			});
		}
	},
	mounted: function() {
		var self = this;

		this.$nextTick(function() {
			tooltip('#post-options', {
				items: [
					{title: 'Delete post', click: this.deletePost},
					{title: 'Preview blog post', click: ()=>{window.open('/blog/post/' + self.slug)} },
					{title: () => this.commentsAllowed ? 'Disable comments' : 'Enable comments', click: this.toggleComments},
					{title: () => this.published ? 'Unpublish post' : 'Publish draft', click: this.togglePublished}
				]
			})

			var id = this.$route.params.id;
			if(id) {
				this.$http.get('/api/posts/' + id).then(function(res) {
					if(res.data.error) {
						modals.alert(res.data.error.message, function() {
							this.$router.push('posts')
						}.bind(this));
					} else {
						this.title = res.data.title;
						this.markdown = res.data.markdown;
						this.tags = res.data.tags;
						this.published = res.data.published;
						this.slug = res.data.slug;
						if(typeof res.data.commentsAllowed !== 'undefined') {
							this.commentsAllowed = res.data.commentsAllowed;
						}
					}
				}, function(err) {
					if(err) {
						console.log(err);
						modals.alert(Errors.unknown.message, function() {
							this.$router.push('posts')
						}.bind(this));
					}
				});
			}
		});
	}
});

module.exports = PostsNew;