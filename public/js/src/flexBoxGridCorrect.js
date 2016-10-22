function removeHiddenFlexBoxChidren(parentString, childClass) {
	var container = document.querySelector(parentString);
	if(!container) return;

	[].forEach.call(container.getElementsByClassName(childClass), function(el) {
		if(el.style.visibility === 'hidden') {
			container.removeChild(el);
		}
	});
}

function addFlexBoxChildren(parentString, childClass) {
	var container = document.querySelector(parentString);
	if(!container) return;

	function getChildren() {
		return [].map.call(container.getElementsByClassName(childClass), function(el) { return el; });
	}
	function lastTwoChildrenOnSameLine() {
		var children = getChildren();

		return (
			children.slice(-1)[0].getBoundingClientRect().bottom ==
			children.slice(-2)[0].getBoundingClientRect().bottom
		);
	}
	function addChild() {
		var div = document.createElement('div');
		
		div.classList.add(childClass);
		div.style.visibility = 'hidden';

		container.appendChild(div);
	}


	//Since there is only one div on the last line therefore
	//Add another one to allow for the next comparison
	if(!lastTwoChildrenOnSameLine()) {
		addChild();
	}

	//Keep adding invisible div's until the last div and
	//and the penunltimate div are on different lines
	while (lastTwoChildrenOnSameLine()) {
		addChild();
	}

	//Then remove last (additional) div
	var children = getChildren();
	if(children.slice(-1)[0].style.visibility === 'hidden') {
		container.removeChild(children.slice(-1)[0]);
	}
	
}

module.exports = function(parentString, childClass) {
	addFlexBoxChildren(parentString, childClass);

	var ticking = false;
	window.addEventListener('resize', function() {
		if(ticking) return;
		setTimeout(function() {
			removeHiddenFlexBoxChidren(parentString, childClass);
			addFlexBoxChildren(parentString, childClass);

			ticking = false;
		}, 10);
		ticking = true;
	});
}