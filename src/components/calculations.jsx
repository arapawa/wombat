import React, { useState, useEffect } from 'react';

export default function Calculations({vehicles}) {
  // checking the typeOf vehicles for sanity's sake
  console.log('vehicles type: ', typeof vehicles);

  // vin
  const [vinName, setVinName] = useState('VIN');
  // console.log('vinName: ', vinName);
  function handleVinName(e) {
    setVinName(e.target.value);
  };
  // maybe try this instead of making separate handleXName(e) for each input
  // handleChange = event => {
  //   const { value, name } = event.target;
  //   this.setState({ [name]: value });
  // };

  // new/used
  // TODO

  function countVINs(colnameVin) {
    let count = 0;
    let allTheVins = [];
    for (let i = 0; i < vehicles.length; i++) {
      allTheVins.push(vehicles[i][colnameVin]);
      if (vehicles[i][colnameVin]) {
        count++;
      }
    }
    console.log('count', count);
    console.log('allTheVins', allTheVins);
    return count;
  }

  return (
    // TODO: if .csv uploaded, show calculations, otherwise give instructions to upload feed .csv
    // for now, just show calculations
    <div className="calculations" id="calculations">
      <div className="column-names">
        <h2>Column Names</h2>
        <label htmlFor="vin">VIN: </label>
        <input type="text" id="vin" value={vinName} onChange={handleVinName}/>
      </div>
      <h2>Calculations go here:</h2>
      <p>Total vehicles: {vehicles.length}</p>
      <p>VINs: {countVINs(vinName)}</p>
      {/* // why are Total vehicles and VINs counts matching with test data, but not uploaded CSV? */}
    </div>
 );
 }