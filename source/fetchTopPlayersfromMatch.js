import { API_KEY } from './config.js';

export async function fetchTop11PlayersFromMatch(matchId) {
  try {
    const response = await fetch(
      `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}/hscard`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com',
          'x-rapidapi-key': API_KEY,
        },
      }
    );

    const data = await response.json();
    return calculatePlayerScores(data.scoreCard);
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

function calculateStrikeRateBonus(runs, balls) {
  if (balls < 10) return 0;
  let strikeRate = (runs / balls) * 100;
  if (strikeRate > 170) return 6;
  if (strikeRate >= 150) return 4;
  if (strikeRate >= 130) return 2;
  if (strikeRate >= 60 && strikeRate < 70) return -2;
  if (strikeRate >= 50) return -4;
  return -6;
}

function calculateEconomyBonus(runsConceded, overs) {
  if (overs <= 1) return 0;
  let economyRate = runsConceded / overs;
  if (economyRate < 5) return 6;
  if (economyRate < 6) return 4;
  if (economyRate <= 7) return 2;
  if (economyRate <= 11) return -2;
  if (economyRate <= 12) return -4;
  return -6;
}

function processBatsman(playerScores, batsman, key, team) {
  let score = batsman.runs + batsman.boundaries * 4 + batsman.sixers * 6;
  if (batsman.runs >= 25) score += 4;
  if (batsman.runs >= 50) score += 8;
  if (batsman.runs >= 75) score += 12;
  if (batsman.runs >= 100) score += 16;
  score += calculateStrikeRateBonus(batsman.runs, batsman.balls);

  if (!playerScores[batsman.batId]) {
    playerScores[batsman.batId] = {
      id: batsman.batId,
      name: batsman.batName,
      role: 'Batsman',
      score: 0,
      position: key,
      team,
    };
  }
  playerScores[batsman.batId].score += score;
}

function processBowler(playerScores, bowler, key, team) {
  let score = bowler.wickets * 25 + bowler.dots + (bowler.maidens || 0) * 12;
  score += calculateEconomyBonus(bowler.runsConceded, bowler.overs);

  if (!playerScores[bowler.bowlerId]) {
    playerScores[bowler.bowlerId] = {
      id: bowler.bowlerId,
      name: bowler.bowlName,
      role: 'Bowler',
      score: 0,
      position: key,
      team,
    };
  } else {
    playerScores[bowler.bowlerId].role = 'All-Rounder';
  }
  playerScores[bowler.bowlerId].score += score;
}

function processFielder(playerScores, scoreCard) {
  scoreCard.forEach((innings) => {
    Object.values(innings.batTeamDetails.batsmenData).forEach((batsman) => {
      if (batsman.wicketCode === 'CAUGHT' && batsman.fielderId1) {
        const fielderId = batsman.fielderId1;
        if (!playerScores[fielderId]) {
          playerScores[fielderId] = {
            id: fielderId,
            name: `Fielder ${fielderId}`,
            role: 'Fielder',
            score: 0,
            position: 'Field',
            team: 'Unknown',
          };
        }
        playerScores[fielderId].score += 8; // +8 points for catching the batsman
      }
    });
  });
}

export function calculatePlayerScores(scoreCard) {
  let playerScores = {};
  let team1Id = scoreCard[0].batTeamDetails.batTeamId;
  let team2Id = scoreCard[0].bowlTeamDetails.bowlTeamId;

  scoreCard.forEach((innings) => {
    Object.entries(innings.batTeamDetails.batsmenData).forEach(
      ([key, batsman]) => {
        processBatsman(
          playerScores,
          batsman,
          key,
          innings.batTeamDetails.batTeamId === team1Id ? 'Team1' : 'Team2'
        );
      }
    );

    Object.entries(innings.bowlTeamDetails.bowlersData).forEach(
      ([key, bowler]) => {
        processBowler(
          playerScores,
          bowler,
          key,
          innings.bowlTeamDetails.bowlTeamId === team1Id ? 'Team1' : 'Team2'
        );
      }
    );
  });

  processFielder(playerScores, scoreCard);

  return Object.values(playerScores)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);
}
