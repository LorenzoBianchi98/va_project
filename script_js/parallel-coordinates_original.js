import { findMax, findMin, reloadPlotToResize } from "./utils.js";
import { observableManager } from "./observables.js";


/*
 * Data
 *****************************/
const FIELD_EXCLUDED = ["ISO3", "Country", "Human_Development_Groups","UNDP_Developing_Regions","HDI_Rank","GII_Rank", "first", "second", "continent"];

/*
 * Parameters
 *****************************/
const filters = {};

const excludeFields = ({key}) => {
  return FIELD_EXCLUDED
    .filter(fieldToExclude => fieldToExclude === key).length > 0;
}

function generateFeatures(data) {
  return Object.keys(data[0])
    .filter(key => !excludeFields({key}))
    .map(keyName => {
    return {
      "name": keyName,
      "range": [findMin(data, keyName), findMax(data, keyName)]
    }
  });
}

/*
 * Parallel Coordinates
 *****************************/
// Main svg container
//const width = innerWidth-100, height = 500, padding = 28, brush_width = 20;
//const pcSvg = d3.select('#parallelcoordinates')
//  .append('svg')
//  .attr('width', width)
//  .attr('height', height);

//------------------------------

function reloadParallelCordplot(datasetYear) {

  //id svg
  const svg_id ="parallcoord";
  //rimuovo l'svg con svg_id se presente
  d3.select("#svg_" + svg_id).remove();
  //creo l'svg con le dimensioni in base alla finestra
  let component = reloadPlotToResize("#parallelcoordinates",svg_id, 12);

  const pcSvg = component[2];
  const padding = 28, brush_width = 20;

  //result.push(width);
  //result.push(height);
  //result.push(svg);

  //rimuovo i punti precedenti se ci sono
  pcSvg.selectAll("*").remove();
  
  //Read the data
  d3.csv(`./dataset/DB/data_${datasetYear}.csv`, function(data) {
      // compute features array
      let features = generateFeatures(data);

      /*
      * Helper functions
      *****************************/
      // Horizontal scale
      const xScale = d3.scalePoint()
      .domain(features.map(x => x.name))
      .range([padding, component[0] - padding]);

      // Each vertical scale
      const yScales = {};
      features.map(x => {
      yScales[x.name] = d3.scaleLinear()
        .domain(x.range)
        .range([component[1] - padding, padding]);
      });

      // Each axis generator
      const yAxis = {};
      d3.entries(yScales).map(x => {
      yAxis[x.key] = d3.axisLeft(x.value);
      });

      const yBrushes = {};
      d3.entries(yScales).map(x => {
        let extent = [
          [-(brush_width / 2), padding],
          [brush_width / 2, component[1] - padding]
        ];
        yBrushes[x.key] = d3.brushY()
          .extent(extent)
          .on('brush', () => brushEventHandler(x.key))
          .on('end', () => {
            brushEventHandler(x.key);
            observableManager.notifyObservables(0)
          });
      });

      // Paths for data
      const lineGenerator = d3.line();
      
      const linePath = function (d) {
        const _data = d3.entries(d).filter(x => !excludeFields(x));
        let points = _data.map(x => {
          return ([xScale(x.key), yScales[x.key](x.value)]);
        });
        return (lineGenerator(points));
      }
      


      // Inactive data
      pcSvg.append('g').attr('class', 'inactive').selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('d', d => linePath(d));

      // Active data
      pcSvg.append('g').attr('class', 'active').selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('d', d => {
        observableManager.addNewData(d);
        return linePath(d);
      });

      // Vertical axis for the features
      const featureAxisG = pcSvg.selectAll('g.feature')
      .data(features)
      .enter()
      .append('g')
      .attr('class', 'feature')
      .attr('transform', d => ('translate(' + xScale(d.name) + ',0)'));

      featureAxisG
      .append('g')
      .each(function (d) {
        d3.select(this).call(yAxis[d.name]);
      });

      featureAxisG
      .each(function (d) {
        d3.select(this)
          .append('g')
          .attr('class', 'brush')
          .call(yBrushes[d.name]);
      });

      featureAxisG
      .append("text")
      .attr("text-anchor", "middle")
      .attr('y', padding / 2)
      .attr('fill', 'white') // add this line to set the color of the text to red
      .text(d => d.name);
      

      observableManager.notifyObservables(0);

      // Each brush generator
      const brushEventHandler = function (feature) {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom")
          return; // ignore brush-by-zoom
        if (d3.event.selection != null) {
          filters[feature] = d3.event.selection.map(d => yScales[feature].invert(d));
        } else {
          if (feature in filters)
            delete (filters[feature]);
        }
        applyFilters();
      }

      const applyFilters = function () {
        observableManager.clearData();
        d3.select('g.active').selectAll('path')
          .style('display', d => {
            const isSelected = selected(d);
            if (isSelected) {
              observableManager.addNewData(d);
            }
            return (isSelected ? null : 'none');
          });
      }

      const selected = function (d) {
        const _filters = d3.entries(filters);
        return _filters.every(f => {
          return f.value[1] <= d[f.key] && d[f.key] <= f.value[0];
        });
      }

    });
}

//reload scatterplot from value selected from menu
function updateDatasetParallCoord() {
  let selectedYear = document.getElementById("datasetYear").value;
  observableManager.clearData();
  reloadParallelCordplot(selectedYear);
}

export {
  reloadParallelCordplot,
  updateDatasetParallCoord
};

