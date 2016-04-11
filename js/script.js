/**
 * Created by consensus on 4/6/14.
 */
var worldData, chandraData, observationData, globePaths, rotating, currentStarCycle, currentScale = 800, m0, m1, delta = [],c0 = [0,0];

var world = {width:200,height:200,scale:100}
var star = {width:900, height:480, scale: currentScale}
var cycle = {width: 400, height:700}

var all_times = [];





// cycles svg

// world svg
var cycleSvg = d3.select('#vis').append('svg')
		.attr('width', cycle.width)
		.attr('height', cycle.height)
		.attr('class','cycle');

// latitudinal and longitudinal lines
var graticule = d3.geo.graticule();

// scales
var lonScale = d3.scale.linear()
    .domain([0, world.width])
    .rangeRound([-180, 180]);

var latScale = d3.scale.linear()
    .domain([0, world.height])
    .rangeRound([90, -90]);

// World Projection
var worldProjection = d3.geo.orthographic()
    .scale(world.scale)
    .translate([world.width/2,world.height/2])
    .rotate(c0)
    .clipAngle(90)
    .precision(.1)

// world path
var worldPath = d3.geo.path().projection(worldProjection);

// world svg
var worldSvg = d3.select('#vis').append('svg')
		.attr('width', world.width)
		.attr('height', world.height)
		.attr('class','world');

// world group
var worldGroup = worldSvg.append('g')
		.classed('world-group', true);

// world defs
var worldDefs = worldGroup.append('defs');

	worldDefs.append('path')
    .datum({type: 'Sphere'})
    .attr('id', 'world-path')
    .attr('d', worldPath);

	worldGroup.append('use')
    .attr('class', 'world-path-stroke')
    .attr('xlink:href', '#world-path');

// add longitude,latitude
worldGroup.append('path')
    .datum(graticule)
    .attr('class', 'graticule')
    .attr('d', worldPath);

// World Projection
var starProjection = d3.geo.orthographic()
    .scale(star.scale)
    .translate([star.width/2,star.height/2])
    // .rotate(c0)
    .clipAngle(90)
    .precision(.1);

var starPath = d3.geo.path().projection(starProjection).pointRadius(3);

var starSvg = d3.select('#vis').append('svg')
		// .attr('width', star.width)
		// .attr('height', star.height)
		.attr('class','stars');

var starGroup = starSvg.append('g')
		.classed('star-group', true);

// world defs  !to be removed!
var starDefs = starGroup.append('defs');

starDefs.append('path')
    .datum({type: 'Sphere'})
    .attr('id', 'star-path')
    .attr('d', starPath);

starGroup.append('use')
    .attr('class', 'star-path-stroke')
    .attr('xlink:href', '#star-path');

// add longitude,latitude
starGroup.append('path')
    .datum(graticule)
    .attr('class', 'star-graticule')
    .attr('d', starPath);

var starsGroup = starSvg.append('g')
		.classed('stars-group', true);

// world svg
var overlaySvg = d3.select('#vis').append('svg')
		.attr('width', 64)
		.attr('height', 230)
		.attr('class','arc-arrow');

overlaySvg.append('path')
    .attr('d','M 50,16 A -30,111 0 1,0 50,216')
    .style('stroke-width', 1)
    .style('stroke', '#fff')
    .style('fill', 'none');

overlaySvg.append('circle')
		.attr({
			cx: 7,
			cy: 116,
			r: 3,
			'class':'view',
			'fill': '#fff'
		});

overlaySvg.append('circle')
		.attr({
			cx: 46,
			cy: 116,
			r: 3,
			'class':'person',
			'fill': '#fff'
		});

overlaySvg.append('defs')
		.append('marker')
		.attr({
			'id': 'markerArrow',
			'refX': 4,
			'refY': 2,
			'markerWidth': 6,
			'markerHeight': 4,
			'orient':'auto',
			'fill':'#fff'
		})
		.append('path')
		.attr('d','M 0,0 V 4 L6,2 Z');

overlaySvg.append('line')
		.attr({
			x1: 46,
			y1: 116,
			x2: 14,
			y2: 116,
			'class':'person',
			'stroke': '#fff',
			'fill': 'none',
			'marker-end': 'url(#markerArrow)'
		});
////// Rotate functions

var moveDelta = function(ch){
	if (ch) {
		// globe
		var cd0 = c0[0] - ch[0];
		var cd1 = c0[1] - ch[1];
		// stars
		var s0 = ch[0] - c0[0];
		var s1 = c0[1] - ch[1];
		moveTo([cd0,cd1],[s0,s1]);
	}
}
var moveTo = function(gCoords,sCoords){
	if (!gCoords || !sCoords) return;
	// world coords
	worldProjection.rotate(gCoords);
	globePaths.attr('d', worldPath);
	// star coords
	starProjection.rotate(sCoords);
	starPaths.attr('d', starPath);
	c0 = gCoords;
}
var mouseDown = function(){
	rotating = true;
	var mouse = d3.mouse(this);
	m0 = [latScale(mouse[0]),lonScale(mouse[1])];
}
var mouseMove = function(){
	if (rotating) {
		var mouse = d3.mouse(this);
		m1 = [latScale(mouse[0]),lonScale(mouse[1])];
		if (m0[0] != m1[0] || m0[1] != m1[1]) {
			delta[0] = m1[0]-m0[0];
			delta[1] = m1[1]-m0[1];
			moveDelta(delta);
		}
		m0 = m1;
	}
}
var mouseUp = function(){
	rotating = false;
}

