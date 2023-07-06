// ****** Compute Correaltions between inputs ******

function reloadCorrelation(data, xFieldName, yFieldName) {

  // Calculate the correlation coefficient between the user's chosen fields
  let str_xArray = data.map(d => d[xFieldName]);
  let str_yArray = data.map(d => d[yFieldName]);

  // Convert strings into floats
  var xArray = str_xArray.map(parseFloat);
  var yArray = str_yArray.map(parseFloat);

  // Compute Mean values
  let xMean = xArray.reduce((sum, val) => sum + val, 0) / xArray.length;
  let yMean = yArray.reduce((sum, val) => sum + val, 0) / yArray.length;

  // Compute covariance and standard deviation
  let covariance = xArray.reduce((sum, val, i) => sum + (val - xMean) * (yArray[i] - yMean), 0) / xArray.length;
  let xStdDev = Math.sqrt(xArray.reduce((sum, val) => sum + Math.pow(val - xMean, 2), 0) / xArray.length);
  let yStdDev = Math.sqrt(yArray.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0) / yArray.length);

  // Compute correlation coefficent of the two attributes
  let correlationCoefficient = covariance / (xStdDev * yStdDev);

  // Display the correlation coefficient to the user
  document.getElementById("correlation").innerHTML = `Selected dimensions correlation: <b style="color:orange;">${correlationCoefficient.toFixed(2)}</b><br>`;


  // ****** Compute Min and Max Correaltions ******
  let fields = ['Human_Development_Index', 'Life_Expectancy_at_Birth',
  'Expected_Years_of_Schooling', 'Mean_Years_of_Schooling',
  'Gross_National_Income_Per_Capita', 
  'Gender_Development_Index',
  'Inequality-adjusted_Human_Development_Index',
  'Inequality_in_life_expectancy', 'Inequality_in_eduation',
  'Inequality_in_income', 'Gender_Inequality_Index']; // list of attributes to compare

  let maxCorrelation = -1;
  let maxCorrelationPair = [];
  let minCorrelation = 1;
  let minCorrelationPair = [];

  for (let i = 0; i < fields.length; i++) {
    for (let j = i + 1; j < fields.length; j++) {
      let xFieldName = fields[i];
      let yFieldName = fields[j];

      // Calculate the correlation coefficient between the two fields
      let str_xArray = data.map(d => d[xFieldName]);
      let str_yArray = data.map(d => d[yFieldName]);

      // Convert strings into floats
      let xArray = str_xArray.map(parseFloat);
      let yArray = str_yArray.map(parseFloat);

      // Compute Mean values
      let xMean = xArray.reduce((sum, val) => sum + val, 0) / xArray.length;
      let yMean = yArray.reduce((sum, val) => sum + val, 0) / yArray.length;

      // Compute covariance and standard deviation
      let covariance = xArray.reduce((sum, val, i) => sum + (val - xMean) * (yArray[i] - yMean), 0) / xArray.length;
      let xStdDev = Math.sqrt(xArray.reduce((sum, val) => sum + Math.pow(val - xMean, 2), 0) / xArray.length);
      let yStdDev = Math.sqrt(yArray.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0) / yArray.length);

      // Compute correlation coefficent of the two attributes
      let correlationCoefficient = covariance / (xStdDev * yStdDev);

      // Check if this is a new max or min correlation
      if (correlationCoefficient > maxCorrelation) {
        maxCorrelation = correlationCoefficient;
        maxCorrelationPair = [xFieldName, yFieldName];
      }

      if (correlationCoefficient < minCorrelation) {
        minCorrelation = correlationCoefficient;
        minCorrelationPair = [xFieldName, yFieldName];
      }
    }
  }

  // Display the max and min correlation coefficients and their corresponding attribute names 
  document.getElementById("minCorrelation").innerHTML = `Min correlation is between <b>${minCorrelationPair[0]}</b> and <b>${minCorrelationPair[1]}</b>: <b style="color:red;">${minCorrelation.toFixed(2)}</b>&nbsp&nbsp&nbsp&nbsp&nbsp|&nbsp&nbsp&nbsp&nbsp&nbsp`;
  document.getElementById("maxCorrelation").innerHTML = `Max correlation is between <b>${maxCorrelationPair[0]}</b> and <b>${maxCorrelationPair[1]}</b>: <b style="color:green;">${maxCorrelation.toFixed(2)}</b>`;

}

window.reloadCorrelation = reloadCorrelation;

export {
    reloadCorrelation
};
