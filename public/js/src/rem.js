var div = document.createElement('div');
var rem;

div.style.height = '1rem';
document.body.appendChild(div);
rem = div.getBoundingClientRect().height;
document.body.removeChild(div);

module.exports = function(val) {
	return val*rem;
}