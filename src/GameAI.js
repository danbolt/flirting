var GameAI = function (teamIndex) {
  this.teamIndex = teamIndex;
};
GameAI.prototype.getCommandForBoardState = function(boardState) {
  throw "Daniel, don't use the default GameAI."
};
GameAI.prototype.myAlivePieceIndicies = function (boardState) {
  return boardState.pieces.map(function (piece, index) {
    return piece.team === this.teamIndex ? index : -1;
  }, this).filter(function (ind) {
    return ind !== -1;
  }, this);
};
GameAI.prototype.enemyAlivePieceIndicies = function (boardState) {
  return boardState.pieces.map(function (piece, index) {
    return piece.team !== this.teamIndex ? index : -1;
  }, this).filter(function (ind) {
    return ind !== -1;
  }, this);
};
GameAI.prototype.myAvailableToMovePieceIndicies = function (boardState) {
  return this.myAlivePieceIndicies(boardState).filter(function (ind) {
    return boardState.movedThisTurn.indexOf(ind) === -1;
  }, this);
};
GameAI.prototype.getAvailablePaths = function (boardState, pieceToMove) {
  var stepMap = {};

  // breadth first search
  var bfs = function (x, y, prevX, prevY, prevSteps, left) {
    var result = [];
    var steps = prevSteps.concat([]); // quick copy

    // don't perform for off-map coordinates
    if (x < 0 || x >= boardState.terrain[0].length || y < 0 || y >= boardState.terrain.length) { return result; }

    if (prevX !== null && prevY !== null) { // use null to indicate our first call on the start spot
      // check base cases
      if (left === 0 || (x === prevX && y === prevY)) { return result; }

      // bomb out if the position has blocked terrain
      if (boardState.terrain[y][x] === 1) {
        return result;
      }

      // bomb out if the position has another character on it
      if (boardState.pieces.reduce(function (val, piece) {
        return (piece.position.x === x && piece.position.y === y) || val;
      }, false)) {
        return result;
      }

      steps = steps.concat( [ { x: x, y: y} ] );
      result.push({steps: steps});
      if (stepMap[x + ':' + y] === undefined) {
        stepMap[x + ':' + y] = steps;
      }
    }

    // recurse
    result = result.concat(bfs(x + 1, y + 0, x, y, steps, left - 1));
    result = result.concat(bfs(x - 1, y + 0, x, y, steps, left - 1));
    result = result.concat(bfs(x + 0, y + 1, x, y, steps, left - 1));
    result = result.concat(bfs(x + 0, y - 1, x, y, steps, left - 1));

    return result;
  };

  bfs(boardState.pieces[pieceToMove].position.x, boardState.pieces[pieceToMove].position.y, null, null, [], 5);
  return stepMap;
};

DeadSimpleAI = function (teamIndex) {
  GameAI.call(this, teamIndex);
};
DeadSimpleAI.prototype.getCommandForBoardState = function(boardState) {
  return new GameLogic.EndTurnCommand();
};


DumbMoveAI = function (teamIndex) {
  GameAI.call(this, teamIndex);
};
DumbMoveAI.prototype.getCommandForBoardState = function(boardState) {

  for (var i = boardState.pieces.length - 1; i >= 0; i--) {
    if (boardState.pieces[i].team === this.teamIndex && boardState.movedThisTurn.indexOf(i) === -1 && boardState.kos.indexOf(i) === -1) {
      var mc = new GameLogic.MoveCommand();
      mc.piece = i;
      mc.steps.push({ x: boardState.pieces[i].position.x + 1, y: boardState.pieces[i].position.y });
      mc.steps.push({ x: boardState.pieces[i].position.x + 1, y: boardState.pieces[i].position.y + 1 });

      if (GameLogic.ApplyCommand(boardState, mc).length === 0) {
        mc.steps = [];
      }

      return mc;
    }
  }

  return new GameLogic.EndTurnCommand();
};

DebugAttackAI = function (teamIndex) {
  GameAI.call(this, teamIndex);
};
DebugAttackAI.prototype.getCommandForBoardState = function(boardState) {

  if (boardState.attackedThisTurn.indexOf(7) !== -1) {
    return new GameLogic.EndTurnCommand();
  }

  var ac = new GameLogic.AttackCommand();
  ac.attacker = 7;
  ac.target = 5;
  ac.style = -1;
  return ac;
};

YaoiJamAI = function (teamIndex) {
  GameAI.call(this, teamIndex);
};
YaoiJamAI.prototype = Object.create(GameAI.prototype);
YaoiJamAI.prototype.getCommandForBoardState = function(boardState) {

  // Get the pieces we have that are available to move.
  var piecesToMove = this.myAvailableToMovePieceIndicies(boardState);

  // If there are none we can move atm, end the turn.
  if (piecesToMove.length === 0) {
    return new GameLogic.EndTurnCommand();
  }

  var stepMap = this.getAvailablePaths(boardState, piecesToMove[0]);
  var stepMapKeys = Object.keys(stepMap);

  var mc = new GameLogic.MoveCommand();
  mc.piece = piecesToMove[0];
  mc.steps = stepMap[stepMapKeys[~~(stepMapKeys.length * Math.random())]];

  // if we can't move forward one step, then don't worry about it
  if (GameLogic.ApplyCommand(boardState, mc).length === 0) {
    mc.steps = [];
  }

  return mc;
};