d3.selectAll('#vis').append('button').attr('class','click-button').text('reset').on('click', function(){
	var coords = [0,0];
	moveTo(coords,coords);
});
////// end rotate functions

worldSvg.on('mousedown', mouseDown)
		.on('mousemove', mouseMove)
		.on('mouseup', mouseUp)
		.on('mouseout', mouseUp);

d3.json('../assets/world.json',function(error,data){
	if (error) {
		console.log(error);
	}
	worldData = data;

	// display world data
	worldGroup.append('path')
	    .datum(topojson.feature(worldData, worldData.objects.land))
      .attr('class', 'country')
      .attr('d', worldPath);

	worldGroup.append('path')
	    .datum(topojson.mesh(worldData, worldData.objects.countries))
      .attr('class', 'boundary')
      .attr('d', worldPath);

	globePaths = worldSvg.selectAll('path');
	loadChandraData();
});

var loadChandraData = function(){
	d3.json('../assets/chandraData.json',function(error,data){
		if (error) {
			console.log(error);
		}
		chandraData = data;
		loadObservationData();
	});
}

var loadObservationData = function(){
	d3.json('../assets/observationData.json',function(error,data){
		if (error) {
			console.log(error);
		}
		observationData = data;
		buildStarMap();

    build_bubble_chart();
	});
}

/* ****
Add Katy JS below here
* *****/

var vis, force, radius_scale;

var fill_color = d3.scale.ordinal()
    .domain(['STARS AND WD',
      'GALACTIC DIFFUSE EMISSION AND SURVEYS',
      'WD BINARIES AND CV',
      'BH AND NS BINARIES',
      'SN, SNR AND ISOLATED NS',
      'NORMAL GALAXIES: DIFFUSE EMISSION',
      'NORMAL GALAXIES: X-RAY POPULATIONS',
      'ACTIVE GALAXIES AND QUASARS',
      'CLUSTERS OF GALAXIES',
      'EXTRAGALACTIC DIFFUSE EMISSION AND SURVEYS',
      'GALACTIC DIFFUSE EMISSION AND SURVEYS',
      'SOLAR SYSTEM'])
    .range(['#66c2a4','#8c96c6','#7bccc4','#fc8d59','#74a9cf','#67a9cf','#df65b0','#78c679','#41b6c4','#fe9929','#fd8d3c','#f768a1']);


function build_bubble_chart() {

  for (var key in chandraData.nameKey) {
    all_times.push(parseInt(chandraData.nameKey[key].approved_exposure_time));
  }
  console.log(all_times)
  time_extent = d3.extent(all_times);
  console.log(time_extent);

//    all_times.push(chandraData.cycles[i].approved_exposure_time);
//  console.log(all_times);
  make_nodes(1);
}

var layout_gravity = -0.1;
var damper = 0.5;
var friction = 0.8;
var center = {x: cycle.width /2, y: cycle.height /2};
var drawTime = 750;

function redraw_nodes(currentCycle) {
  remove_nodes();
  setTimeout(function() {
   	make_nodes(currentCycle);
  }, drawTime + 100);
}

var cycleName = cycleSvg.append('foreignObject')
    .attr('width',200)
    .attr('height',20)
  	.classed('foreign-object-cyclename', true)
    .append("xhtml:body")
    .append('div')
    .classed('cycle-name', true);

