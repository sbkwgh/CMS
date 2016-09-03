var d3 = require('d3');
var rem = require('../rem.js');

var data,
    height,
    arcs,
    color;

var resizeWidth = function() {
	var width = document
	.querySelector('#browser-pie-chart')
	.parentElement
	.getBoundingClientRect()
	.width;

	return width;
}

var update = function(width) {
	var svg = d3.select('#browser-pie-chart');

	var margin = Math.min(width, height) *0.125;
	var radius = Math.min(width, height)/2 - margin;

	svg.attr('width', width);

	var arc = d3.arc()
			.outerRadius(radius)
			.innerRadius(radius*0.65)
			.padAngle(Math.PI*2 * 1/360)

	var lineArc = d3.arc()
			.outerRadius(radius*1.2)
			.innerRadius(radius*0.75)
			.padAngle(Math.PI*2 * 1/360)

	var g = svg.select('g');

	g.attr('transform', `translate(${(width-radius)/2 + radius/2},${radius + margin})`);
															 
	g.selectAll('path')
		.data(arcs)
		.transition()
		.attr('d', arc);

	g.selectAll('.sector-label')
		.data(arcs)
		.transition()
		.attr('transform', d => `translate(${arc.centroid(d)})`);

	g.selectAll('polyline')
		.data(arcs)
		.transition()
		.attr('points', d => {
			var x0 = lineArc.centroid(d)[0];
			var y0 = lineArc.centroid(d)[1];
		
			var x1 = arc.centroid(d)[0] * 1.25;
			var y1 = arc.centroid(d)[1] * 1.25;
		
			var sign = x1/Math.abs(x1);
			
			return (`${x0},${y0} ${x1},${y1} ${radius*1.1*sign},${y1}`);
		});

	svg.selectAll('.label-text')
		.data(arcs)
		.transition()
		.attr('transform', d => {
			var x1 = arc.centroid(d)[0];
			var y1 = arc.centroid(d)[1] * 1.25;
			var sign = x1/Math.abs(x1);
		
			return (`translate(${radius*1.1*sign + sign*2},${y1})`);
		})
		.attr('each', function(d, i) {
			var self = this;
			var name = data[i].name;

			var differenceLeft = function() {
				var svgLeft = document.querySelector('#browser-pie-chart').getBoundingClientRect().left;
				var textLeft = self.getBoundingClientRect().left;
				
				return textLeft-3 - svgLeft;
			}
			var differenceRight = function() {
				var svgRight = document.querySelector('#browser-pie-chart').getBoundingClientRect().right;
				var textRight = self.getBoundingClientRect().right;
				
				return svgRight - 3-textRight;
			}

			this.textContent = name;

			while(differenceLeft() < 0 || differenceRight() < 0) {
				if(this.textContent.slice(-1)[0] === '…') {
					this.textContent = this.textContent.slice(0,-2) + '…';
				} else {
					this.textContent = name.slice(0,-1) + '…';
				}
			}
		});
}

