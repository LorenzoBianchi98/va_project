/**
 *
 * @param   dataset Array containing objects
 * @param   fieldName the object field to look for min value
 * @returns the min value of the fieldName
 * 
 */
function findMin(dataset, fieldName) {
    let min = Number.POSITIVE_INFINITY;
    dataset.forEach(row => {
        let fieldValue = Number(row[fieldName]);
        if (fieldValue < min){
            min = fieldValue;
        }
    });
    return min;
  }
  
  /**
  *
  * @param   dataset Array containing objects
  * @param   fieldName the object field to look for max value
  * @returns the max value of the fieldName
  * 
  */
  function findMax(dataset, fieldName) {
    let max = Number.NEGATIVE_INFINITY;
    dataset.forEach(row => {
        let fieldValue = Number(row[fieldName]);
        if (fieldValue > max){
            max = fieldValue;
        }
    });
    return max;
  }

  /**
 * 
 * @param {valore letto dal csv} originalValue 
 * @param {valore da sostituir in caso di Nan} defaultValue 
 * @returns un valore che non sia Nan
 */
function amendValue(originalValue, defaultValue) {
    const number = Number(originalValue);
    return isNaN(number) ? defaultValue : number;
}


/**
 * 
 * @param {riferimento a Height o width} axes 
 * @param {valore larghezza colonna bootstrap} dimCol 
 * @returns dimensione pari alla colonna bootstrap in base all finestra
 */
function responsive(axes ,dimCol) {
    if (axes == "H") {
        return  window.innerHeight / 2 - 120;
    };
    if (axes == "W") {
        return window.innerWidth / 12 * dimCol - 30;
    }
    
}

/**
 * 
 * @param {id del div dove andrà l'svg } div_id 
 * @param {id dell'svg} svg_id 
 * @param {dimensione colonna impostata nella classe bootstrap} dim_col 
 * @returns {svg con le nuove dimensioni}
 */
function reloadPlotToResize(div_id, svg_id, dim_col, reductionHeight) {

    let result = [];
    // set the dimensions and margins of the graph
    const margin = {top: 10, right: 50, bottom: 50, left: 60},
    width = responsive("W", dim_col) - margin.left - margin.right,
    height = responsive("H") - margin.top - margin.bottom - reductionHeight;

    // append the svg object to the page
    const svg = d3.select(div_id)
    .append("svg")
    .attr("id", "svg_"+ svg_id)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    result.push(width);
    result.push(height);
    result.push(svg);
    return result;

}

export {
    findMin,
    findMax,
    amendValue,
    responsive,
    reloadPlotToResize
};