function make_nodes(currentCycle) {
	currentStarCycle = currentCycle;
	cycleName.text('current cycle:'+ currentStarCycle);
  var time_range = d3.extent(chandraData.cycles[currentCycle], function(d) {
    return (parseInt(d.approved_exposure_time));
  });
  radius_scale = d3.scale.linear().domain(time_extent).range([3,125]);

  var charge = function(d) {
    return -Math.pow(radius_scale(d.approved_exposure_time), 2/1.06);
  }

  var move_towards_center = function (alpha) {
    return function(d) {
      d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
      d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
    }
  }

  //console.log(chandraData.cycles[currentCycle].length);

  var count =0;
  var counter = function() {
    count++;
    return 'circle';
  }
  var circles = cycleSvg.selectAll('circle')
        .data(chandraData.cycles[currentCycle])
        .enter()
        .append('circle')
        .attr('r',0)
        .attr('fill', function(d) {
          count++;
          return fill_color(d.category_descrip)})
        .attr('stroke-width', 0)
        .attr('class',function(d){
        	return 'cycle-'+currentCycle;
        })
        .attr('stroke', function(d) {return d3.rgb(fill_color(d.category_descrip)).darker();})
        .on('mouseover',function(d) {
          //console.log(proposal_data);
          // var xPosition = d.coords[0];
          // var yPosition = d.coords[1];
          d3.select('#tooltip-target')
                .text(d['targname']);
          d3.select('#tooltip-prop-num')
                .text(d['proposal_number']);
          d3.select('#tooltip-pi')
                .text(d['last']);
          d3.select('#tooltip-category')
                .text(d['category_descrip']);
          d3.select('#tooltip-time')
                .text(d['approved_exposure_time']);
          d3.select('#tooltip-abstract')
                .text(d['abstract']);
          d3.select('#tooltip').classed('hidden', false);
          //console.log(d.proposal_number);

          d3.select('#tooltip');
          d3.select('#prop_num').text(d.proposal_number);

        })
        .on('mouseout', function() {
          d3.select('#tooltip').classed('hidden', true);
        })
        .on('click', function(d){
          var currentCycle = d.proposal_number.substring(0, 2);
          if (currentCycle.length == 1) {
            currentCycle = '0' + currentCycle;
          }
          d3.selectAll('.star-point.cycle-' + currentCycle)
                .style('fill', 'red')

          console.log(currentCycle);
        });



//console.log(count);
  circles.transition()
        .duration(1000)
        .attr('r', function(d) {
          return radius_scale(d.approved_exposure_time);
        });

  var force = d3.layout.force()
        .nodes(chandraData.cycles[currentCycle])
        .size([cycle.width,cycle.height]);

  force.gravity(layout_gravity)
        .charge(charge)
        .friction(friction)
        .on('tick', function(e) {
          // this is to force them to settle sooner.
          // tooltips aren't viewable until the force has stopped,
          // this is usually when force.alpha() == 0;
          if (force.alpha() < .045) {
            force.stop();
          }
          circles.each(move_towards_center(e.alpha))
                .attr('cx', function(d) { return d.x;})
                .attr('cy', function(d) { return d.y;});
        });

  force.start();
}

function remove_nodes() {
  cycleSvg.selectAll('circle')
        .transition()
        .duration(drawTime)
        .attr('cx', 2 * cycle.width)
        .remove();
}

var buildStarMap = function(){
	console.log(chandraData);
	//console.log(observationData);

	// star points
	var circles = starsGroup.selectAll('path')
			.data(chandraData.geoCoords)
			.enter()
			.append('svg:path')
			.attr('class', function(d,i){
				var addClass = 'star-point';
				var cycle = d.properties.proposal_number.substring(0, 2);
				if (cycle.length == 2) {
					addClass +=' cycle-'+cycle;
				}
				return addClass;
			})
			.attr('d', starPath)
			.on('mouseover', function(d){
        var proposal_data = chandraData.nameKey[d['properties']['name']];
				//console.log(proposal_data);
        // var xPosition = d.coords[0];
        // var yPosition = d.coords[1];
        d3.select('#tooltip-target')
          .text(proposal_data['targname']);
        d3.select('#tooltip-prop-num')
          .text(proposal_data['proposal_number']);
        d3.select('#tooltip-pi')
        	.text(proposal_data['last']);
        d3.select('#tooltip-category')
        	.text(proposal_data['category_descrip']);
        d3.select('#tooltip-time')
        	.text(proposal_data['approved_exposure_time']);
        d3.select('#tooltip-abstract')
        	.text(proposal_data['abstract']);
        d3.select('#tooltip').classed('hidden', false);
			})
			.on('mouseout', function(d){
        d3.select('#tooltip').classed('hidden', true);
			})
			.on('click', function(d){
				d3.selectAll('.star-point')
              .style('fill', '#e3d326');
        var newCycle = parseInt(d.properties.proposal_number.substring(0, 2));
				if (newCycle == currentStarCycle) return;
				redraw_nodes(newCycle);
			});

	starPaths = starSvg.selectAll('path');
}

// scale controls
var controls = starSvg.append('foreignObject')
    .attr('width',40)
    .attr('height',80)
  	.classed('foreign-object-controls', true)
    .append("xhtml:body")
    .append('div')
    .classed('controls', true);

var buildStars = function(newScale){
	starProjection.scale(newScale);
	starPaths.attr('d', starPath);
}
var scaleUp = function(){
	if (currentScale >= 2000) return;
	var newScale = currentScale+100;
	currentScale = newScale;
	buildStars(newScale);
}
var scaleDown = function(){
	if (currentScale <= 800) return;
	var newScale = currentScale-100;
	currentScale = newScale;
	buildStars(newScale);
}
var zoomIn = controls.append('div')
    .classed('scale-up', true)
    .text('+')
    .on('click', scaleUp);
var zoomOut = controls.append('div')
    .classed('scale-down', true)
    .text('-')
    .on('click', scaleDown);
