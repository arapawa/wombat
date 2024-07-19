import React, { useState, useEffect } from 'react';

export default function Table({theadData, tbodyData}) {
  return (
    <table className="table table-bordered table-hover table-striped" id="vehicles">
        <thead>
           <tr>
            {theadData.map(heading => {
              return <th scope="col" key={heading}>{heading}</th>
            })}
          </tr>
        </thead>
        <tbody>
            {tbodyData.map((row, index) => {
                return <tr key={index}>
                    {theadData.map((key, index) => {
                         return <td scope="row" key={`${row[key]}-${index}`}>{row[key]}</td> // note: using a template literal for chaining the index into the key to avoid duplicate keys
                    })}
              </tr>;
            })}
        </tbody>
    </table>
 );
 }