var width = 960;
var height = 960;

var xScale = d3.scaleLinear()
  .domain([-180, 180])
  .range([0, width]);

var yScale = d3.scaleLinear()
  .domain([-90, 90])
  .range([height, 0]);

var cScale = d3.scaleLinear()
  .domain([0, 5e-6])
  .range(['cyan', 'darkred'])

//var svg = d3.select("body").select("div").append("svg")
//    .attr("width", width)
//    .attr("height", height);

var svg = d3.select("#map")

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

d3.select("#time-min-value").text(document.getElementById("time-min").value)
d3.select("#time-max-value").text(document.getElementById("time-max").value)
d3.select("#darkrate-min-value").text(document.getElementById("dark-min").value)
d3.select("#darkrate-max-value").text(document.getElementById("dark-max").value)

d3.select("#opacity-value").text(document.getElementById("opacity").value)
d3.select("#pointsize-value").text(document.getElementById("pointsize").value)
d3.select("#sol-opacity-value").text(document.getElementById("solOpacity").value)
d3.select("#sol-pointsize-value").text(document.getElementById("solPointsize").value)


function update(data) {
  // Scale the range of the data
  //cScale.domain(d3.extent(data, function(d) {
  //  return d.dark;
  //}));

  var canvas = svg.selectAll("circle")
    .data(data);

  canvas.attr("class", "update")

  darkrate = canvas.enter().append("g").append("circle")
    .attr('fill', function(d) {
      return cScale(d.dark);
    })
    .attr('fill-opacity', +document.getElementById("opacity").value)
    .attr("r", +document.getElementById("pointsize").value)
    .attr("cx", function(d) {
      return xScale(d.longitude);
    })
    .attr("cy", function(d) {
      return yScale(d.latitude);
    })
    .on("mouseover", mouseover)
    .on("mouseoff", mouseoff)
    .merge(canvas);

  solar = canvas.enter().append("g").append("circle")
    .attr('fill', "orange")
    .attr('fill-opacity', +document.getElementById("solOpacity").value)
    .attr("stroke", "black")
    .attr("r", +document.getElementById("solPointsize").value)
    .attr("cx", function(d) {
      return xScale(d.sun_lon);
    })
    .attr("cy", function(d) {
      return yScale(d.sun_lat);
    })
    .merge(canvas);

  d3.select("#time-min").on("input", function(d, i) {
    newVal = +this.value;
    d3.select("#time-min-value").text(newVal);

    darkrate.transition()
      .duration(2000)
      .delay(500)
      .attr('r', function(d, i) {
        if (+d.date <= newVal) {
          return 0;
        }
        return +document.getElementById("pointsize").value;
      });
  });

  d3.select("#time-max").on("input", function(d, i) {
    newVal = +this.value;
    d3.select("#time-max-value").text(newVal);

    darkrate.transition()
      .duration(2000)
      .delay(500)
      .attr('r', function(d, i) {
        if (+d.date >= newVal) {
          return 0;
        }
        return +document.getElementById("pointsize").value;
      });
  });

  d3.select("#dark-min").on("input", function(d, i) {
    newVal = +this.value;
    d3.select("#darkrate-min-value").text(newVal);

    darkrate.transition()
      .duration(2000)
      .delay(500)
      .attr('r', function(d, i) {
        if (+d.dark <= newVal) {
          return 0;
        }
        return +document.getElementById("pointsize").value;
      });
  });

  d3.select("#dark-max").on("input", function(d, i) {
    newVal = +this.value;
    d3.select("#darkrate-max-value").text(newVal);

    darkrate.transition()
      .duration(2000)
      .delay(500)
      .attr('r', function(d, i) {
        point = d3.select(this)
        if (+d.dark >= newVal) {
          return 0;
        }
        return +document.getElementById("pointsize").value;
      });
  });


  // Opacity selection
  d3.select("#opacity").on("input", function(d, i) {

    d3.select("#opacity-value").text(this.value);

    darkrate.transition()
      .duration(2000)
      .delay(500)
      .style("opacity", +this.value)
  });

  // Opacity selection
  d3.select("#solOpacity").on("input", function(d, i) {

    d3.select("#sol-opacity-value").text(this.value);

    solar.transition()
      .duration(2000)
      .delay(500)
      .style("opacity", +this.value)
  });


  // Change size of the points
  d3.select("#pointsize").on("input", function(d, i) {

    d3.select("#pointsize-value").text(this.value);

    darkrate.transition()
      .duration(2000)
      .delay(500)
      .attr("r", +this.value)
  });

  // Change size of the points
  d3.select("#solPointsize").on("input", function(d, i) {

    d3.select("#sol-pointsize-value").text(this.value);

    solar.transition()
      .duration(2000)
      .delay(500)
      .attr("r", +this.value)
  });

  canvas.exit().remove();
}

// Turn on all data
d3.select("#ALL").on("click", function(d, i) {
  darkrate.transition()
    .duration(2000)
    .delay(500)
    .attr('r', +document.getElementById("pointsize").value);
});

// Select only NUV data.
d3.select("#NUV").on("click", function(d, i) {
  darkrate.transition()
    .duration(2000)
    .delay(500)
    .attr('r', function(d, i) {
      if (d.detector == "NUV") {
        return +document.getElementById("pointsize").value;
      }
      return 0
    });
})

// Select oinly FUVA data.
d3.select("#FUVA").on("click", function(d, i) {
  darkrate.transition()
    .duration(2000)
    .delay(500)
    .attr('r', function(d, i) {
      if (d.detector == "FUVA") {
        return +document.getElementById("pointsize").value;
      }
      return 0
    });
})

// Sekect only FUVB data.
d3.select("#FUVB").on("click", function(d, i) {
  darkrate.transition()
    .duration(2000)
    .delay(500)
    .attr('r', function(d, i) {
      if (d.detector == "FUVB") {
        return +document.getElementById("pointsize").value;
      }
      return 0
    });
});

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
  box = document.getElementById("stats");
  message = "Lat: " + d.latitude.toFixed(3) + "\n" + "Lon: " + d.longitude.toFixed(3) + "\n" + "Dark: " + d.dark.toExponential(2);
  box.value = message;

};

function mouseoff(d, i) {
  d3.select(this).attr({
    fill: "black",
  });

  d3.select("#stamp" + i).remove();
}
