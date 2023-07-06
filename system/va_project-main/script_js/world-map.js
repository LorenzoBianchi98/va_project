import { reloadPlotToResize } from "./utils.js";  

function reloadWorldmap(filteredData) {

  //id svg
  const svg_id ="worldmap";
  //rimuovo l'svg con svg_id se presente
  d3.select("#svg_" + svg_id).remove();
  //creo l'svg con le dimensioni in base alla finestra
  let component = reloadPlotToResize("#worldmap",svg_id, 4, 0);
  var svg = component[2];

  // Map and projection
  var path = d3.geoPath();
  var projection = d3.geoMercator()
    .scale(80)
    .center([30,55])
    .translate([component[0] * 0.568, component[1] / 2.3]);

  // Data from data_2011.csv
  var data = d3.map();

  function loadDataFiltered(filteredData, data) {

    filteredData.forEach(element => {
      data.set(element.ISO3, element.Human_Development_Groups)
    });

  }

  loadDataFiltered(filteredData, data);

  // Data and color scale
  var dataPop = d3.map();

  var colorScale = d3.scaleOrdinal()
    .domain(['Low', 'Medium', 'High', 'Very High', 'undefined'])
    .range(['#FEEFB3', '#C2D69B', '#9BB7D4', '#2C4B8E', '#a09e9e']);
  
  // Load external data and boot
  d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) { 
      dataPop.set(d.code, +d.pop);
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
    }

    let mouseLeave = function(d) {
      d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", .8)
      d3.select(this)
        .transition()
        .duration(200)
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
          let temp = colorScale(data.get(d.id));
          return temp;
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

        //--------------LEGEND --------------------//
        const legendData = [
          { label: "Low", color: "#FEEFB3" },
          { label: "Medium", color: "#C2D69B" },
          { label: "High", color: "#9BB7D4" },
          { label: "Very High", color: "#2C4B8E" },
        ];
      
        const legend = svg.append("g")
          .attr("class", "legend")
          .attr("transform", "translate(-35,230)");

        // Add legend title
        legend.append("text")
          .attr("class", "legend-title")
          .attr("x", 0)
          .attr("y", -10)
          .attr("fill", "white")
          .style('font-weight', 'bold')
          .text("HDI:");
      
        const legendItems = legend.selectAll(".legend-item")
          .data(legendData)
          .enter()
          .append("g")
          .attr("class", "legend-item")
          .attr("transform", (d, i) => `translate(0, ${i * 25})`);
      
        legendItems.append("rect")
          .attr("width", 17)
          .attr("height", 17)
          .attr("fill", d => d.color);
      
        legendItems.append("text")
          .attr("x", 30)
          .attr("y", 14)
          .attr("fill", "white")
          .text(d => d.label);
  }

}

export {
    reloadWorldmap
};