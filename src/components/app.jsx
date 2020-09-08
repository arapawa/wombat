import React, { useState, useEffect } from 'react';
import moment from 'moment';
import _ from 'lodash';
import Airtable from 'airtable';
const base = new Airtable({ apiKey: 'keyCxnlep0bgotSrX' }).base('appHXXoVD1tn9QATh');
import Papa from 'papaparse'; // using Papaparse library for FileReader and parsing to Json

import Header from './header';
import Footer from './footer';

function clientsReducer(state, action) {
  return [...state, ...action];
}

/* globals $ */
function App() {
  // for single-client-select
  // const [selectedClient, setSelectedClient] = useState(null);

  const [surveyId, setSurveyId] = useState('');
  const [helpMessage, setHelpMessage] = useState('');

  // clients csv state
  const [clientsFromCsv, setClientsFromCsv] = useState(null);

  // challenges csv state
  const [challengesFromCsv, setChallengesFromCsv] = useState(null);
  console.log(challengesFromCsv);

  const [clients, dispatch] = React.useReducer(
    clientsReducer,
    [] // initial clients
  );

  // When app first mounts, fetch clients
  useEffect(() => {

    base('Clients').select().eachPage((records, fetchNextPage) => {
      dispatch(records);

      fetchNextPage();
    }, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });

  }, []); // Pass empty array to only run once on mount

  function renderClients() {
    const accountNamesList = clientsFromCsv.map(client => client['EmployerName']);

    // Filter clients by the list of account names in the user uploaded CSV
    const filteredClients = clients.filter(client => {
      return accountNamesList.includes(client.fields['Limeade e=']);
    });

    const sortedClients = [...filteredClients];

    sortedClients.sort((a, b) => {
      const nameA = a.fields['Limeade e='].toLowerCase();
      const nameB = b.fields['Limeade e='].toLowerCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    return sortedClients.map((client) => {
      const employerName = client.fields['Limeade e='];

      return (
        <tr id={employerName.replace(/\s*/g, '')} key={employerName}>
          <td>
            <a href={client.fields['Domain'] + '/ControlPanel/RoleAdmin/ViewChallenges.aspx?type=employer'} target="_blank">{client.fields['Limeade e=']}</a>
          </td>
          <td className="challenge-id"></td>
          <td className="status"></td>
          <td>
            <button type="button" className="btn btn-primary" onClick={() => uploadChallenge(client)}>Upload</button>
          </td>
        </tr>
      );
    });

  }

  function handleChallengesCsvFiles(e) {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: function(results) {
        console.log('Challenges:', results.data);
        setClientsFromCsv(results.data.EmployerName);
        setChallengesFromCsv(results.data);
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
      .replace(/\u2013/g, '&ndash;') // Long dash
      .replace(/\u2014/g, '&mdash;') // Longer dash
      .replace(/\u00A9/g, '&copy;');  // Copyright symbol
    return sanitized;
  }

  function uploadChallenge(client) {
    const employerName = client.fields['Limeade e='];

    const data = {
      // TODO: Add data for challenge upload
    };
    console.log('data for upload:', data);

    $('#' + employerName.replace(/\s*/g, '') + ' .status').html('Uploading...');
    $.ajax({
      url: 'https://api.limeade.com/api/admin/activity',
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify(data),
      headers: {
        Authorization: 'Bearer ' + client.fields['LimeadeAccessToken']
      },
      contentType: 'application/json; charset=utf-8'
    }).done((result) => {

      // Change row to green on success
      $('#' + employerName.replace(/\s*/g, '')).removeClass('bg-danger');
      $('#' + employerName.replace(/\s*/g, '')).addClass('bg-success text-white');
      $('#' + employerName.replace(/\s*/g, '') + ' .status').html('Success');
      $('#' + employerName.replace(/\s*/g, '') + ' .challenge-id').html(`<a href="${client.fields['Domain']}/admin/program-designer/activities/activity/${result.Data.ChallengeId}" target="_blank">${result.Data.ChallengeId}</a>`);


    }).fail((xhr, request, status, error) => {
      $('#' + employerName.replace(/\s*/g, '')).addClass('bg-danger text-white');
      $('#' + employerName.replace(/\s*/g, '') + ' .status').html('Failed: ' + request.responseText);
      console.error('status: ', request.status);
      console.error('request: ', request.responseText);
      console.log('Create challenge failed for client ' + client.fields['Limeade e=']);
    });

  }

  // // for single-client-select
  // function selectClient(e) {
  //   clients.forEach((client) => {
  //     if (client.fields['Limeade e='] === e.target.value) {
  //       setSelectedClient(client);
  //     }
  //   });
  // }

  // // for single-client-select
  // function renderEmployerNames() {
  //   const sortedClients = [...clients];

  //   sortedClients.sort((a, b) => {
  //     const nameA = a.fields['Limeade e='].toLowerCase();
  //     const nameB = b.fields['Limeade e='].toLowerCase();
  //     if (nameA < nameB) {
  //       return -1;
  //     }
  //     if (nameA > nameB) {
  //       return 1;
  //     }
  //     return 0;
  //   });

  //   return sortedClients.map((client) => {
  //     return <option key={client.id}>{client.fields['Limeade e=']}</option>;
  //   });
  // }

  return (
    <div id="app">
      <Header />

      <div className="row mb-1">
        <div className="col text-left">
          <h4>Challenge Content</h4>
          <div className="form-group">
            <label htmlFor="csvChallengesInput">Import from CSV</label>
            <input type="file" id="csvChallengesInput" className="form-control-file" accept="*.csv" onChange={(e) => handleChallengesCsvFiles(e)} />
          </div>
        </div>
      </div>

      <div className="row mb-1">
        <table className="table table-hover table-striped" id="challenges">
          <thead>
            <tr>
              <th scope="col">Limeade e=</th>
              <th scope="col">Challenge Id</th>
              <th scope="col">Status</th>
              <th scope="col">Upload</th>
            </tr>
          </thead>
          <tbody>
            {clientsFromCsv ? renderClients() : <tr />}
          </tbody>
        </table>
      </div>




      <div className="row">
        <div className="col text-left">
          {/* TODO: add challenge form inputs here */}
        </div>
      </div>

      <div className="row">
        {/* For single-client-select */}
        {/* <div className="col text-left">
          <button type="button" className="btn btn-primary" id="uploadButton" onClick={() => uploadChallenge(selectedClient)}>Single Upload</button>
          <img id="spinner" src="images/spinner.svg" />
        </div> */}
      </div>

      <Footer />

    </div>
  );
}

export default App;
