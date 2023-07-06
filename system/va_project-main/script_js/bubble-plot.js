import { findMax, findMin, amendValue, reloadPlotToResize } from "./utils.js";

//------------------ LEGEND ------------------//
let legendSvg = d3.select('#bubbleplot')
.append('svg')
.attr('class', 'legend')
.attr('width', window.innerWidth / 12 * 3.8)   // adjust the width of the SVG element
.attr('height', 40);  // adjust the height of the SVG element

// Add legend title
legendSvg.append("text")
  .attr("class", "legend-title")
  .attr("x", 0)
  .attr("y", 15)
  .attr("fill", "white")
  .style('font-weight', 'bold')
  .text("HDI:");

let colorScale = d3.scaleOrdinal()
  .domain(["Low", "Medium", "High", "Very High" ])
  .range(['#FEEFB3', '#C2D69B', '#9BB7D4', '#2C4B8E']);


// Append a rect and text element for each color in the range
let legendItems = legendSvg.selectAll('.legend-item')
.data(colorScale.range())
.enter()
.append('g')
.attr('class', 'legend-item')
.attr('transform', function(d, i) {
      return 'translate(' + (i * (window.innerWidth / 12 * 3.8) / 6) + ', 20)';
    //return 'translate(' + (i * 90 + 30) + ', 20)';
});  // adjust the transform attribute to position the items horizontally

legendItems.append('rect')
.attr('x', 5)
.attr('y', 5)
.attr('width', 10)
.attr('height', 10)
.style('fill', function(d) { return d; });

legendItems.append('text')
.attr('x', 20)
.attr('y', 10)
.attr('dy', '.35em')
.style('fill', '#fff')
.text(function(d, i) { return colorScale.domain()[i];});

//------------------ END LEGEND ------------------//


function reloadBubbleplot(data, xFieldName, yFieldName, zFieldName) { 
  
  //id svg
  const svg_id ="bubbleplot";
  //rimuovo l'svg con svg_id se presente
  d3.select("#svg_" + svg_id).remove();
  //creo l'svg con le dimensioni in base alla finestra
  let component = reloadPlotToResize("#bubbleplot",svg_id, 4, 40);
  const svg = component[2];
  
  //svuota il grafico prima del reload
  svg.selectAll("*").remove();
  
  //calcola il dominio delle x
  let xDomain = [findMin(data, xFieldName), findMax(data, xFieldName)];
  
  // Add X axis
  var x = d3.scaleLinear()
  .domain(xDomain)
  .range([ 0, component[0] ]);

  svg.append("g")
  .attr("transform", "translate(0," + component[1] + ")")
  .call(d3.axisBottom(x))
  .select(".domain")
    .attr("stroke", "white")
    .attr("stroke-width", 3);
      
  svg.selectAll("text")
    .style("fill", "white");

  svg.append("g")
  .attr("transform", "translate(0," + component[1] + ")")
  .call(d3.axisBottom(x));

  //calcola il dominio delle y
  let yDomain = [findMin(data, yFieldName), findMax(data, yFieldName)];

  // Add Y axis
  var y = d3.scaleLinear()
  .domain(yDomain)
  .range([ component[1], 0]);


  svg.append("g")
  .call(d3.axisLeft(y))
  .select(".domain")
    .attr("stroke", "white")
    .attr("stroke-width", 3)
    .selectAll("text")
    .style("fill", "white");

  svg.selectAll("text")
    .attr("fill", "white");  

	svg.append("text")
	  .attr("transform", "translate(" + (component[0] / 2) + " ," + (component[1] + 35) + ")")
	  .style("text-anchor", "middle")
	  .style("fill", "white")
	  .text(xFieldName);

	svg.append("text")
	  .attr("transform", "rotate(-90)")
	  .attr("y", 0 - 61)
	  .attr("x",0 - (component[1] / 1.9))
	  .attr("dy", "1em")
	  .style("text-anchor", "middle")
	  .style("fill", "white")
	  .text(yFieldName);

  //calcola il dominio delle z
  let zDomain = [findMin(data, zFieldName), findMax(data, zFieldName)];

  // Add a scale for bubble size
  var z = d3.scaleLinear()
  .domain(zDomain)
  .range([ 4, 40]);

  // Add a scale for bubble color
  var myColor = d3.scaleOrdinal()
  .domain(["Low", "Medium", "High", "Very High" ])
  .range(['#FEEFB3', '#C2D69B', '#9BB7D4', '#2C4B8E']);

  // Add the brushing functionality
  const brush = d3.brush()
      .extent([[0, 0], [component[0], component[1]]])
      .on("end", brushended);

  svg.append("g")
      .attr("class", "brush")
      .call(brush);

  const dots = svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x( amendValue(d[xFieldName], 0) ))
    .attr("cy", d => y( amendValue(d[yFieldName], 0) ))
    .attr("r", function (d) { 
      if(zFieldName == "default") {
        return 8;
      } else {
        return z(d[zFieldName]); 
      }
    })
    .style("fill", function (d) { return myColor(d.Human_Development_Groups); } )
    .style("opacity", "0") // start with opacity at 0
    .attr("stroke", "white")
    .style("stroke-width", "1px")
    .on("mouseover", function(d) {
      // Get current mouse position
      const [mouseX, mouseY] = d3.mouse(this);
  
      // Show country label with colored background
      const labelGroup = svg.append("g").attr("class", "label-group");
      if (mouseX > 0) { // check if mouseX is greater than 0
        // Move the label and rectangle a little bit to the left
        labelGroup.attr("transform", "translate(-80,0)");
      }
      if (mouseY < 100) { // check if mouseX is greater than 0
        // Move the label and rectangle a little bit to the left
        //console.log(mouseY)
        labelGroup.attr("transform", "translate(-100,50)");
      }
      labelGroup.append("rect")
      .attr("class", "label-background")
      .attr("x", mouseX + 15)
      .attr("y", mouseY - 40)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("width", d.Country.length * 13)
      .attr("height", 25)
      .style("fill", "white");
  
    labelGroup.append("text")
      .attr("class", "country-label")
      .attr("x", mouseX + 20)
      .attr("y", mouseY - 20)
      .text(d.Country)
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .style("fill", "black")
      .style("pointer-events", "none");
  })
    .on("mouseout", function(d) {
      // Remove country label and background
      svg.select(".label-group").remove();
    })
    .call(update => update
      .transition() // add a transition
      .duration(1000) // set the duration to 1 second
      .style("opacity", 0.7) // transition the opacity to 0.7
    );

  // Define the function that updates the opacity of the selected and unselected dots
  function brushended() {
    observableManager.clearData();
    const selection = d3.event.selection;
    if (!selection) return;
    const [[x0, y0], [x1, y1]] = selection;
    dots.style("opacity", function (d) {
      const selected = x(d[xFieldName]) >= x0 && x(d[xFieldName]) < x1 && y(d[yFieldName]) >= y0 && y(d[yFieldName]) < y1;
      //prelevo i dati selezionati all'interno del rettangolo di selezione
      if (selected) { observableManager.addNewData(d); }
      return selected ? "1" : "0.3";
    });
    observableManager.notifyObservables(1);
  }

}

export {
    reloadBubbleplot
};
