
// set the dimensions and margins of the graph
var margin = {top: 10, right: 20, bottom: 30, left: 20},
    width = 900 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#worldmap")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);


// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
//var projection = d3.geoNaturalEarth1()
  .scale(95)
  .center([70,50])
  .translate([width * 0.458, height / 2]);

// Data and color scale
var data = d3.map();

// var colorScale = d3.scaleThreshold()
//   .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
//   .range(d3.schemeBlues[7]);

var colorScale = d3.scaleOrdinal()
  .domain(['Low', 'Medium', 'High', 'Very High'])
  .range(['#FEEFB3', '#C2D69B', '#9BB7D4', '#2C4B8E']);


// Load external data and boot
d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
  .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) { 
    data.set(d.code, +d.pop);
  })
  .await(ready);


function ready(error, topo) {

  let mouseOver = function(d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .5)
    d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
      //.style("stroke", "black")

  }

  let mouseLeave = function(d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .8)
    d3.select(this)
      .transition()
      .duration(200)
      //.style("stroke", "transparent")
  }

  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )

      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return colorScale(d.total);
      })
      .style("stroke", "black")
      .attr("class", function(d){ return "Country" } )
      .style("opacity", .8)
      .on("mouseover", mouseOver )
      .on("mouseleave", mouseLeave )

      // add title to display name on mouseover
      .append("title")
      .text(function(d) {
        return d.properties.name;
      });

}



function reloadWorldmap() { 

}

export {
    reloadWorldmap
};