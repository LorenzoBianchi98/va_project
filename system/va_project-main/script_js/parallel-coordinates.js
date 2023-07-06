import { findMax, findMin, reloadPlotToResize } from "./utils.js";
import { observableManager } from "./observables.js";

/*
 * Data
 *****************************/
const FIELD_EXCLUDED = ["ISO3", "Country", "Human_Development_Groups","UNDP_Developing_Regions","HDI_Rank","GII_Rank", "first", "second", "continent", 'Coefficient_of_human_inequality', 'Overall_loss_%', 'HDI_female', 'HDI_male','Inequality_in_life_expectancy','Inequality_in_eduation','Inequality_in_income'];

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


function reloadParallelCordplot(data, who) {

  //id svg
  const svg_id ="parallcoord";
  //rimuovo l'svg con svg_id se presente
  d3.select("#svg_" + svg_id).remove();
  //creo l'svg con le dimensioni in base alla finestra
  let component = reloadPlotToResize("#parallelcoordinates",svg_id, 11.7, 0);

  const pcSvg = component[2];
  const padding = 28, brush_width = 20;

  //rimuovo i punti precedenti se ci sono
  pcSvg.selectAll("*").remove();
  
  plot(data);
  //Read the data
  function plot(data) {  
      // compute features array
      let features = generateFeatures(data);

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
            if (who == 0) {observableManager.notifyObservables(0)}
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
      .attr('stroke', 'white')
      .attr('transform', d => ('translate(' + xScale(d.name) + ',0)'));
      
      featureAxisG
      .each(function (d) {
        d3.select(this)
          .append('g')
          .attr('class', 'brush')
          .call(yBrushes[d.name]);
      });

      featureAxisG
      .selectAll('text')
      .attr('fill', 'white');

      featureAxisG
      .append('g')
      .each(function (d) {
        d3.select(this).call(yAxis[d.name]);
      });

      featureAxisG.each(function (d) {
        d3.select(this).call(yAxis[d.name]);
        d3.select(this).selectAll('text').style('font-size', '15px');
    });
    
      featureAxisG
      .append("text")
      .attr("text-anchor", "middle")
      .attr('y', padding / 2)
      .style('font-size', '16px')
      .attr('fill', 'white') // add this line to set the color of the text to red
      .text(d =>  {// Replace axis name
      if (d.name === "Human_Development_Index") {
        return "HDI";
      } else if (d.name === "Life_Expectancy_at_Birth") {
        return "Life Expectancy";
      } else if (d.name === "Expected_Years_of_Schooling") {
        return "Expected Schooling";
      } else if (d.name === "Mean_Years_of_Schooling") {
        return "Mean Schooling";
      } else if (d.name === "Gross_National_Income_Per_Capita") {
        return "Gross National Income";
      }else if (d.name === "Inequality-adjusted_Human_Development_Index") {
        return "Ineq. HDI";
      }else if (d.name === "Gender_Development_Index") {
        return "Gender HDI";
      } else if (d.name === "Gender_Inequality_Index") {
        return "Gender Ineq. Index";
      } else {
        return d.name;
      }
    });
      

      if (who == 0) {observableManager.notifyObservables(0);}

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

    };
}

//reload scatterplot from value selected from menu
function updateDatasetParallCoord(fromWhere) {
  if(fromWhere == 0) {
    //chiamo dal frontend al primo caricamento e al cambiamento dell'anno
    let selectedYear = document.getElementById("datasetYear").value;
    observableManager.clearData();
    //carico il parallel con il dataset completo
    d3.csv(`./dataset/DB/data_${selectedYear}.csv`, function(data){
      reloadParallelCordplot(data, 0);
    });
    observableManager.addObservable((dataFromParallel) => reloadParallelCordplot(dataFromParallel));
  }  
}

export {
  reloadParallelCordplot,
  updateDatasetParallCoord
};

