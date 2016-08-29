function tooltip(tQueryString, tData) {
	function closeDiv(div) {
		div.parentElement.removeChild(div);
	}
	function eventCb(ev) {
		if(ev.target.matches(tQueryString)) {
			 append(tData, ev.target)
		 } else if(ev.target.parentElement.matches(tQueryString)) {
		 	append(tData, ev.target.parentElement);
		 }
	} 

	function getDiv(data) {
		var innerHTML = 
			`<div class='tooltip-triangle-gray'></div>
			<div class='tooltip-triangle-white'></div>
			<div class='tooltip-header'>
					<span class='tooltip-header-title'>${data.header}</span>
			</div>`;
		
		var div = document.createElement('div');
		div.classList.add('tooltip');
		div.innerHTML = innerHTML;
		
		data.items.forEach(function(item) {
			var itemDiv = document.createElement('div');
			itemDiv.classList.add('tooltip-item');

			if(typeof item.title === 'function') {
				itemDiv.appendChild(document.createTextNode(item.title()));
			} else {
				itemDiv.appendChild(document.createTextNode(item.title));
			}
			
			itemDiv.addEventListener('click', function(ev) {
				if(item.click) {
					item.click(ev);
				}
				closeDiv(div);
			})
			
			div.appendChild(itemDiv);
		});

		if(!data.header) {
			div.removeChild(div.querySelector('.tooltip-header'));
		}

		return div; 
	}

	function append(data, el) {  
		var div = getDiv(data);
		document.body.appendChild(div);

		var coordsDiv = div.getBoundingClientRect();
		var coordsEl = el.getBoundingClientRect();
		
		var elCenter = coordsEl.left + coordsEl.width/2;
	
		div.style.left = "calc(" + elCenter + "px - 6.5rem)";
		div.style.top = "calc(" + coordsEl.top + "px - " + (coordsDiv.height+5) + 'px)';

		coordsDiv = div.getBoundingClientRect();

		if(document.body.getBoundingClientRect().width <= coordsDiv.right) {
			div.style.left = null;
			div.style.right = '10px';

			var triangleWhite = div.querySelector('.tooltip-triangle-white');
			var triangleGray = div.querySelector('.tooltip-triangle-gray');

			triangleWhite.style.position = 'fixed';
			triangleWhite.style.left = elCenter - 4 + 'px';
			triangleWhite.style.top = 'calc(' + coordsEl.bottom + 'px - 1px - 1.5rem)';

			triangleGray.style.position = 'fixed';
			triangleGray.style.left = elCenter - 7 + 'px';
			triangleGray.style.top = 'calc(' + coordsEl.bottom + 'px - 1.5rem)';
		}
	}

	document.body.addEventListener('click', eventCb);
}

document.body.addEventListener('click', function(ev) {
	var tooltipEl = document.querySelector('.tooltip');
	if(tooltipEl && !tooltipEl.contains(ev.target)) {
		tooltipEl.parentElement.removeChild(tooltipEl);
	}
})

module.exports = tooltip;

/*var data = {
	header: 'test',
	items: [
		{title: 'one', click: function() {alert('here')}},
		{title: 'and another'},
		{title: 'and another'}
	]
};

tooltip('button', data);*/