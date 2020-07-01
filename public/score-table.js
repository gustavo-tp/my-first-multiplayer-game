export default function scoreTable() {
  const state = {
    scoreTableSelector: null,
    scoreArraySorted: [],
    maxResults: 10
  };

  const collectFruitAudio = new Audio('collect.mp3');
  const collect100FruitAudio = new Audio('100-collect.mp3');

  function setScoreTableSelector(selector) {
    state.scoreTableSelector = selector;
  }

  function updateScoreTable(command) {
    const scoresArray = [];
    const { playerId, scoredPlayerId, players } = command;
    const scoredPlayer = players[scoredPlayerId];

    for (const socketId in players) {
      const player = players[socketId];
      scoresArray.push({
        socketId,
        score: player.score
      });
    }

    state.scoreArraySorted = scoresArray.sort((first, second) => {
      if (first.score > second.score) {
        return -1;
      }

      if (first.score < second.score) {
        return 1;
      }

      return 0;
    });

    if (scoredPlayer.score % 100 !== 0) {
      collectFruitAudio.pause();
      collectFruitAudio.currentTime = 0;
      collectFruitAudio.play();
    } else {
      collectFruitAudio.pause();
      collect100FruitAudio.pause();
      collect100FruitAudio.currentTime = 0;
      collect100FruitAudio.play();
    }

    renderScoreTable(players, playerId);
  }

  function renderScoreTable(players, playerId) {
    let scoreTableInnerHTML = `
      <tr class="header">
        <td>Top 10 Jogadores</td>
        <td>Pontos</td>
      </tr>
    `;
    const scoreSliced = state.scoreArraySorted.slice(0, state.maxResults);

    scoreSliced.forEach(score => {
      scoreTableInnerHTML += `
        <tr class="${playerId === score.socketId ? 'current-player' : ''}">
          <td class="socket-id">${score.socketId}</td>
          <td class="score-value">${score.score}</td>
        </tr>
      `;
    });

    let playerNotInTop10 = true;

    for (const score of scoreSliced) {
      if (playerId === score.socketId) {
        playerNotInTop10 = false;
        break;
      }
    }

    if (playerNotInTop10) {
      scoreTableInnerHTML += `
        <tr class="current-player bottom">
          <td class="socket-id">${playerId}</td>
          <td class="score-value">${players[playerId].score}</td>
        </tr>
      `;
    }

    scoreTableInnerHTML += `
      <tr class="footer">
        <td>Total de jogadores</td>
        <td align="right">${state.scoreArraySorted.length}</td>
      </tr>
    `;

    state.scoreTableSelector.innerHTML = scoreTableInnerHTML;
  }

  return {
    setScoreTableSelector,
    updateScoreTable
  };
}
