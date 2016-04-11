/*-------------------------------------------------------------------------------------------------
	Cycle Selector - radio buttons
-------------------------------------------------------------------------------------------------*/
var selected_cycle;

// $('#cycle_selector').click(function(){
// 	selected_cycle = $("input[type='radio'][name='cycle']:checked").val();
// 	console.log(selected_cycle);
// 	arrange_nodes(selected_cycle);
// });

//console.log(selected_cycle);

/*-------------------------------------------------------------------------------------------------
	D3 Code
-------------------------------------------------------------------------------------------------*/

var w = 900;
var h = 600;
var center = {x: w/2, y: h/2};

var layout_gravity = -0.1
var damper = 0.5

var nodes = [];
var vis, force, radius_scale;

var fill_color = d3.scale.ordinal()
                    .domain(["STARS AND WD",
                            "GALACTIC DIFFUSE EMISSION AND SURVEYS",
                            "WD BINARIES AND CV",
                            "BH AND NS BINARIES",
                            "SN, SNR AND ISOLATED NS",
                            "NORMAL GALAXIES: DIFFUSE EMISSION",
                            "NORMAL GALAXIES: X-RAY POPULATIONS",
                            "ACTIVE GALAXIES AND QUASARS",
                            "CLUSTERS OF GALAXIES",
                            "EXTRAGALACTIC DIFFUSE EMISSION AND SURVEYS",
                            "GALACTIC DIFFUSE EMISSION AND SURVEYS",
                            "SOLAR SYSTEM"])
                    .range(["#66c2a4",
                            "#8c96c6",
                            "#7bccc4",
                            "#fc8d59",
                            "#74a9cf",
                            "#67a9cf",
                            "#df65b0",
                            "#78c679",
                            "#41b6c4",
                            "#fe9929",
                            "#fd8d3c",
                            "#f768a1"]);

var svg = d3.select("#vis")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("class", "bubble")
            .attr("id", "svg_vis");


// Read data and attach to nodes
d3.json("/assets/nodeData.json", function(error, data) {
    nodes = data;

    var time_range = d3.extent(nodes, function(d){return d['time'];})
    radius_scale = d3.scale.linear().domain(time_range).range([3, 160])

    current_cycle = "15";
    make_nodes(current_cycle);

});


// make nodes
function make_nodes(cycle){
	var nodes_to_plot = [];

	//console.log(nodes.length)
	for (var i = 0; i < nodes.length; i++) {
		if (nodes[i]['cycle'] === cycle) { // check against selected cycles here
			nodes_to_plot.push(nodes[i]);
		};
		//console.log(cycle);
	};

    // select circles
	var circles = svg.selectAll("circle")
                    .data(nodes_to_plot); //bind data to nodes

    // enter data
    circles.enter()
            .append("circle")
            .attr("r", 0)
            .attr("fill", function(d) { return fill_color(d['category']) ;})
            .attr("stroke-width", 1.5)
            .attr("stroke", function(d) {return d3.rgb(fill_color(d['category'])).darker();});

    // display bubbles in svg
    circles.transition()
        .duration(2000)
        .attr("r", function(d){
            return radius_scale(d['time']);
        });

    // make tooltip info box
    circles.on("mouseover", function(d) {
            var xPosition = d.x;
            var yPosition = d.y;

            d3.select("#tooltip")
                .style("left", 700 + "px")
                .style("top", 430 + "px")
            d3.select("#prop_num").text(d['proposal_number'])
            d3.select("#pi").text(d['last'])
            d3.select("#title").text(d['title'])
            d3.select("#time").text(d['time'])
            d3.select("#type").text(d['type']);
            d3.select("#hbar")
                .style("background-color", function() {
                // console.log(d);
                return fill_color(d['category']) ;
            });
            d3.select("#category").text(d['category'])
            d3.select("#tooltip").classed("hidden", false);
        })
        .on("mouseout", function() {
            d3.select("#tooltip").classed("hidden", true);
        });

	start(nodes_to_plot);
	display_group_all(circles);
}

// remove the nodes
function remove_nodes(){
    console.log("remove_nodes called")
    svg.selectAll("circle")
        .transition()
        .duration(2000)
        .attr("cx", 2*w)
        .remove();
}


// Sets the "repulsion" between each node
function charge(d) {

    return -Math.pow(radius_scale(d['time']), 2/1.06);
}

// do the thing!
function start(nodes_to_plot) {
    force = d3.layout.force()
                .nodes(nodes_to_plot)
                .size([w, h]);
}

function display_group_all(circles) {
    force.gravity(layout_gravity)
        .charge(charge)
        .friction(0.8)
        .on("tick", function(e) {
            circles.each(move_towards_center(e.alpha))
                .attr("cx", function(d) {return d.x;})
                .attr("cy", function(d) {return d.y;});
        });
        force.start();
}

function move_towards_center(alpha) {
	return function(d) {
		d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
		d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
	};
}


d3.selectAll("button").on("click", function(){
    var buttonID = d3.select(this).attr("id")
    var clicked_cycle = buttonID.substring(5,7)

    remove_nodes();
    make_nodes(clicked_cycle);

})
