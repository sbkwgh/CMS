function errorMsg(message, delay) {
	var el = document.querySelector('#error');
	var span = el.querySelector('span');

	span.innerHTML = message;
	el.classList.toggle('show');

	if(delay) {
		setTimeout(function() {
			el.classList.toggle('show');
		}, delay);
	}
}
errorMsg.DefaultTime = 4000;

var els = {
	login: {
		form: document.querySelector('#login'),
		username: document.querySelector('#login').username,
		password: document.querySelector('#login').password,
		button: document.querySelector('#login-button'),
		link: document.querySelector('#login-link')
	},
	createAccount: {
		form: document.querySelector('#create-account'),
		username: document.querySelector('#create-account').username,
		author: document.querySelector('#create-account').author,
		password: document.querySelector('#create-account').password,
		button: document.querySelector('#create-account-button'),
		link: document.querySelector('#create-account-link')
	}
};

els.createAccount.link.addEventListener('click', function(ev) {
	els.login.form.classList.toggle('hidden');
	els.createAccount.form.classList.toggle('hidden');
});
els.login.link.addEventListener('click', function(ev) {
	els.login.form.classList.toggle('hidden');
	els.createAccount.form.classList.toggle('hidden');
});

els.createAccount.button.addEventListener('click', function() {
	var obj = {
		username: els.createAccount.username.value.trim(),
		password: els.createAccount.password.value,
		author: els.createAccount.author.value.trim(),
	};

	if(
		obj.username.length && obj.password.length && obj.author.length
	) {
		Request.post('/api/account', obj, function(data) {
			if(!data.error && data.success) {
				location.href = '/cms';
			}
		});
	}
});

var login = (function() {
	var obj = {
		username: els.login.username.value.trim(),
		password: els.login.password.value
	};
	var self = this;
	
	if(
		obj.username.length && obj.password.length
	) {
		self.classList.toggle('btn-disabled');
		Request.post('/api/account/' + obj.username, obj, function(data) {
			if(!data.error && data.success) {
				location.href = '/cms';
			} else if(data.error) {
				self.classList.toggle('btn-disabled');
				errorMsg(data.error.message, errorMsg.DefaultTime);
			}
		});
	} else {
		errorMsg('Username and password cannot be empty', errorMsg.DefaultTime);
	}
}).bind(els.login.button);

els.login.form.addEventListener('keydown', function(ev) {
	if(ev.keyCode === 13) {
		login()
	}
})
els.login.button.addEventListener('click', function() {
	login();
});

var createAccount = (function() {
	var obj = {
		username: els.createAccount.username.value.trim(),
		password: els.createAccount.password.value,
		author: els.createAccount.author.value
	};
	var self = this;
	
	if(
		obj.username.length && obj.password.length && obj.author.length
	) {
		self.classList.toggle('btn-disabled');
		Request.post('/api/account', obj, function(data) {
			if(!data.error && data.success) {
				location.href = '/cms';
			} else if(data.error) {
				self.classList.toggle('btn-disabled');
				errorMsg(data.error.message, errorMsg.DefaultTime);
			}
		});
	} else {
		errorMsg('All fields must be filled in', errorMsg.DefaultTime);
	}
}).bind(els.createAccount.button);
els.createAccount.button.addEventListener('keydown', function(ev) {
	if(ev.keyCode === 13) {
		createAccount()
	}
});
els.createAccount.button.addEventListener('click', function() {
	createAccount()
});

var Request = {};
Request.serializeData = function(object) {

	var temp = '';
	var serializedString = '';
	for(var key in object) {
		if(object[key] === undefined) continue;
		if(Array.isArray(object[key])) {
			temp = '&' + key + '=' + JSON.stringify(object[key]);
		} else {
			temp = '&' + key + '=' + object[key];
		}
		serializedString += temp;
	}

	return serializedString.slice(1);
};
Request.request = function(method, url, data, cb, useJSON) {
	var http = new XMLHttpRequest();

	http.addEventListener('load', function() {
		if(typeof data === 'function') {
			data(JSON.parse(this.responseText));
		} else {
			cb(JSON.parse(this.responseText));
		}
	});

	http.open(method, url, true);

	if(useJSON || this.useJSON) {
		data = JSON.stringify(data);
		http.setRequestHeader('Content-type', 'application/json');
	} else {
		data = this.serializeData(data);
		http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	}
	
	if(typeof data === 'function') {
		http.send();
	} else {
		http.send(data);
	}
}
Request.post = function(url, data, cb) {
	this.request('post', url, data, cb);
};
Request.delete = function(url, data, cb) {
	this.request('delete', url, data, cb);
};
Request.put = function(url, data, cb) {
	this.request('put', url, data, cb);
};
Request.get = function(url, data, cb) {
	var http = new XMLHttpRequest();

	http.addEventListener('load', function() {
		if(typeof data === 'function') {
			data(JSON.parse(this.responseText));
		} else {
			cb(JSON.parse(this.responseText));
		}
	});

	http.open('GET', url + '/?' + this.serializeData(data || {}), true);
	http.send();
};

Request.useJSON = true;