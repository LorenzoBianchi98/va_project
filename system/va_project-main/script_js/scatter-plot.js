import { findMax, findMin, amendValue } from "./utils.js";

// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 60},
width_sp = 460 - margin.left - margin.right,
height_sp = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#scatterplot")
.append("svg")
.attr("width", width_sp + margin.left + margin.right)
.attr("height", height_sp + margin.top + margin.bottom)
.append("g")
.attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


function reloadScatterplot(data, xFieldName, yFieldName) {
    //svuota il grafico prima del reload
    svg.selectAll("*").remove();
    
    //calcola il dominio delle x
    let xDomain = [findMin(data, xFieldName), findMax(data, xFieldName)];

    // Add X axis
    const x = d3.scaleLinear()
    .domain(xDomain)
    .range([ 0, width_sp ]);

    svg.append("g")
    .attr("transform", "translate(0," + height_sp + ")")
    .call(d3.axisBottom(x));

    //calcola il dominio delle y
    let yDomain = [findMin(data, yFieldName), findMax(data, yFieldName)];

    // Add Y axis
    const y = d3.scaleLinear()
    .domain(yDomain)
    .range([ height_sp, 0]);
    svg.append("g")
    .call(d3.axisLeft(y));

    // Color scale: give me a specie name, I return a color
    const color = d3.scaleOrdinal()
    .domain(["Low", "Medium", "High", "Very High" ])
    .range([ "#440154ff", "#21908dff", "#fde725ff", "#f44336ff" ])

    // Highlight the specie that is hovered
    var highlight = function(d){

        selected_HDG = d.Human_Development_Groups

        d3.selectAll(".dot")
        .transition()
        .duration(200)
        .style("fill", "lightgrey")
        .attr("r", 3)

        d3.selectAll("." + selected_HDG)
        .transition()
        .duration(200)
        .style("fill", color(selected_HDG))
        .attr("r", 7)
    }

    // Highlight the specie that is hovered
    var doNotHighlight = function(){
        d3.selectAll(".dot")
        .transition()
        .duration(200)
        .style("fill", function (d) { return color(d.Human_Development_Groups) } )
        .attr("r", 5 )
    }
    
    
    // Add dots
    svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
        .attr("class", function (d) { return "dot " + d.Human_Development_Groups } )
        .attr("cx", d => x( amendValue(d[xFieldName], 0) ))
        .attr("cy", d => y( amendValue(d[yFieldName], 0) ))
        .attr("r", 5)
        .style("fill", function (d) { return color(d.Human_Development_Groups) } )
    //.on("mouseover", highlight)
    //.on("mouseleave", doNotHighlight )

}

export {
    reloadScatterplot
};
