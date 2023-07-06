const observableManager = {
  _filteredData: [],
  _observables: [],
  _lastFilteredDataLenght: 0,
  _selectedFieldConfigObject: {},
  clearData: function() {
    this._filteredData = [];
    this._lastFilteredDataLenght = 0;
  },
  addNewData: function(data) {
    const isPresent = this._filteredData.filter(d => d.ISO3 === data.ISO3).length;
    if (!isPresent) {
      this._filteredData.push(data);
    }
  },
  notifyObservables: function(who) {
    //this._observables.forEach(obs => obs(this._filteredData, this._selectedFieldConfigObject));
    if(who == 0) {
      //sto chiamando dal parallel      
      this._observables[0](this._filteredData, this._selectedFieldConfigObject);
      this._observables[1](this._filteredData, this._selectedFieldConfigObject);
      this._observables[2](this._filteredData, this._selectedFieldConfigObject);
    }
    if (who == 1) {
      //sto chiamando dal bubbleplot
      this._observables[1](this._filteredData, this._selectedFieldConfigObject);
      this._observables[2](this._filteredData, this._selectedFieldConfigObject);
      this._observables[3](this._filteredData, this._selectedFieldConfigObject);
    }
    if (who == 2) {
      //sto chiamando dall'mds
      this._observables[0](this._filteredData, this._selectedFieldConfigObject);
      this._observables[2](this._filteredData, this._selectedFieldConfigObject);
      this._observables[3](this._filteredData, this._selectedFieldConfigObject);
    }
  },
  addObservable: function(obsToAdd) {
    this._observables.push(obsToAdd);
  },
  setSelectedFields: function(selectedFieldConfigObject) {
    this._selectedFieldConfigObject = selectedFieldConfigObject;
  }
};

window.observableManager = observableManager;

export {
  observableManager
};