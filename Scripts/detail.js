var margin = {left:80, right:20, top:50, bottom:100};

//chart dimensions
var height = 600 - margin.top - margin.bottom,
	width = 800 - margin.left - margin.right;
	
var canvas = d3.select("#detail-chart")
	.append("svg")
		.attr("width", width+margin.left+margin.right)
		.attr("height", height+margin.top+margin.bottom)
	.append("g")
		.attr("transform", "translate(" +margin.left+ ", " +margin.top+ ")");
		
var year = 2010; 
var interval;
var data;

var target = 'structure';
var xAxisCall;
var yAxisCall;

var max_value = {'person' : 0, 
				 'structure_destroyed' : 0,
				 'structure_threatened' : 0,
				 'number_of_fires' : 0,
				 'acres' : 0}

//tooltip
var tip = d3.tip().attr("class", "d3-tip")
	.html(function(d){
		var text = "<strong>State:</strong> <span style='color:red;'>"
			       + d.State + "</span><br />";
			text += "<strong>Recidences Destroyed:</strong> <span style='color:red;'>"
			       + d3.format(",.0f")(d.residences_destroyed) + "</span><br />";
			text += "<strong>Recidences Threatened:</strong> <span style='color:red;'>"
			       + d3.format(",.0f")(d.residences_threatened) + "</span><br />";	 
			text += "<strong>Other Structures Destroyed:</strong> <span style='color:red;'>"
			       + d3.format(",.0f")(d.other_destroyed) + "</span><br />";
			text += "<strong>Other Structures Threatened:</strong> <span style='color:red;'>"
			       + d3.format(",.0f")(d.other_threatened) + "</span><br />";	
			text += "<strong>Total Burned:</strong> <span style='color:red;'>"
			       + d3.format(",.2f")(d.acres) + "acres" + "</span><br />";
			text += "<strong>Total number of Fires:</strong> <span style='color:red;'>"
			       + d3.format(",.0f")(d.number_of_fires) + "</span><br />";
		return text;
	});
	
canvas.call(tip);

d3.select(".d3-tip").style("background-color", '#EB8F7B');

// Initialized x and y scale
var x = d3.scaleLinear()
		.domain([0, 5000])
		.range([0, width]);
		
var	y = d3.scaleLinear()
		.domain([0, 1000])
		.range([height, 0]);

var area = d3.scaleLinear()
		.domain([100, 1000000])
		.range([25*Math.PI, 1500*Math.PI]);

var stateColor = d3.scaleOrdinal(d3.schemePastel1);

//labels
var xLabel = canvas.append("text")
	.attr("y", height+50)
	.attr("x", width/2)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Number of Fires");

var yLabel = canvas.append("text")
	.attr("y", -40)
	.attr("x", -170)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text(function() {
		if (target == 'person'){
			return "Fatalities and Injuires"
		} else {
			return "Total Structure Destroyed"
		}
	});
	
var timeLabel = canvas.append("text")
	.attr("y", 50)
	.attr("x", width-40)
	.attr("font-size", "40px")
	.attr("opacity", "0.4")
	.attr("text-anchor", "middle")
	.text("2010");


//Initialized x and y axis	
var xAxisCall = d3.axisBottom(x)
	.tickFormat(function(d){ return +d });
	
var yAxisCall = d3.axisLeft(y)
	.tickFormat(function(d){ return +d });
	
canvas.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0, " +height+ ")")
	.call(xAxisCall);
		
canvas.append("g")
	.attr("class", "y axis")
	.call(yAxisCall);
		
		
//read in the data and clean and process it
d3.json("Data/damage.json").then(function(input){
	//scales
	data = input;
	var cur_max_p = 0;
	var cur_max_sd = 0;
	var cur_max_st = 0;
	var cur_max_n = 0;
	var cur_max_a = 0;
	
	// Update the max_value
	for (yr = 2010; yr < 2019; yr++) {
		cur_max_p = d3.max(input[yr], function(d) { return (+d.fatalities) + (+d.injuries)});
		if (max_value['person'] < cur_max_p) { max_value['person'] = cur_max_p};
		cur_max_sd = d3.max(input[yr], function(d) { return (+d.residences_destroyed) + (+d.other_destroyed)});
		if (max_value['structure_destroyed'] < cur_max_sd) { max_value['structure_destroyed'] = cur_max_sd}
		cur_max_st = d3.max(input[yr], function(d) { return (+d.residences_threatened) + (+d.other_threatened)});
		if (max_value['structure_threatened'] < cur_max_st) { max_value['structure_threatened'] = cur_max_st}
		cur_max_n = d3.max(input[yr], function(d) { return (+d.number_of_fires)});
		if (max_value['number_of_fires'] < cur_max_n) { max_value['number_of_fires'] = cur_max_n};
		cur_max_a = d3.max(input[yr], function(d) { return (+d.acres)});
		if (max_value['acres'] < cur_max_a) { max_value['acres'] = cur_max_a};
	}
	
	
	x = d3.scaleLinear()
		.domain([0, max_value['number_of_fires']])
		.range([0, width]);
	
	y = d3.scaleLinear()
		.domain([-0.1 * max_value[target], max_value[target]])
		.range([height, 0]);
		
	//console.log(data);
	update(data[2010], 'person');
	
}) //d3.json


$("#target-select")
	.on("change", function(){
		update(data[year], $('#target-select').val());
	});

$("#date-slider").slider({
	max: 2018,
	min: 2010,
	step: 1,
	slide: function(event,ui){
		year = ui.value;
		update(data[year], $('#target-select').val());
	}
})




