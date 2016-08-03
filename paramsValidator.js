function paramsValidator(params) {
	return function(obj) {
		var validatedObj = {};

		for(var param in params) {
			var type = typeof params[param] === 'string' ? params[param] : params[param].type;
			var test = typeof params[param] === 'function' ? params[param] : params[param].test;
			var required = params[param].required;

			if(type === 'array' && Array.isArray(obj[param])) {
				validatedObj[param] = obj[param];
			} else if(test && test(obj[param])) {
				validatedObj[param] = obj[param];
			} else if(typeof obj[param] === type) {
				validatedObj[param] = obj[param];
			} else if(required && typeof obj[param] === 'undefined') {
				return null;
			}
		}

		return validatedObj;
	}
}

module.exports = paramsValidator;