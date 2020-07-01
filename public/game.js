export default function createGame() {
  const state = {
    players: {},
    fruits: {},
    screen: {
      width: 25,
      height: 25
    }
  };

  const observers = [];

  function start() {
    const frequency = 5000;

    setInterval(addFruit, frequency);
  }

  function subscribe(observerFunction) {
    observers.push(observerFunction);
  }

  function notifyAll(command) {
    for (const observerFunction of observers) {
      observerFunction(command);
    }
  }

  function setState(newState) {
    Object.assign(state, newState);
  }

  function addPlayer(command) {
    const playerId = command.playerId;
    const playerX =
      'playerX' in command
        ? command.playerX
        : Math.floor(Math.random() * state.screen.width);
    const playerY =
      'playerY' in command
        ? command.playerY
        : Math.floor(Math.random() * state.screen.height);

    state.players[playerId] = {
      x: playerX,
      y: playerY,
      score: 0
    };

    notifyAll({
      type: 'add-player',
      playerId,
      playerX,
      playerY
    });
  }

  function removePlayer(command) {
    const playerId = command.playerId;

    delete state.players[playerId];

    notifyAll({
      type: 'remove-player',
      playerId
    });
  }

  function addFruit(command) {
    if (
      Object.keys(state.fruits).length ===
      state.screen.width * state.screen.height
    ) {
      return;
    }

    if (!command || checkForFruitInPixel(command)) {
      command = generateRandomCommandToAddFruits();
    }

    function generateRandomCommandToAddFruits() {
      const command = {};

      command.fruitId = Math.floor(Math.random() * 10000000);
      command.fruitX = Math.floor(Math.random() * state.screen.width);
      command.fruitY = Math.floor(Math.random() * state.screen.height);

      if (checkForFruitInPixel(command)) {
        return generateRandomCommandToAddFruits();
      }

      return command;
    }

    function checkForFruitInPixel(command) {
      for (const fruitId in state.fruits) {
        const fruit = state.fruits[fruitId];

        if (fruit.x === command.fruitX && fruit.y === command.fruitY) {
          return true;
        }
      }

      return false;
    }

    const fruitId = command.fruitId;
    const fruitX = command.fruitX;
    const fruitY = command.fruitY;

    state.fruits[fruitId] = {
      x: fruitX,
      y: fruitY
    };

    notifyAll({
      type: 'add-fruit',
      fruitId,
      fruitX,
      fruitY
    });
  }

  function removeFruit(command) {
    const fruitId = command.fruitId;

    delete state.fruits[fruitId];

    notifyAll({
      type: 'remove-fruit',
      fruitId
    });
  }

  function movePlayer(command) {
    notifyAll(command);

    const acceptMoves = {
      ArrowUp(player) {
        if (player.y - 1 >= 0) {
          player.y -= 1;
          //return;
        } else {
          player.y = state.screen.height - 1;
        }
      },
      ArrowRight(player) {
        if (player.x + 1 < state.screen.width) {
          player.x += 1;
          //return;
        } else {
          player.x = 0;
        }
      },
      ArrowDown(player) {
        if (player.y + 1 < state.screen.height) {
          player.y += 1;
          //return;
        } else {
          player.y = 0;
        }
      },
      ArrowLeft(player) {
        if (player.x - 1 >= 0) {
          player.x -= 1;
          //return;
        } else {
          player.x = state.screen.width - 1;
        }
      }
    };

    const keyPressed = command.keyPressed;
    const playerId = command.playerId;
    const player = state.players[playerId];
    const moveFunction = acceptMoves[keyPressed];

    if (player && moveFunction) {
      moveFunction(player);
      checkForFruitCollision(playerId);
    }
  }

  function checkForFruitCollision(playerId) {
    const player = state.players[playerId];

    for (const fruitId in state.fruits) {
      const fruit = state.fruits[fruitId];
      console.log(`Checking ${playerId} and ${fruitId}`);

      if (player.x === fruit.x && player.y === fruit.y) {
        console.log(`COLLISION between ${playerId} and ${fruitId}`);

        removeFruit({ fruitId });
        notifyAll({
          type: 'remove-fruit',
          fruitId
        });

        increaseScore({ playerId });
      }
    }
  }

  function increaseScore(command) {
    const playerId = command.playerId;
    const player = state.players[playerId];
    player.score++;

    notifyAll({
      type: 'update-score-table',
      players: state.players,
      scoredPlayerId: playerId
    });

    console.log(`Player ${playerId} scored! Total point now: ${player.score}`);
  }

  return {
    addPlayer,
    removePlayer,
    movePlayer,
    addFruit,
    removeFruit,
    state,
    setState,
    subscribe,
    start
  };
}