function update(cur_data,target_val) {
	//standard transition time for the visualization
	var t = d3.transition().duration(100);
	//console.log(cur_data);
	console.log(target_val);
	// Update y label
	yLabel.text(function() {
		if (target_val == 'person'){
			return "Fatalities and Injuires" ;
		} else if (target_val == 'structure_destroyed') {
			return "Total Structure Destroyed" ;
		} else if (target_val == 'structure_threatened') {
			return "Total Structure Threatened" ;
		} else {
			return "Unknown";
		}
	});
	
	
	//update x and y scale
	x = d3.scaleLinear()
		.domain([0, max_value['number_of_fires']])
		.range([0, width]);
	
	var data_max = d3.max(cur_data, function(d){
		if (target_val == 'person') { 
			return (+d.fatalities) + (+d.injuries) ;
		} else if (target_val == 'structure_destroyed') {
			return (+d.residences_destroyed) + (+d.other_destroyed) ;
		} else if (target_val == 'structure_threatened') {
			return (+d.residences_threatened) + (+d.other_threatened) ;
		} else {
			return 0;
		}
	});
	console.log(data_max)
	
	y = d3.scaleLinear()
		//.domain([-0.1 * max_value[target_val], max_value[target_val]])
		.domain([-0.1 * data_max, data_max])
		.range([height, 0]);
		
	
	area = d3.scaleLinear()
		.domain([0, max_value['acres']])
		.range([25*Math.PI, 1500*Math.PI]);
	
		
	
	//update x and y axis
	xAxisCall.scale(x)
	yAxisCall.scale(y)
	
	if (target_val != 'person') {
		yAxisCall.tickFormat(d3.formatPrefix(".1", 1e3));
	} else {
		yAxisCall.tickFormat(function(d){ return +d });
	}
	
	d3.select(".x")
		.call(xAxisCall);

		
	d3.select(".y")
		.call(yAxisCall);

	//Update tips
	if (target_val == 'person'){
		tip.html(function(d){
			var text = "<strong>State:</strong> <span style='color:red;'>"
			       + d.State + "</span><br />";
				text += "<strong> Fatalities:</strong> <span style='color:red; text-transform: capitalize;'>"
					   + d3.format(",.0f")(d.fatalities) + "</span><br />";
				text += "<strong>Injuries:</strong> <span style='color:red;'>"
					   + d3.format(",.0f")(d.injuries) + "</span><br />";
				text += "<strong>Total Burned:</strong> <span style='color:red;'>"
					   + d3.format(",.2f")(d.acres) + "acres" + "</span><br />";
				text += "<strong>Total number of Fires:</strong> <span style='color:red;'>"
					   + d3.format(",.0f")(d.number_of_fires) + "</span><br />";
			return text;
		});	
	} else if (target_val == 'structure_destroyed') {
		tip.html(function(d){
			var text = "<strong>State:</strong> <span style='color:red;'>"
					   + d.State + "</span><br />";
				text += "<strong>Recidences Destroyed:</strong> <span style='color:red;'>"
					   + d3.format(",.0f")(d.residences_destroyed) + "</span><br />";
				text += "<strong>Other Structures Destroyed:</strong> <span style='color:red;'>"
					   + d3.format(",.0f")(d.other_destroyed) + "</span><br />";
				text += "<strong>Total Burned:</strong> <span style='color:red;'>"
					   + d3.format(",.2f")(d.acres) + "acres" + "</span><br />";
				text += "<strong>Total number of Fires:</strong> <span style='color:red;'>"
					   + d3.format(",.0f")(d.number_of_fires) + "</span><br />";
			return text;
		});
		
	} else if (target_val == 'structure_threatened') {
		tip.html(function(d){
			var text = "<strong>State:</strong> <span style='color:red;'>"
					   + d.State + "</span><br />";
				text += "<strong>Recidences Threatened:</strong> <span style='color:red;'>"
					   + d3.format(",.0f")(d.residences_threatened) + "</span><br />";	 
				text += "<strong>Other Structures Threatened:</strong> <span style='color:red;'>"
					   + d3.format(",.0f")(d.other_threatened) + "</span><br />";
				text += "<strong>Total Burned:</strong> <span style='color:red;'>"
					   + d3.format(",.2f")(d.acres) + "acres" + "</span><br />";
				text += "<strong>Total number of Fires:</strong> <span style='color:red;'>"
					   + d3.format(",.0f")(d.number_of_fires) + "</span><br />";
			return text;
		});
		
	} else {
		tip.html("Unknown")
	}
	
				
	//JOIN new data with old elements
	var circles = canvas.selectAll("circle")
		.data(cur_data, function(d){ return d.State});
		
	//EXIT old elements not present in our new data
	circles.exit()
		.attr("class", "exit") //not really needed; just for looks
		.remove();
	
	//ENTER new elements present in new data
	circles.enter()
		.append("circle")
			.attr("class", "bubbles") //not really needed; just for looks
			.attr("fill", function(d){
				return stateColor(d.State);
			})
			.on("mouseover", tip.show)
			.on("mouseout", tip.hide)
			.merge(circles)
			.transition(t)
				.attr("cy", function(d){ 
					//console.log(d)
					if (target_val == 'person') { 
						return y((+d.fatalities) + (+d.injuries)) ;
					} else if (target_val == 'structure_destroyed') {
						return y((+d.residences_destroyed) + (+d.other_destroyed)) ;
					} else if (target_val == 'structure_threatened') {
						return y((+d.residences_threatened) + (+d.other_threatened)) ;
					} else {
						return 0;
					}
					
				})
				.attr("cx", function(d){ return x(d.number_of_fires); })
	.attr("r", function(d){ return Math.sqrt(area(+d.acres)/Math.PI); })
				
	//update the time label
	timeLabel.text(+(year));
	
	//update the slider
	$("#year")[0].innerHTML = +(year);
	$("#date-slider").slider("value", +(year));
	
} //update


