var rem = require('../rem.js');
var d3 = require('d3');

var svg;
var data;
var yScale;
var yScaleAxis;
var yAxis;

var resizeWidth = function() {
	var width = document
	.querySelector('#page-views');

	if(!width) return 0;

	return (width
	.parentElement
	.getBoundingClientRect()
	.width);
}

var update = function(width, updatedData) {
	if(!data) return; 
	if(updatedData) data = updatedData;

	if(!data.length) return;
	
	var max = d3.max(data.map(d => d.hits));
	var tHeight = rem(13.5);
	var tWidth = width || resizeWidth();
	var yMargin = 40;
	var xMargin = 40;

	var xScale = d3.scaleLinear()
		.domain([0, data.length-1])
		.range([xMargin, tWidth - xMargin]);

	var xScaleAxis = d3.scaleTime()
		.domain([data[0].date, data.slice(-1)[0].date])
		.range([xMargin, tWidth - xMargin])
		.nice(data.length);

	var xAxis = d3.axisBottom()
		.scale(xScaleAxis)
		.tickFormat(function(d, i) {
			var date = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
			var month = d.toDateString().slice(4, 7);

			if(i === 0 || d.getDate() === 1) {
				return month + ' ' + date;
			} else {
				return date;
			}
		});	

	svg
		.style('width', tWidth + 'px')

	var line = svg
		.select('polyline')
		.transition()
		.attr('points', data.map((d, i) => {
			return xScale(i) + ',' + (tHeight - yScale(d.hits));
		}).join(' '));

	svg.select('.x-axis')
		.attr('class', 'axis x-axis')
		.call(xAxis)
		.transition()
		.attr('transform', `translate(0, ${tHeight-yMargin})`);
	svg.select('.x-axis-label')
		.transition()
		.attr('x', tWidth/2);

	svg.select('.y-axis-label')
		.transition()
		.attr('y', -tWidth + xMargin/2 + 3);

	svg.selectAll('.vertex')
		.data(data)
		.transition()
		.attr('cx', (d, i) => xScale(i))
		.attr('cy', d => tHeight - yScale(d.hits));
	svg.selectAll('.vertex-hidden')
		.data(data)
		.transition()
		.attr('cx', (d, i) => xScale(i))
		.attr('cy', d => tHeight - yScale(d.hits));
}
var make = function(ajaxData) {
	svg = d3.select('#page-views');

	data = ajaxData;

	if(!data.length) return;

	var max = d3.max(data.map(d => d.hits));
	var tHeight = rem(13.5);
	var tWidth = resizeWidth();
	var yMargin = 40;
	var xMargin = 40;

	function yAxisTicks() {
		var min = d3.min(data.map(d => d.hits));

		if(max-min < 10) {
			return max-min + 1;
		} else {
			return 5;
		}
	}

	yScale = d3.scaleLinear()
		.domain([0, max])
		.range([yMargin, tHeight - yMargin/2]);

	var xScale = d3.scaleLinear()
		.domain([0, data.length-1])
		.range([xMargin, tWidth - xMargin]);

	var xScaleAxis = d3.scaleTime()
		.domain([data[0].date, data.slice(-1)[0].date])
		.range([xMargin, tWidth - xMargin])
		.nice(data.length);

	yScaleAxis = d3.scaleLinear()
		.domain([0, max])
		.range([tHeight - yMargin/2, yMargin]);

	var xAxis = d3.axisBottom()
		.scale(xScaleAxis)
		.tickFormat(function(d, i) {
			var date = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
			var month = d.toDateString().slice(4, 7);

			if(i === 0 || d.getDate() === 1) {
				return month + ' ' + date;
			} else {
				return date;
			}
		});	

	yAxis = d3.axisLeft()
		.scale(yScaleAxis)
		.ticks(yAxisTicks())

	svg
		.style('width', tWidth + 'px')
		.style('height', yScale(max) + yMargin/2 + 'px');

	var line = svg
		.append('polyline')
		.attr('points', data.map((d, i) => {
			return xScale(i) + ',' + (tHeight - yScale(d.hits));
		}).join(' '));

	svg.append('g')
		.call(xAxis)
		.attr('transform', `translate(0, ${tHeight-yMargin})`)
		.attr('class', 'x-axis axis');
	svg.append('text')
		.text('Date')
		.attr('class', 'x-axis-label')
		.attr('y', tHeight - 8)
		.attr('x', tWidth/2)
		.style('text-anchor', 'middle')
		.style('font-weight', 400);

	svg.append('g')
		.call(yAxis)
		.attr('class', 'axis')
		.attr('transform', `translate(${xMargin}, ${-yMargin/2})`);
	svg.append('text')
		.text('Page views')
		.attr('class', 'y-axis-label')
		.attr('y', -tWidth + xMargin/2 + 3)
		.attr('x', tHeight/2)
		.attr('transform', 'rotate(90)')
		.style('text-anchor', 'middle')
		.style('font-weight', 400);

	var vertices = svg.selectAll('.vertices')
		.data(data)
		.enter()
		.append('g');

	vertices.append('circle')
		.attr('r', '3')
		.attr('class', 'vertex')
		.attr('cx', (d, i) => xScale(i))
		.attr('cy', d => tHeight - yScale(d.hits));

	vertices.append('circle')
		.attr('r', '15')
		.attr('class', 'vertex-hidden')
		.attr('data-index', (d, i) => i)
		.attr('cx', (d, i) => xScale(i))
		.attr('cy', d => tHeight - yScale(d.hits));


	document.querySelector('#page-views').addEventListener('mouseover', function(ev) {
		if(!ev.target.matches('.vertex-hidden')) return;
		
		var span = document.createElement('span');
		var g = ev.target.parentElement;
		var d = data[ev.target.getAttribute('data-index')];

		var date = d.date.getDate() < 10 ? '0' + d.date.getDate() : d.date.getDate();
		var month = d.date.toDateString().slice(4, 7);
		
		span.innerHTML = `${d.hits} page ${d.hits === 1 ? 'view' : 'views'}, ${month} ${date}`;
		span.style.top = ev.clientY - 25 + 'px';
		span.style.left = ev.clientX + 'px';
		span.setAttribute('class', 'vertex-label');
		
		document.body.appendChild(span)
		g.querySelector('.vertex').classList.add('vertex-hover');
	});
	document.querySelector('#page-views').addEventListener('mouseout', function(ev) {
		 var span = document.querySelector('.vertex-label');
		 var g = ev.target.parentElement;
		
		 if(!span || !ev.target.matches('.vertex-hidden')) return;
		
		document.body.removeChild(span);
		g.querySelector('.vertex').classList.remove('vertex-hover');
	});

	document.body.addEventListener('mousemove', function(ev) {
		var span = document.querySelector('.vertex-label');
		if(!span) return;
		
		span.style.top = ev.clientY - 25 + 'px';
		span.style.left = ev.clientX + 'px';
	});
}

module.exports.update = update;
module.exports.make = make;
module.exports.width = resizeWidth;