var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    
var x = d3.scaleLinear()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

var color = d3.scaleLinear()
  .domain([0, 5e-6])
  .range(['cyan', 'darkred'])
  
var scattersvg = d3.select("#scatter")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var xAxis = d3.axisBottom()
    .scale(x);

var yAxis = d3.axisLeft()
    .scale(y);

// Load the orbital info stuff
d3.json("./js/orbital_info.json", function(error, data) {
  if (error) throw error;

  // Filter/modify data if necessary
  data.forEach(function(d) {
    //Re-center around the map
    d.date = +d.date
    d.dark = +d.dark
  });

  x.domain(d3.extent(data, function(d) { return +d.date; })).nice();
  y.domain(d3.extent(data, function(d) { return +d.dark; })).nice();

  
  scattersvg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .attr("fill", "black")
      .style("text-anchor", "end")
      .text("Decimal Year (year)");

  scattersvg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .attr("fill", "black")
      .style("text-anchor", "end")
      .text("Dark Rate (counts/sec/pixel)")

  scattersvg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", function(d) { return x(+d.date); })
      .attr("cy", function(d) { return y(+d.dark); })
      .style("fill", function(d) { return color(+d.dark); });

      /*
  var legend = scattersvg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });
    */

});

d3.select("#dark-min").on("input", function(d, i) {
  newVal = +this.value;
  d3.select("#darkrate-min-value").text(newVal);

  scattersvg.selectAll("circle").transition()
    .duration(2000)
    .delay(500)
    .attr('r', function(d, i) {
      if (+d.dark <= newVal) {
        return 0;
      }
      return +document.getElementById("pointsize").value;
    });
});

// Sekect only FUVB data.
d3.select("#FUVB").on("click", function(d, i) {
  scattersvg.selectAll("circle").transition()
    .duration(2000)
    .delay(500)
    .attr('r', function(d, i) {
      if (d.detector == "FUVB") {
        return +document.getElementById("pointsize").value;
      }
      return 0
    });
});

// Sekect only FUVA data.
d3.select("#FUVA").on("click", function(d, i) {
  scattersvg.selectAll("circle").transition()
    .duration(2000)
    .delay(500)
    .attr('r', function(d, i) {
      if (d.detector == "FUVA") {
        return +document.getElementById("pointsize").value;
      }
      return 0
    });
});