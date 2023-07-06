import { observableManager } from "./observables.js";
import { updateDatasetParallCoord, reloadParallelCordplot } from "./parallel-coordinates.js";
import { reloadBubbleplot } from "./bubble-plot.js";
import { reloadScatterplotMDS } from "./mds.js";
import { reloadCorrelation } from "./correlation.js";
import { reloadWorldmap } from "./world-map.js";



let initialDatasetYear = document.getElementById("datasetYear").value;

observableManager.addObservable((dataFromParallel, selectedFieldConf) => 
    reloadBubbleplot(dataFromParallel, selectedFieldConf.selectedXField, selectedFieldConf.selectedYField, selectedFieldConf.selectedZField))
observableManager.addObservable((dataFromParallel) => 
    reloadScatterplotMDS(dataFromParallel, "first","second"))
observableManager.addObservable((dataFromParallel) => 
    reloadWorldmap(dataFromParallel));

//reload plot from value selected from menu
function updateDataset() {
    let selectedXField = document.getElementById("datasetXField").value;
    let selectedYField = document.getElementById("datasetYField").value;
    let selectedZField = document.getElementById("datasetZField").value;
    observableManager.setSelectedFields({selectedXField, selectedYField, selectedZField});
    observableManager.notifyObservables(0);
}

updateDataset();

window.updateDataset = updateDataset;
window.updateDatasetParallCoord = updateDatasetParallCoord;

updateDatasetParallCoord(0);