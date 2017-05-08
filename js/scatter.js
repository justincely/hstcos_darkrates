var margin = {top: 20, right: 20, bottom: 30, left: 60},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scaleLinear()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

var ySol = d3.scaleLinear()
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

var ySolAxis = d3.axisRight()
    .scale(ySol);

// Load the orbital info stuff
d3.json("./js/orbital_info.json", function(error, data) {
  if (error) throw error;

  // Filter/modify data if necessary
  data.forEach(function(d) {
    //Re-center around the map
    d.date = +d.date
    d.dark = +d.dark
    d.fsol = +d.fsol
  });

  update(data);

});

function update(data) {
  x.domain(d3.extent(data, function(d) { return +d.date; })).nice();
  y.domain(d3.extent(data, function(d) { return +d.dark; })).nice();
  ySol.domain(d3.extent(data, function(d) { return +d.fsol; })).nice();

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
      .attr("y", 6)
      .attr("dy", ".71em")
      .attr("fill", "black")
      .style("text-anchor", "end")
      .text("Dark Rate")

  scattersvg.append("g")
      .attr("class", "y axis")
      .call(ySolAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "translate(35, 0)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .attr("fill", "orange")
      .style("text-anchor", "end")
      .text("F10.7")

  scattersvg.append("g").selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", function(d) { return x(+d.date); })
      .attr("cy", function(d) { return y(+d.dark); })
      .style("fill", function(d) { return color(+d.dark); });

    scattersvg.append("g").selectAll("circle")
          .data(data)
        .enter().append("circle")
          .attr("r", 3.5)
          .attr("cx", function(d) { return x(+d.date); })
          .attr("cy", function(d) { return ySol(+d.fsol); })
          .style("fill", "orange");

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

};

// Select only specific detector data.
d3.select("#detector").on("click", function(d, i) {

  minDark = +document.getElementById("dark-min").value;
  maxDark = +document.getElementById("dark-max").value;

  y.domain([minDark, maxDark]).nice();

  newDetector = document.getElementById("detector").value;
  pointsize = +document.getElementById("pointsize").value;

  scattersvg.selectAll("circle").transition()
    .duration(2000)
    .delay(500)
    .attr('r', function(d, i) {
      if (newDetector == "BOTH") {
        return 3.5;
      } else if (d.detector == newDetector) {
        return 3.5;
      }
      return 0
    })
  });
