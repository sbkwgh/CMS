var Errors = {
	unknown: 'An unknown error occured on our end. Please try again later',
	accountAlreadyCreated: 'An account has already been created',
	incorrectCredentials: 'Either the username or password was incorrect',
	invalidParams: 'The parameters of the request were incorrect',
	notAuthorised: 'The request was not authorised. Try logging in again',
	invalidId: 'An invalid post id was provided',
	postNotFound: 'No post was found for the id provided'
};

for(var errorName in Errors) {
	var temp = {};
	temp.name = errorName;
	temp.message = Errors[errorName];

	Errors[errorName] = temp;
}

module.exports = Errors;