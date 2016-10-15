var Errors = require('../../../errors.js');
var Request = require('./request.js');

function genericModal(message, okColour) {
	var modalDiv = document.createElement('div');
	var colourClass = okColour ? 'btn-' + okColour : '';

	var template =
		`<div class='modal-box'>
			<div class='modal-box-content'>
				${message}
			</div>
			<img style='display:none;' />
			<div class='modal-box-buttons'>
				<button id='modal-button-ok' class='button ${colourClass}'>OK</button>
				<button id='modal-button-cancel' class='button'>Cancel</button>
			</div>
		</div>`;

	modalDiv.classList.add('modal');
	modalDiv.innerHTML = template;

	modalDiv.close = function() {
		modalDiv.classList.add('modal-close');

		setTimeout(function() {
			if(!document.body.contains(modalDiv)) return;

			document.body.removeChild(modalDiv);
		}, 200)
	}

	return modalDiv;
}

var confirmBox = function (message, cb, okColour) {
	var confirmBoxDiv = genericModal(message, okColour);

	confirmBoxDiv.querySelector('#modal-button-ok').addEventListener('click', function() {
		cb(true);
		confirmBoxDiv.close();
	});
	confirmBoxDiv.querySelector('#modal-button-cancel').addEventListener('click', function() {
		cb(false);
		confirmBoxDiv.close();
	});

	if(document.querySelector('.modal')) {
		document.body.removeChild(document.querySelector('.modal'));
	}
	document.body.appendChild(confirmBoxDiv);
}

var prompBox = function (message, placeholder, cb, okColour) {
	var promptBoxDiv = genericModal(message, okColour);

	var input = document.createElement('input');
		input.classList.add('modal-box-content-input');
		input.setAttribute('placeholder', placeholder);
		promptBoxDiv.querySelector('.modal-box-content').appendChild(input);

	promptBoxDiv.querySelector('#modal-button-ok').addEventListener('click', function() {
		cb(input.value.trim());
		promptBoxDiv.close();
	});
	promptBoxDiv.querySelector('#modal-button-cancel').addEventListener('click', function() {
		cb(null);
		promptBoxDiv.close();
	});

	input.addEventListener('keydown', function(ev) {
		if(ev.keyCode === 13) {
			cb(input.value.trim());
			promptBoxDiv.close();
			ev.preventDefault();
		}
	});

	if(document.querySelector('.modal')) {
		document.body.removeChild(document.querySelector('.modal'));
	}
	document.body.appendChild(promptBoxDiv);
	input.focus();
}

var alertBox = function (message, cb, okColour) {
	var alertBoxDiv = genericModal(message, okColour);

	var cancelButton = alertBoxDiv.querySelector('#modal-button-cancel');
	cancelButton.parentElement.removeChild(cancelButton);

	alertBoxDiv.querySelector('.modal-box-buttons').classList.add('modal-box-alert');

	alertBoxDiv.querySelector('#modal-button-ok').addEventListener('click', function() {
		if(cb) cb(true);
		alertBoxDiv.close();
	});

	if(document.querySelector('.modal')) {
		document.body.removeChild(document.querySelector('.modal'));
	}
	document.body.appendChild(alertBoxDiv);
}

var fileBox = function (props, cb, okColour) {
	var uploadMessage =
		`${props.message || 'Drag and drop a file here or'}
		<label class='modal-box-file button'>browse<input type='file' accept='${props.accept || '*'}'></label>`;

	var fileBoxDiv = genericModal(uploadMessage, okColour);
	var input = document.createElement('input');
		input.classList.add('modal-box-content-input');
		input.setAttribute('placeholder', props.placeholder || '');
		fileBoxDiv.querySelector('.modal-box-content').appendChild(input);

		fileBoxDiv.querySelector('#modal-button-ok').textContent = props.leftButton || 'OK';

	/*function showImgThumbnail(file) {
		if(file && file.type.includes('image')) {
			var reader = new FileReader();
			var img = document.createElement('img');

			reader.onload = function(e) {
				img.src = e.target.result;
	
				fileBoxDiv.querySelector('.modal-box').replaceChild(img, fileBoxDiv.querySelector('img'));
			};
			reader.readAsDataURL(file);
		}
	}*/

	function uploadFile(file) {
		fileBoxDiv.querySelector('.modal-box').classList.add('modal-box-disabled');

		Request.post('/api/images', file, function(err, res) {
			fileBoxDiv.close();

			if(err) {
				console.log(err);
				cb(Errors.unknown);
			} else if(res.error) {
				cb(res.error)
			} else {
				cb(null, res.url);
			}
		});
	}

	fileBoxDiv.querySelector('.modal-box').addEventListener('dragenter', function(ev) {
		this.classList.add('modal-box-dragging');
	});
	fileBoxDiv.querySelector('.modal-box').addEventListener('dragexit', function(ev) {
		this.classList.remove('modal-box-dragging');
	});
	fileBoxDiv.querySelector('.modal-box').addEventListener('dragover', function(ev) {
		ev.preventDefault();
	});
	fileBoxDiv.querySelector('.modal-box').addEventListener('drop', function(ev) {
		ev.preventDefault();

		this.classList.remove('modal-box-dragging');
		uploadFile(ev.dataTransfer.files[0]);
	});
	fileBoxDiv.querySelector('.modal-box input').addEventListener('change', function(ev) {
		uploadFile(this.files[0]);
	});

	fileBoxDiv.querySelector('#modal-button-ok').addEventListener('click', function() {
		cb(input.value.trim());
		fileBoxDiv.close();
	});
	fileBoxDiv.querySelector('#modal-button-cancel').addEventListener('click', function() {
		cb(null);
		fileBoxDiv.close();
	});

	fileBoxDiv.querySelector('.modal-box-buttons').classList.add('modal-box-alert');

	if(document.querySelector('.modal')) {
		document.body.removeChild(document.querySelector('.modal'));
	}
	document.body.appendChild(fileBoxDiv);
}


module.exports = {
	confirm: confirmBox,
	prompt: prompBox,
	alert: alertBox,
	file: fileBox
}