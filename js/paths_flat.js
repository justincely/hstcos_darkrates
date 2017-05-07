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
var scattersvg = d3.select("#scatter")

var projection = d3.geoMercator()
  .scale((width - 3) / (2 * Math.PI))
  .translate([width / 2, height / 2]);

var path = d3.geoPath()
  .projection(projection);

var graticule = d3.geoGraticule();

svg.append("defs").append("path")
  .datum({
    type: "Sphere"
  })
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
  cScale.domain(d3.extent(data, function(d) {
    return d.dark;
  }));

  var canvas = svg.selectAll(".dot")
    .data(data);

  canvas.attr("class", "update")

  darkrate = canvas.enter().append("g").append("circle")
    .attr('fill', function(d) {
      return cScale(d.dark);
    })
    .attr('fill-opacity', .5)
    .attr("r", 1.5)
    .attr("cx", function(d) {
      return xScale(d.longitude);
    })
    .attr("cy", function(d) {
      return yScale(d.latitude);
    })
    .merge(canvas);

  solar = canvas.enter().append("g").append("circle")
    .attr('fill', "orange")
    .attr('fill-opacity', .2)
    .attr("r", 1)
    .attr("cx", function(d) {
      return xScale(d.sun_lon);
    })
    .attr("cy", function(d) {
      return yScale(d.sun_lat);
    })
    .merge(canvas);

  // click to sub-solar coordinates
  d3.select("#relative").on("click", function() {
    darkrate.transition()
      .duration(2000)
      .delay(500)
      .attr("cx", function(d) {
        return xScale(rescale(d))
      })
      .attr("cy", function(d) {
        return yScale(d.latitude - d.sun_lat)
      });

    solar.transition()
      .duration(2000)
      .delay(500)
      .attr("cx", xScale(0))
      .attr("cy", yScale(0))
  })

  // click to default coordinates
  d3.select("#native").on("click", function() {
    darkrate.transition()
      .duration(2000)
      .delay(500)
      .attr("cx", function(d) {
        return xScale(d.longitude);
      })
      .attr("cy", function(d) {
        return yScale(d.latitude);
      })

    solar.transition()
      .duration(2000)
      .delay(500)
      .attr("cx", function(d) {
        return xScale(d.sun_lon);
      })
      .attr("cy", function(d) {
        return yScale(d.sun_lat);
      })

  })

  // Opacity selection
  d3.select("#opacity")
    .on("click", function(d, i) {
      darkrate.transition()
        .duration(2000)
        .delay(500)
        .style("opacity", document.getElementById("num").value)

      solar.transition()
        .duration(2000)
        .delay(500)
        .style("opacity", document.getElementById("num").value)
    });

  // Change size of the points
  d3.select("#pointsize")
    .on("click", function(d, i) {
      darkrate.transition()
        .duration(2000)
        .delay(500)
        .attr("r", document.getElementById("size").value)

      solar.transition()
        .duration(2000)
        .delay(500)
        .attr("r", document.getElementById("size").value)
    });

  // Filter out data
  d3.select("#NUV").on("click", function() {
    item = d3.selectAll("circle")

    item.forEach(function(d, i) {
      console.log(d);
    })
  })

  // Filter out data
  d3.select("#FUVA").on("click", function(d, i) {
    darkrate.transition()
      .duration(2000)
      .delay(500)
      .style("opacity", function(d, i) {
        return 0 ? d.detector != "FUVA" : document.getElementById("num").value
      });
  })

  // Filter out data
  d3.select("#FUVB").on("click", function(d, i) {
    darkrate.transition()
      .duration(2000)
      .delay(500)
      .style("opacity", function(d, i) {
        return 0 ? d.detector != "FUVB" : document.getElementById("num").value
      });
  })



  //svg.selectAll("circle")
  //.data(data)
  //.on("mouseover", mouseover)
  //.on("mouseout", mouseout);

  canvas.exit().remove();
}

// Load the world.
d3.json("https://unpkg.com/world-atlas@1/world/50m.json", function(error, world) {
  if (error) throw error;

  svg.insert("path", ".graticule")
    .datum(topojson.feature(world, world.objects.land))
    .attr("class", "land")
    .attr("d", path);

  svg.insert("path", ".graticule")
    .datum(topojson.mesh(world, world.objects.countries, function(a, b) {
      return a !== b;
    }))
    .attr("class", "boundary")
    .attr("d", path);
});


// Load the orbital info stuff
d3.json("./js/orbital_info.json", function(error, data) {
  if (error) throw error;

  // Filter/modify data if necessary
  data.forEach(function(d) {
    //Re-center around the map
    d.longitude = d.longitude > 180 ? +d.longitude - 360 : +d.longitude;
    d.latitude = +d.latitude;

    d.sun_lon = d.sun_lon > 180 ? +d.sun_lon - 360 : +d.sun_lon
    d.sun_lat = +d.sun_lat;
  });

  update(data);

});


function rescale(d) {
  outLat = d.longitude - d.sun_lon > 180 ? (d.longitude - d.sun_lon) - 360 : d.longitude - d.sun_lon;
  outLat = outLat < -180 ? outLat + 360 : outLat
  outLat = outLat > 180 ? outLat - 360 : outLat
  return outLat
}






// Interactivity
function mouseover(d, i) {
  //console.log(d);
  //console.log(i);
  var c = d3.select(this);
  console.log(c);

  //d3.select("#stats").enter().text(d.latitude + "   " + d.longitude);

  //c.attr({"fill": "orange"});
  //d3.select(this).attr({fill: "orange"});

  console.log(d.longitude + "     " + i);
};

function mouseout(d, i) {
  d3.select(this).attr({
    fill: "black",
  });

  d3.select("#stamp" + i).remove();
}