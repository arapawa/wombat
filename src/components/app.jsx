import React, { useState, useEffect } from 'react';
import moment from 'moment';
import regeneratorRuntime from 'regenerator-runtime'; // used for async and await
import _ from 'lodash';
import Papa from 'papaparse'; // using Papaparse library for FileReader and parsing to Json

import Header from './header';
import Calculations from './calculations';
import Table from './table';
import Footer from './footer';

// initial vehicles test
import testdata from './data.json';

function reducer(state, action) {
  return [...state, ...action];
}

/* globals $ */
function App() {
  // vehicles csv state
  const [vehicles, setVehicles] = useState(testdata);

  // getting the table headings for rendering on the page
  function getHeadings(e) {
    return Object.keys(e[0]);
  }

  function handleVehiclesCsvFiles(e) {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: function(results) {
        console.log('Vehicles:', results.data);
        setVehicles(results.data);
      }
    });
  }

  function sanitize(code) {
    let sanitized = code
      .replace(/\r?\n|\r/g, ' ')     // Strip out carriage returns and newlines
      .replace(/\u2018/g, '\'')      // Left single quote
      .replace(/\u2019/g, '\'')      // Right single quote
      .replace(/\u201C/g, '"')       // Left double quote
      .replace(/\u201D/g, '"')       // Right double quote
      .replace(/\u2026/g, '...')     // Ellipsis
      .replace(/,/g, '&comma;')      // Comma
      .replace(/\u2013/g, '&ndash;') // Long dash
      .replace(/\u2014/g, '&mdash;') // Longer dash
      .replace(/\u00A9/g, '&copy;');  // Copyright symbol
    return sanitized;
  }

  return (
    <div id="app">
      <Header />

      <div className="row mb-1">
        <div className="col text-left">
          <h4>Vehicle Content</h4>
          <div className="form-group">
            <label htmlFor="csvVehiclesInput">Import from CSV</label>
            <div className="row mb-0">
              <div className="col-8">
                <input type="file" id="csvVehiclesInput" className="form-control-file" accept="*.csv" onChange={(e) => handleVehiclesCsvFiles(e)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for showing Calculations or Vehicle (tabular) data */}
      <ul className="nav nav-tabs" id="myTab" role="tablist">
        <li className="nav-item" role="presentation">
          <button className="nav-link active" id="calculations-tab" data-bs-toggle="tab" data-bs-target="#calculations" type="button" role="tab" aria-controls="calculations" aria-selected="true">Calculations</button>
        </li>
        <li className="nav-item" role="presentation">
          <button className="nav-link" id="vehicles-tab" data-bs-toggle="tab" data-bs-target="#vehicles" type="button" role="tab" aria-controls="vehicles" aria-selected="false">Vehicles</button>
        </li>
      </ul>

      <div className="row mb-1">
        <div className="tab-content" id="myTabContent">
          {/* Calculations content */}
          <div className="tab-pane fade show active" id="calculations" role="tabpanel" aria-labelledby="calculations-tab">
            <Calculations vehicles={vehicles} />
          </div>
          {/* Vehicles (tablular data) content */}
          <div className="tab-pane fade" id="vehicles" role="tabpanel" aria-labelledby="vehicles-tab">
            <div className="table-container table-responsive">
              {/* <Table theadData={vehiclesFromCsv ? getHeadings(vehiclesFromCsv) : getHeadings(testdata)} tbodyData={vehiclesFromCsv ? vehiclesFromCsv : testdata}/> */}
              <Table theadData={getHeadings(vehicles)} tbodyData={vehicles}/>
            </div>
          </div>
        </div>
      </div>

      <Footer />

    </div>
  );
}

export default App;