var make = function(ajaxData) {
	var svg = d3.select('#browser-pie-chart');

	data = ajaxData;

	var width = resizeWidth();
	    height = rem(13.5);
	var margin = Math.min(width, height) * 0.125;
	var radius = Math.min(width, height)/2 - margin;

	svg.attr('width', width)
		.attr('height', height)
		.style('background-color', 'rgb(174, 122, 195)');

	var arc = d3.arc()
			.outerRadius(radius)
			.innerRadius(radius*0.65)
			.padAngle(Math.PI*2 * 1.5/360)

	var lineArc = d3.arc()
			.outerRadius(radius*1.2)
			.innerRadius(radius*0.75)
			.padAngle(Math.PI*2 * 1.5/360)

	arcs = d3.pie()(data.map(d => d.hits))

	color = d3.scaleLinear()
		.domain([d3.min(data.map(d => d.hits)), d3.max(data.map(d => d.hits))])
		.range(['#eee', '#6C7A89']);

	var g = svg.append('g');

	g.attr('transform', `translate(${(width-radius)/2 + radius/2},${radius + margin})`);
															 
	g.selectAll('path')
		.data(arcs)
		.enter()
		.append('path')
		.attr('d', arc)
		.attr('class', 'sector')
		.attr('fill', (d,i) => color(d.value));

	g.selectAll('text')
		.data(arcs)
		.enter()
		.append('text')
		.attr('transform', d => `translate(${arc.centroid(d)})`)
		.attr('dy', '0.25em')
		.attr('class', 'sector-label')
		.style('fill', d => {
			var rgb = color(d.value)
				.slice(4,-1)
				.split(', ')
				.reduce((prev, curr) => (+prev)+(+curr)) / 3;

			if(rgb >= 220) {
				return 'black';
			} else {
				return '#fff';
			}
		})
		.text(d => d.value);

	g.selectAll('polyline')
		.data(arcs)
		.enter()
		.append('polyline')
		.attr('points', d => {
			var x0 = lineArc.centroid(d)[0];
			var y0 = lineArc.centroid(d)[1];
		
			var x1 = arc.centroid(d)[0] * 1.25;
			var y1 = arc.centroid(d)[1] * 1.25;
		
			var sign = x1/Math.abs(x1);
			
			return (`${x0},${y0} ${x1},${y1} ${radius*1.1*sign},${y1}`);
		})
		.attr('stroke', '#fff')
		.attr('fill', 'none');

	g.selectAll('.label-text')
		.data(arcs)
		.enter()
		.append('text')
		.attr('class', 'label-text')
		.text((d, i) => data[i].name)
		.attr('transform', d => {
			var x1 = arc.centroid(d)[0];
			var y1 = arc.centroid(d)[1] * 1.25;
			var sign = x1/Math.abs(x1);
		
			return (`translate(${radius*1.1*sign + sign*2},${y1})`);
		})
		.attr('style', d => {
			var x1 = arc.centroid(d)[0];
			var sign = x1/Math.abs(x1);
		
			return 'text-anchor:' + (sign<0?'end':'start');
		})
		.attr('dy', '0.25em')
		.attr('data-hover', function(d, i) {
			var name = data[i].name;
			var hits  = data[i].hits;

			return `${name} browser, ${hits} page view${hits===1?'':'s'}`;
		})
		.attr('each', function(d, i) {
			var self = this;
			var differenceLeft = function() {
				var svgLeft = document.querySelector('#browser-pie-chart').getBoundingClientRect().left;
				var textLeft = self.getBoundingClientRect().left;
				
				return textLeft-3 - svgLeft;
			}
			var differenceRight = function() {
				var svgRight = document.querySelector('#browser-pie-chart').getBoundingClientRect().right;
				var textRight = self.getBoundingClientRect().right;
				
				return svgRight - 3-textRight;
			}

			while(differenceLeft() < 0 || differenceRight() < 0) {
				if(this.textContent.slice(-1)[0] === '…') {
					this.textContent = this.textContent.slice(0,-2) + '…';
				} else {
					this.textContent = this.textContent.slice(0,-1) + '…';
				}
			}
		});

	document.querySelector('#browser-pie-chart').addEventListener('mouseover', function(ev) {
		if(!ev.target.matches('.label-text')) return;
		
		var span = document.createElement('span');
		var text = ev.target.getAttribute('data-hover');
		
		span.innerHTML = text;
		span.style.top = ev.clientY - 25 + 'px';
		span.style.left = ev.clientX + 'px';
		span.setAttribute('class', 'browser-label');
		
		document.body.appendChild(span)
	});
	document.querySelector('#browser-pie-chart').addEventListener('mouseout', function(ev) {
		var span = document.querySelector('.browser-label');
		if(!span || !ev.target.matches('.label-text')) return;
		document.body.removeChild(span);
	});
	document.body.addEventListener('mousemove', function(ev) {
		var span = document.querySelector('.browser-label');
		if(!span) return;
		
		span.style.top = ev.clientY - 25 + 'px';
		span.style.left = ev.clientX + 'px';
	});
}

module.exports.update = update;
module.exports.make = make;
module.exports.width = resizeWidth;