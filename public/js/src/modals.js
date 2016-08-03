function genericModal(message, okColour) {
	var modalDiv = document.createElement('div');
	var colourClass = okColour ? 'btn-' + okColour : '';

	var template =
		`<div class='modal-box'>
			<div class='modal-box-content'>
				${message}
			</div>
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


module.exports = {
	confirm: confirmBox,
	prompt: prompBox,
	alert: alertBox
}