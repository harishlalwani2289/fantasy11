import { API_KEY } from './config.js';

export function fetchLatestMatchId(teamId) {
  console.log('API key used is :', API_KEY);

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
    .then((data) => getLatestValidMatchId(data.teamMatchesData))
    .catch((error) => {
      console.error('Error fetching latest match ID:', error);
      return null;
    });
}

function getLatestValidMatchId(teamMatchesData) {
  let latestMatch = null;

  teamMatchesData.forEach((series) => {
    if (series.matchDetailsMap && series.matchDetailsMap.match) {
      series.matchDetailsMap.match.forEach((match) => {
        const matchStartDate = parseInt(match.matchInfo.startDate);
        const matchStatus = match.matchInfo.status.toLowerCase();

        // Ignore matches that are abandoned
        if (
          matchStatus.includes('abandoned') ||
          matchStatus.includes('no result')
        ) {
          return;
        }

        if (
          !latestMatch ||
          matchStartDate > parseInt(latestMatch.matchInfo.startDate)
        ) {
          latestMatch = match;
        }
      });
    }
  });

  return latestMatch ? latestMatch.matchInfo.matchId : null;
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
 * @returns {Promise<Object>} - A promise resolving to an object containing batting and bowling orders.
 */
export function fetchScorecard(matchId, teamId) {
  console.log(
    'Fetching the scorecard to get last playing 11 for matchid',
    matchId
  );
  return fetch(
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
      return {
        battingOrder: getPlaying11(scoreCard, teamId),
        bowlingOrder: getBowlingOrder(scoreCard, teamId),
      };
    })
    .catch((error) => {
      console.error('Error fetching scorecard:', error);
      return { battingOrder: [], bowlingOrder: [] };
    });
}
