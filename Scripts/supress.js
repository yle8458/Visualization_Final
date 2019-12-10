var bardata = [];

d3.csv('Data/SuppCost.csv');

var height = 400,
	width = 600;
	
var tempColor; //created for changing colors using events
	
//color mapping; the bigger the value of the data, the more of 
//a particular color; in other words, the taller the data, the more
//pink in our case

var colors = d3.scaleLinear()
	//we like to have four colors
	.domain([0, bardata.length*.33, bardata.length*.66, bardata.length])
	.range(["#b58929", "#c61c6f", "#268bd2", "#85992c"]);
	
var yScale = d3.scaleLinear()
	.domain([0, d3.max(bardata)])
	.range([0, height]);
	
var xScale = d3.scaleBand()
	.domain(d3.range(0, bardata.length))
	.range([0, width])
	.paddingInner(0.2)
	.paddingOuter(0.2);

var tooltip = d3.select('body').append('div')
	.style("position", "absolute")
	.style("padding", "0px 10px")
	.style("background", "white")
	.style("opacity", 0); //don't show initially
	
var myChart = d3.select("#chart").append("svg")
	.attr('width', width)
	.attr("height", height)
	.style("background", "#c9d7d6")
		.selectAll("rect").data(bardata)
			.enter().append("rect")
				.style("fill", function(d,i){
					return colors(i);
				})
				.attr("width", xScale.bandwidth())
				.attr("height", 0) //change value to 0
				.attr("x", function(d,i){
					return xScale(i);
				})
				.attr("y", height) //change value to height
		
		//adding events to the #chart
		.on('mouseover', function(d){
			tooltip.transition()
				.style('opacity', 0.9)
			tooltip.html(d)
				.style("left", (d3.event.pageX -35) + 'px')
				.style("top", (d3.event.pageY - 30) + 'px')
			console.log(d3.event.pageX);
			console.log(d3.event.pageY);
			
			tempColor = this.style.fill;
			d3.select(this)
				.style('opacity', .5)
				.style('fill', 'yellow')
		})
		.on('mouseout', function(d){
			d3.select(this)
				.style('opacity', 1)
				.style('fill', tempColor)
		})				

myChart.transition() //assigning transition to the entire chart
	.attr("height", function(d){
		return yScale(d);
	})
	.attr("y", function(d){
		return height - yScale(d);
	})
	.delay(function(d, i){
		return i*50;
	})
	.duration(1000)
	.ease(d3.easeElastic)