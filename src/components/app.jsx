import React, { useState, useEffect } from 'react';
import moment from 'moment';
import _ from 'lodash';
import Airtable from 'airtable';
const base = new Airtable({ apiKey: 'keyCxnlep0bgotSrX' }).base('appHXXoVD1tn9QATh');
import Papa from 'papaparse'; // using Papaparse library for FileReader and parsing to Json

import Header from './header';
import Footer from './footer';

function reducer(state, action) {
  return [...state, ...action];
}

/* globals $ */
function App() {
  // challenges csv state
  const [challengesFromCsv, setChallengesFromCsv] = useState(null);

  const [clients, dispatch] = React.useReducer(
    reducer,
    [] // initial clients
  );
  console.log(clients);

  // note: why are we using challengesFromCsv and not challenges?
  const [challenges, dispatchChallenges] = React.useReducer(
    reducer,
    [] // initial challenges
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

  // TODO: create mass-upload function that ensures each challenge is uploaded before the next starts.
  // Then we can load a .csv, hit mass-upload, sit back and let the app do the rest.

  function renderChallenges() {

    return challengesFromCsv.map((challenge) => {
      const employerName = challenge.EmployerName;

      // TODO: get domain (and maybe PSK) from clients list from Airtable
      // either filter list by EmployerName/Limeade e=
      // or use promise structure to get the data from airtable then create table row
      let domain = '';
      for (let i = 0; i < clients.length; i++) {
        if (clients[i].fields['Limeade e='] === employerName) {
          domain = clients[i].fields['Domain'];
        }
      }

      // // get client and domain
      // base('Clients').select({
      //   filterByFormula: `{Limeade e=}='${challenge.EmployerName}'`
      // }).eachPage((records, fetchNextPage) => {
      //   const client = records[0];
      //   domain = client.fields['Domain'];
      //   psk = client.fields['Limeade PSK'];
      // }, (err) => {
      //   if (err) {
      //     console.error(err);
      //     return;
      //   }
      // });


      const regexpress = /[\s.?!,;:]*/g;
      return (
        // TODO: change id and key into something more reliable for if there are more than one challenge with the same name
        // maybe row number/id/arrayid?
        <tr id={challenge.ChallengeName.replace(regexpress, '')} key={challenge.ChallengeName}>
          <td className="employer-name">{employerName}</td>
          <td className="domain"><a href={`${domain}/ControlPanel/RoleAdmin/ViewChallenges.aspx?type=employer`} target="_blank">{challenge.ChallengeName}</a></td>
          <td className="status">{status}</td>
          <td>
            <button type="button" className="btn btn-primary" onClick={() => uploadChallenge(challenge)}>Upload</button>
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

  // note: should we use papaparse for creating the upload csv?
  function createCSV(challenge) {
    

    let data = [[
      'EmployerName',
      'ChallengeId',
      'ChallengeType',
      'IsWeekly',
      'WinStrategy',
      'Target',
      'Activity',
      'ChallengeName',
      'DisplayPriority',
      'StartDate',
      'EndDate',
      'ShortDescription',
      'MoreInformation',
      'ImageUrl',
      'ShowInProgram',
      'RewardType',
      'Reward',
      'Dimensions',
      'LeaderboardTag',
      'EnableDeviceTracking',
      'AllowSelfReporting',
      'DeviceTrackingUnits',
      'IsTeamChallenge',
      'MinTeamSize',
      'MaxTeamSize',
      'Subgroup',
      'Field1',
      'Field1Value',
      'Field2',
      'Field2Value',
      'Field3',
      'Field3Value',
      'AppearanceInProgram',
      'IntegrationPartnerId',
      'ButtonText',
      'TargetUrl',
      'EventCode',
      'ShowExtendedDescription',
      'ActivityTemplateId',
      'IsFeatured',
      'FeaturedDescription',
      'FeaturedImageUrl',
      'DailySelfReportLimit',
      'DefaultPrivacy'
    ]];

    data.push([
      challenge.EmployerName,
      challenge.ChallengeId,
      challenge.ChallengeType,
      challenge.IsWeekly,
      challenge.WinStrategy,
      challenge.Target,
      challenge.Activity,
      challenge.ChallengeName,
      challenge.DisplayPriority,
      challenge.StartDate,
      challenge.EndDate,
      challenge.ShortDescription,
      challenge.MoreInformation,
      challenge.ImageUrl,
      challenge.ShowInProgram,
      challenge.RewardType,
      challenge.Reward,
      challenge.Dimensions,
      challenge.LeaderboardTag,
      challenge.EnableDeviceTracking,
      challenge.AllowSelfReporting,
      challenge.DeviceTrackingUnits,
      challenge.IsTeamChallenge,
      challenge.MinTeamSize,
      challenge.MaxTeamSize,
      challenge.Subgroup,
      challenge.Field1,
      challenge.Field1Value,
      challenge.Field2,
      challenge.Field2Value,
      challenge.Field3,
      challenge.Field3Value,
      challenge.AppearanceInProgram,
      challenge.IntegrationPartnerId,
      challenge.ButtonText,
      challenge.TargetUrl,
      challenge.EventCode,
      challenge.ShowExtendedDescription,
      challenge.ActivityTemplateId,
      challenge.IsFeatured,
      challenge.FeaturedDescription,
      challenge.FeaturedImageUrl,
      challenge.DailySelfReportLimit,
      challenge.DefaultPrivacy
    ]);

    console.log('data for upload:', data);

    return data;
  }

  function uploadChallenge(challenge) {
    const regexpress = /[\s.?!,;:]*/g;

    // let the user know that an upload is in progress
    $('#' + challenge.ChallengeName.replace(/[\s.?!,;:]*/g, '') + ' .status').html('Uploading...');

    const employerName = challenge.EmployerName;

    // TODO: get psk from clients list from Airtable
    // either filter list by EmployerName/Limeade e=
    // or use promise structure to get the data from airtable then do upload post function
    let psk = '';
    for (let i = 0; i < clients.length; i++) {
      if (clients[i].fields['Limeade e='] === employerName) {
        psk = clients[i].fields['Limeade PSK'];
      }
    }

    // // get client and psk
    // base('Clients').select({
    //   filterByFormula: `{Limeade e=}='${challenge.EmployerName}'`
    // }).eachPage((records, fetchNextPage) => {
    //   const client = records[0];
    //   psk = client.fields['Limeade PSK'];
    //   console.log('psk: ', psk);
    // }, (err) => {
    //   if (err) {
    //     console.error(err);
    //     return;
    //   }
    // });

    const csv = createCSV(challenge);
    const url = 'https://calendarbuilder.dev.adurolife.com/limeade-upload/';

    const params = {
      e: employerName,
      psk: psk,
      data: csv.join('\n'),
      type: 'Challenges'
    };
    console.log('params: ', params);

    $.post(url, params).done((response) => {
      // if Limeade punks us with a silent fail
      if (response.includes('error')) {
        $('#' + challenge.ChallengeName.replace(regexpress, '')).addClass('bg-danger text-white');
        $('#' + challenge.ChallengeName.replace(regexpress, '') + ' .status').html('Error. See console log.');
        console.log('response: ', response);
        console.log('Upload failed for challenge ' + challenge.ChallengeName);
      } else {
        $('#' + challenge.ChallengeName.replace(regexpress, '')).addClass('bg-success text-white');
        $('#' + challenge.ChallengeName.replace(regexpress, '') + ' .status').html('Success');
      }
    }).fail((request, status, error) => {
      $('#' + challenge.ChallengeName.replace(regexpress, '')).addClass('bg-danger text-white');
      $('#' + challenge.ChallengeName.replace(regexpress, '') + ' .status').html('Error: ' + request.responseText);
      console.error(request.status);
      console.error(request.responseText);
      console.log('Upload failed for challenge ' + challenge.ChallengeName);
    });

  }


  return (
    <div id="app">
      <Header />

      <div className="row mb-1">
        <div className="col text-left">
          <h4>Challenge Content</h4>
          <p><strong>Please note:</strong> Limeade doesn't do well with simultaneous uploads, and may silently fail simultaneous uploads.
          <br/>For best results, let each challenge successfully upload before uploading the next.</p>
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
              <th scope="col">Challenge Name</th>
              <th scope="col">Status</th>
              <th scope="col">Upload</th>
            </tr>
          </thead>
          <tbody>
            {challengesFromCsv ? renderChallenges() : <tr />}
          </tbody>
        </table>
      </div>

      <Footer />

    </div>
  );
}

export default App;
