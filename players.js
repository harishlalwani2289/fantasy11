const API_KEY = 'fe6d38da25msh2ce2fde2c89f911p16cba4jsn214debe74d70'; // Replace with your actual API key

/**
 * Function to get the latest match ID for a given team.
 * @param {Array} teamMatchesData - Array of series and match details.
 * @returns {number|null} - Latest match ID or null if no match found.
 */
function getLatestMatchId(teamMatchesData) {
  let latestMatch = null;

  teamMatchesData.forEach((series) => {
    if (series.matchDetailsMap && series.matchDetailsMap.match) {
      series.matchDetailsMap.match.forEach((match) => {
        if (
          !latestMatch ||
          parseInt(match.matchInfo.startDate) >
            parseInt(latestMatch.matchInfo.startDate)
        ) {
          latestMatch = match;
        }
      });
    }
  });

  return latestMatch ? latestMatch.matchInfo.matchId : null;
}

/**
 * Function to fetch the latest match ID for a given team.
 * @param {number} teamId - The team ID for which to fetch the latest match.
 * @returns {Promise<number>} - A promise resolving to the latest match ID.
 */
function fetchLatestMatchId(teamId) {
  return fetch(
    `https://cricbuzz-cricket.p.rapidapi.com/teams/v1/${teamId}/results`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com',
        'x-rapidapi-key': API_KEY,
      },
    }
  )
    .then((response) => response.json())
    .then((data) => getLatestMatchId(data.teamMatchesData))
    .catch((error) => {
      console.error('Error fetching latest match ID:', error);
      return null;
    });
}

/**
 * Function to get the playing XI for a given team in a match.
 * @param {Array} scoreCard - Array containing match score details.
 * @param {number} teamId - The team ID.
 * @returns {Array} - List of batsmen names in batting order.
 */
function getPlaying11(scoreCard, teamId) {
  for (const innings of scoreCard) {
    if (innings.batTeamDetails.batTeamId === teamId) {
      return Object.keys(innings.batTeamDetails.batsmenData)
        .sort((a, b) => parseInt(a.split('_')[1]) - parseInt(b.split('_')[1])) // Sort by numeric value
        .map((key) => innings.batTeamDetails.batsmenData[key].batName);
    }
  }
  return [];
}

/**
 * Function to get the bowling order for a given team in a match.
 * @param {Array} scoreCard - Array containing match score details.
 * @param {number} teamId - The team ID.
 * @returns {Array} - List of bowlers' names in bowling order.
 */
function getBowlingOrder(scoreCard, teamId) {
  for (const innings of scoreCard) {
    if (innings.bowlTeamDetails.bowlTeamId === teamId) {
      return Object.keys(innings.bowlTeamDetails.bowlersData)
        .sort((a, b) => parseInt(a.split('_')[1]) - parseInt(b.split('_')[1])) // Sort by numeric value
        .map((key) => innings.bowlTeamDetails.bowlersData[key].bowlName);
    }
  }
  return [];
}

/**
 * Function to fetch the scorecard for a given match and team.
 * @param {number} matchId - The match ID.
 * @param {number} teamId - The team ID.
 */
function fetchScorecard(matchId, teamId) {
  fetch(
    `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}/hscard`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com',
        'x-rapidapi-key': API_KEY,
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const scoreCard = data.scoreCard;
      console.log(
        `Batting Order for Team ${teamId}:`,
        getPlaying11(scoreCard, teamId)
      );
      console.log(
        `Bowling Order for Team ${teamId}:`,
        getBowlingOrder(scoreCard, teamId)
      );
    })
    .catch((error) => console.error('Error fetching scorecard:', error));
}

/**
 * Function to get a random year between 2002 and 2024.
 * @returns {number} - A random year.
 */
function getRandomYear() {
  return Math.floor(Math.random() * (2024 - 2002 + 1)) + 2002;
}

/**
 * Function to fetch series for a given year.
 * @param {number} year - The year for which to fetch series.
 * @returns {Promise<Array>} - A promise resolving to an array of series IDs.
 */
function fetchSeriesForYear(year) {
  return fetch(
    `https://cricbuzz-cricket.p.rapidapi.com/series/v1/archives/international?year=${year}`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com',
        'x-rapidapi-key': API_KEY,
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const seriesList = data.seriesMapProto[0]?.series || [];
      return seriesList.map((series) => series.id);
    })
    .catch((error) => {
      console.error('Error fetching series for year:', error);
      return [];
    });
}

/**
 * Function to get a random series ID from the list.
 * @param {Array} seriesList - List of series IDs.
 * @returns {number|null} - A random series ID or null if the list is empty.
 */
function getRandomSeriesId(seriesList) {
  if (seriesList.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * seriesList.length);
  return seriesList[randomIndex];
}

/**
 * Function to fetch matches for a given series ID.
 * @param {number} seriesId - The series ID.
 * @returns {Promise<Array>} - A promise resolving to an array of match IDs.
 */
function fetchMatchesForSeries(seriesId) {
  return fetch(
    `https://cricbuzz-cricket.p.rapidapi.com/series/v1/${seriesId}`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com',
        'x-rapidapi-key': API_KEY,
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(
        'Full API Response for series:',
        JSON.stringify(data, null, 2)
      ); // Log full response

      let matches = [];

      // Extract matches from the new structure `matchDetails`
      if (data.matchDetails) {
        data.matchDetails.forEach((matchGroup) => {
          if (matchGroup.matchDetailsMap && matchGroup.matchDetailsMap.match) {
            matchGroup.matchDetailsMap.match.forEach((match) => {
              if (match.matchInfo && match.matchInfo.matchId) {
                matches.push(match.matchInfo.matchId);
              }
            });
          }
        });
      }

      console.log('Extracted Match IDs:', matches);
      return matches;
    })
    .catch((error) => {
      console.error('Error fetching matches for series:', error);
      return [];
    });
}

/**
 * Function to get a random match ID from the list.
 * @param {Array} matchList - List of match IDs.
 * @returns {number|null} - A random match ID or null if the list is empty.
 */
function getRandomMatchId(matchList) {
  if (matchList.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * matchList.length);
  return matchList[randomIndex];
}

/**
 * Main function to execute the fetching and processing.
 */
async function main() {
  //   const teamId1 = 58; // Replace with actual team ID
  //   const teamId2 = 62; // Replace with actual team ID

  //   const matchIdForTeam1 = await fetchLatestMatchId(teamId1);
  //   const matchIdForTeam2 = await fetchLatestMatchId(teamId2);

  //   if (matchIdForTeam1) fetchScorecard(matchIdForTeam1, teamId1);
  //   if (matchIdForTeam2) fetchScorecard(matchIdForTeam2, teamId2);

  const randomYear = getRandomYear();
  console.log('Selected Year:', randomYear);

  const seriesList = await fetchSeriesForYear(randomYear);
  const randomSeriesId = getRandomSeriesId(seriesList);

  if (randomSeriesId) {
    console.log('Selected Series ID:', randomSeriesId);
    const matchList = await fetchMatchesForSeries(randomSeriesId);
    const randomMatchId = getRandomMatchId(matchList);

    if (randomMatchId) {
      console.log('Selected Match ID:', randomMatchId);
    } else {
      console.log('No matches found for the selected series.');
    }
  } else {
    console.log('No series found for the selected year.');
  }
}

// Execute the main function
main();
