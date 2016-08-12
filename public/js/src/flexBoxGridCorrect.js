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

	var children = getChildren();
	var childrenPerLine, childrenOnLastLine;

	children.forEach(function(child, index, arr) {
		var childBottom = child.getBoundingClientRect().bottom;
		var prevChild = arr[index-1];
		var prevChildBottom;

		if(!prevChild || childrenPerLine) {
			return;
		}

		prevChildBottom = prevChild.getBoundingClientRect().bottom;

		if(childBottom !== prevChildBottom) {
			childrenPerLine = index;
		}
	});

	childrenOnLastLine = children.length % childrenPerLine || 1;

	//Keep adding invisible div's until the last div and
	//and the penunltimate div are on different lines
	children = getChildren();
	while (
		children.slice(-1)[0].getBoundingClientRect().bottom ==
		children.slice(-2)[0].getBoundingClientRect().bottom
		
	) {
		var div = document.createElement('div');
		
		div.classList.add(childClass);
		div.style.visibility = 'hidden';

		container.appendChild(div);

		children = getChildren()
	}
	//Then remove last (additional) div
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