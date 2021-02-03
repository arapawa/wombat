import React, { useState, useEffect } from 'react';
import moment from 'moment';
import regeneratorRuntime from 'regenerator-runtime'; // used for async and await
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

    return challengesFromCsv.map((challenge, index) => {
      const employerName = challenge.EmployerName;
      
      // get the domain for the challenge from airtable
      let domain = '';
      for (let i = 0; i < clients.length; i++) {
        if (clients[i].fields['Limeade e='] === employerName) {
          domain = clients[i].fields['Domain'];
        }
      }

      const regexpress = /[\s.?!,;:]*/g;
      return (
        <tr id={`challenge-${index}`} key={`challenge-${index}`}>
          <td className="employer-name">{employerName}</td>
          <td className="domain"><a href={`${domain}/ControlPanel/RoleAdmin/ViewChallenges.aspx?type=employer`} target="_blank">{challenge.ChallengeName}</a></td>
          <td className="status">{status}</td>
          <td>
            <button type="button" className="btn btn-primary" onClick={() => uploadChallenge(challenge, $(event.target).closest('tr').attr('id'))}>Upload</button> {/* passing row id for status messages */}
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
      .replace(/,/g, '&comma;')      // Comma
      .replace(/\u2013/g, '&ndash;') // Long dash
      .replace(/\u2014/g, '&mdash;') // Longer dash
      .replace(/\u00A9/g, '&copy;');  // Copyright symbol
    return sanitized;
  }

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
      '"' + challenge.Activity + '"', // upload as string so commas don't break the upload
      '"' + challenge.ChallengeName + '"', // upload as string so commas don't break the upload
      challenge.DisplayPriority,
      challenge.StartDate,
      challenge.EndDate,
      sanitize(challenge.ShortDescription),
      sanitize(challenge.MoreInformation),
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
      '"' + challenge.FeaturedDescription + '"', // upload as string so commas don't break the upload
      challenge.FeaturedImageUrl,
      challenge.DailySelfReportLimit,
      challenge.DefaultPrivacy
    ]);

    console.log('data for upload:', data);

    return data;
  }

  function uploadChallenge(challenge, challengeIndex) {
    const employerName = challenge.EmployerName;
    const regexpress = /[\s.?!,;:]*/g;

    // let the user know that an upload is in progress
    $('#' + challengeIndex + ' .status').html('Uploading...');

    // get the domain for the challenge from airtable
    let psk = '';
    for (let i = 0; i < clients.length; i++) {
      if (clients[i].fields['Limeade e='] === employerName) {
        psk = clients[i].fields['Limeade PSK'];
      }
    }

    const csv = createCSV(challenge);
    const url = 'https://calendarbuilder.dev.adurolife.com/limeade-upload/';

    const params = {
      e: employerName,
      psk: psk,
      data: csv.join('\n'),
      type: 'Challenges'
    };

    $.post(url, params).done((response) => {
      // if Limeade punks us with a silent fail
      if (response.includes('error') || response.includes('logMessages')) {
        $('#' + challengeIndex + ' .status').addClass('bg-danger text-white');
        $('#' + challengeIndex + ' .status').html('Error. See console log.');
        console.log('Upload failed for challenge ' + challenge.ChallengeName, csv);
        console.log('response: ', response);
      } else {
        $('#' + challengeIndex + ' .status').addClass('bg-success text-white');
        $('#' + challengeIndex + ' .status').html('Success');
      }
    }).fail((request, status, error) => {
      $('#' + challengeIndex + ' .status').addClass('bg-danger text-white');
      $('#' + challengeIndex + ' .status').html('Error: ' + request.responseText);
      console.log('Upload failed for challenge ' + challenge.ChallengeName);
      console.error(request.status);
      console.error(request.responseText);
    });

  }

  // uploads all challenges from challengesFromCsv
  // could use a refactor so it's not a copy-paste of uploadChallenge()
  function massUpload() {
    // using rowId rather than challengeIndex so it can be incremented later, and so it's clearly different from challengeIndex
    let rowId = 0;
    // upload first challenge in challengesFromCsv
    massUploadChallenges(rowId);

    function massUploadChallenges(rowId) {
      const challenge = challengesFromCsv[rowId]; // declaring challenge to upload so this function can match uploadChallenge()
      const challengeIndex = `challenge-${rowId}`; // creating challengeIndex so we can edit the Status in table and match uploadChallenge()
      const employerName = challenge.EmployerName;
      const regexpress = /[\s.?!,;:]*/g;

      // let the user know that an upload is in progress
      $('#' + challengeIndex + ' .status').html('Uploading...');

      // get the domain for the challenge from airtable
      let psk = '';
      for (let i = 0; i < clients.length; i++) {
        if (clients[i].fields['Limeade e='] === employerName) {
          psk = clients[i].fields['Limeade PSK'];
        }
      }

      const csv = createCSV(challenge);
      const url = 'https://calendarbuilder.dev.adurolife.com/limeade-upload/';

      const params = {
        e: employerName,
        psk: psk,
        data: csv.join('\n'),
        type: 'Challenges'
      };

      $.post(url, params).done((response) => {
        // if Limeade punks us with a silent fail
        if (response.includes('error')) {
          $('#' + challengeIndex + ' .status').addClass('bg-danger text-white');
          $('#' + challengeIndex + ' .status').html('Error. See console log.');
          console.log('response: ', response);
          console.log('Upload failed for challenge ' + challenge.ChallengeName);
        } else {
          $('#' + challengeIndex + ' .status').addClass('bg-success text-white');
          $('#' + challengeIndex + ' .status').html('Success');
        }

        // upload next challenge in csv
        if (rowId < challengesFromCsv.length-1) {
          rowId++;
          massUploadChallenges(rowId);
        }

      }).fail((request, status, error) => {
        $('#' + challengeIndex + ' .status').addClass('bg-danger text-white');
        $('#' + challengeIndex + ' .status').html('Error: ' + request.responseText);
        console.error(request.status);
        console.error(request.responseText);
        console.log('Upload failed for challenge ' + challenge.ChallengeName);

        // upload next challenge in csv
        if (rowId < challengesFromCsv.length-1) {
          rowId++;
          massUploadChallenges(rowId);
        }
      });
      
    }

  }


  return (
    <div id="app">
      <Header />

      <div className="row mb-1">
        <div className="col text-left">
          <h4>Challenge Content</h4>
          <p><strong>Please note:</strong> Limeade doesn't do well with simultaneous uploads, and may silently fail simultaneous uploads.
          <br/>For best results, let each challenge successfully upload before uploading the next.</p>
          <p>Or, try out the Mass Upload button and let your crew upload each challenge for you.</p>
          <div className="form-group">
            <label htmlFor="csvChallengesInput">Import from CSV</label>
            <div className="row mb-0">
              <div className="col-8">
                <input type="file" id="csvChallengesInput" className="form-control-file" accept="*.csv" onChange={(e) => handleChallengesCsvFiles(e)} />
              </div>
              <div className="col-4">
                <button type="button" id="massUploadButton" className="btn btn-primary col-4" onClick={(e) => massUpload(e)}>Mass Upload</button>
              </div>
            </div>
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
