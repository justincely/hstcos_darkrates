var width = 960;
var height = 960;

var xScale = d3.scaleLinear()
.domain([-180, 180])
.range([0, width]);

var yScale = d3.scaleLinear()
.domain([-90, 90])
.range([height, 0]);

var cScale = d3.scaleLinear()
.domain([0, .0008])
.range(['blue', 'red'])

//var svg = d3.select("body").select("div").append("svg")
//    .attr("width", width)
//    .attr("height", height);

var svg = d3.select("#canvas")

var projection = d3.geoMercator()
.scale((width - 3) / (2 * Math.PI))
.translate([width / 2, height / 2]);

var path = d3.geoPath()
.projection(projection);

var graticule = d3.geoGraticule();

svg.append("defs").append("path")
.datum({type: "Sphere"})
.attr("id", "sphere")
.attr("d", path);

svg.append("use")
.attr("class", "stroke")
.attr("xlink:href", "#sphere");

svg.append("use")
.attr("class", "fill")
.attr("xlink:href", "#sphere");

svg.append("path")
.datum(graticule)
.attr("class", "graticule")
.attr("d", path);

function update(data) {
  // Scale the range of the data
  cScale.domain(d3.extent(data, function(d) { return d.dark; }));

  var canvas = svg.selectAll(".dot")
  .data(data);

  canvas.attr("class", "update")

  circles = canvas.enter().append("circle")
  .attr('fill', function(d) { return cScale(d.dark); })
  .attr('fill-opacity', .5)
  .attr("r", 1.5)
  .attr("cx", function(d) { return xScale(d.longitude); })
  .attr("cy", function(d) { return yScale(d.latitude); });

  d3.select("#opacity")
  .on("click", function(d, i) {
    circles.transition()
    .duration(2000)
    .delay(1000)
    .style("opacity", document.getElementById("num").value)
  });

  canvas.exit().remove();
}

d3.json("https://unpkg.com/world-atlas@1/world/50m.json", function(error, world) {
  if (error) throw error;

  svg.insert("path", ".graticule")
  .datum(topojson.feature(world, world.objects.land))
  .attr("class", "land")
  .attr("d", path);

  svg.insert("path", ".graticule")
  .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
  .attr("class", "boundary")
  .attr("d", path);
});

d3.json("./js/orbital_info.json", function(error, data) {
  if (error) throw error;

  // Filter/modify data if necessary
  data.forEach(function(d) {
    //Re-center around the map
    d.longitude = d.longitude > 180 ? +d.longitude - 360 : +d.longitude;
    d.latitude = +d.latitude;

  });

update(data);

});
