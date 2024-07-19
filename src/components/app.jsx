import React, { useState, useEffect } from 'react';
import moment from 'moment';
import regeneratorRuntime from 'regenerator-runtime'; // used for async and await
import _ from 'lodash';
import Papa from 'papaparse'; // using Papaparse library for FileReader and parsing to Json

import Header from './header';
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
  const [vehiclesFromCsv, setVehiclesFromCsv] = useState(null);

  // note: why are we using vehiclesFromCsv and not vehicles?
  const [vehicles, dispatchVehicles] = React.useReducer(
    reducer,
    [] // initial vehicles
  );

  // getting the table headings for rendering on the page
  function getHeadings(e) {
    return Object.keys(e[0]);
  }

  // no longer needed due to Table paradigm
  // but keeping just in case for backup
  // function renderVehicles() {

  //   return vehiclesFromCsv.map((vehicle, index) => {
  //     console.log(vehicle.VIN);
  //     const dealerName = vehicle.DealerName; // note: won't work yet

  //     const regexpress = /[\s.?!,;:]*/g;
  //     return (
  //       <tr id={`vehicle-${index}`} key={`vehicle-${index}`}>
  //         {/* <td className="dealer-name">{dealerName}</td> */}
  //         <td className="VIN">{vehicle.VIN}</td>
  //       </tr>
  //     );
  //   });
  // }

  function handleVehiclesCsvFiles(e) {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: function(results) {
        console.log('Vehicles:', results.data);
        setVehiclesFromCsv(results.data);
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

      <div className="row mb-1">
        {/* Commit to one of the below paradigms and figure it out. */}
        {/* ISSUE: below Table doesn't work because it's expecting data on pageload */}
        <div className="table-container table-responsive">
          <Table theadData={vehiclesFromCsv ? getHeadings(vehiclesFromCsv) : getHeadings(testdata)} tbodyData={vehiclesFromCsv ? vehiclesFromCsv : testdata}/>
        </div>
        {/* ISSUE: below table doesn't work because the table headings would be hard-coded
        ... and it's not populating vehicles anyway */}
        {/* <table className="table table-bordered table-hover table-striped" id="vehicles">
          <thead>
            {vehiclesFromCsv ? getHeadings(vehiclesFromCsv) : getHeadings(testdata)}
          </thead>
          <tbody>
            {vehiclesFromCsv ? renderVehicles() : <tr />}
          </tbody>
        </table> */}
      </div>

      <Footer />

    </div>
  );
}

export default App;
