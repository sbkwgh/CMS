function applyStyles(el, obj) {
	for(var style in obj) {
		el.style[style] = obj[style];
	}
}

function addTitleTooltip(el, text, timeLimit) {
	var span = document.createElement('span');
	var spanText = text
		.replace('@content', el.innerHTML)
		.replace(/@attr\(([^)]*)\)/gi, function(m, attr) {
			return el.getAttribute(attr);
		});

	span.appendChild(document.createTextNode(spanText));
	span.classList.add('title-tooltip');
	applyStyles(span, {
		'backgroundColor': 'rgb(60,60,60)',
		'color': '#fff',
		'fontFamily': "'Roboto', sans-serif",
		'fontWeight': '30',
		'fontSize': '0.75rem',
		'padding': '0.25rem 0.5rem',
		'position': 'absolute',
		'zIndex': '3',
		'border': '0',
		'borderRadius': '0.2rem',
		'opacity': '0',
		'max-width': '15rem',
		'transition': 'all 0.25s',
		'pointer-events': 'none'
	});
	
	var arrow = document.createElement('div');
	applyStyles(arrow, {
		'borderLeft': '0.5rem solid transparent',
		'borderRight': '0.5rem solid transparent',
		'borderTop': '0.5rem solid rgb(60,60,60)',
		'position': 'absolute',
		'left': 'calc(50% - 0.45rem)',
		'bottom': '-0.4rem',
		'pointer-events': 'none'
	});

	span.appendChild(arrow);
	document.body.appendChild(span);

	function positionTooltip() {
		var coordsSpan = span.getBoundingClientRect();
		var coordsEl = el.getBoundingClientRect();
		var elMarginTop = +getComputedStyle(el).marginTop.slice(0,-2);
		var body = document.body.getBoundingClientRect();

		var elCenter = coordsEl.left + coordsEl.width/2;

		span.style.left = "calc(" + elCenter + "px - " + coordsSpan.width/2 + "px)";
		span.style.top = (window.pageYOffset || document.documentElement.clientTop) + coordsEl.top +  - 2*coordsSpan.height + 'px';
		
		coordsSpan = span.getBoundingClientRect();
		coordsEl = el.getBoundingClientRect();
		var coordsArrow = arrow.getBoundingClientRect();
		
		if(coordsSpan.left <= 0) {
			span.style.left = '8px';
			arrow.style.left = "calc(" + elCenter + "px - " + coordsArrow.width + "px)";
		}
		if(coordsSpan.right >= body.width) {
			span.style.left = null;
			span.style.right = '8px';
			arrow.style.left = null;
			arrow.style.right = (coordsEl.y + coordsArrow.width) + "px";
		}
	}
	positionTooltip();

	var previousCoords = el.getBoundingClientRect();
	var pollElementInterval;
	function pollElement() {
		if(!document.body.contains(span)) { 
			clearInterval(pollElementInterval); 
		}

		var currentCoords = el.getBoundingClientRect();
		if(
			previousCoords.left !== currentCoords.left ||
			previousCoords.width !== currentCoords.width ||
			previousCoords.top !== currentCoords.top ||
			previousCoords.height !== currentCoords.height
		) {
			positionTooltip();
		}
	}
	pollElementInterval = setInterval(pollElement, 5);
	
	if(timeLimit) {
		setTimeout(function() {
			document.body.removeChild(span);
		}, timeLimit);
	}

	setTimeout(function() {
		span.style.opacity = '0.95';
	}, 250);

	return span;
}

document.body.addEventListener('mouseover', function(ev) {
	var title = ev.target.getAttribute('data-title');
	
	if(title) {
		addTitleTooltip(ev.target, title);
	}
});
document.body.addEventListener('mouseout', function(ev) {
	var title = ev.target.getAttribute('data-title');
	
	if(title) {
		document.body.removeChild(document.querySelector('.title-tooltip'));
	}
});

/*
<a
	href='link'
	data-title='Here is a @attr(data-dynamic-attr) @content'
	data-dynamic-attr='tooltip for a'
>
	link
</a>
Gives: 'Here is a tooltip for a link'
*/

module.exports = addTitleTooltip;