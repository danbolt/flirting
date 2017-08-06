var GameAI = function (teamIndex) {
  this.teamIndex = teamIndex;
};
GameAI.prototype.getCommandForBoardState = function(boardState) {
  throw "Daniel, don't use the default GameAI. 😠"
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
GameAI.prototype.myAvailableToAttackPieceIndicies = function (boardState) {
  return this.myAlivePieceIndicies(boardState).filter(function (ind) {
    return boardState.attackedThisTurn.indexOf(ind) === -1 && boardState.movedThisTurn.indexOf(ind) !== -1;
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
GameAI.prototype.addAttackOppurtunities = function (boardState, stepMap) {
  var result = JSON.parse(JSON.stringify(stepMap));

  var keys = Object.keys(result);
  keys.forEach(function (key, index) {
    var steps = result[key];
    steps.targets = [];
    var xPos = steps[steps.length - 1].x;
    var yPos = steps[steps.length - 1].y;

    if (boardState.getPieceForPosition(xPos + 1, yPos) && boardState.getPieceForPosition(xPos + 1, yPos).team !== this.teamIndex) {
      steps.targets.push(boardState.pieces.indexOf(boardState.getPieceForPosition(xPos + 1, yPos)));
    }
    if (boardState.getPieceForPosition(xPos - 1, yPos) && boardState.getPieceForPosition(xPos - 1, yPos).team !== this.teamIndex) {
      steps.targets.push(boardState.pieces.indexOf(boardState.getPieceForPosition(xPos - 1, yPos)));
    }
    if (boardState.getPieceForPosition(xPos, yPos + 1) && boardState.getPieceForPosition(xPos, yPos + 1).team !== this.teamIndex) {
      steps.targets.push(boardState.pieces.indexOf(boardState.getPieceForPosition(xPos, yPos + 1)));
    }
    if (boardState.getPieceForPosition(xPos, yPos - 1) && boardState.getPieceForPosition(xPos, yPos - 1).team !== this.teamIndex) {
      steps.targets.push(boardState.pieces.indexOf(boardState.getPieceForPosition(xPos, yPos - 1)));
    }
  }, this);

  return result;
};
GameAI.prototype.removeNonAttackMoves = function (boardState, stepMap) {
  var result = {};

  var keys = Object.keys(stepMap);
  keys.forEach(function (key, index) {
    if (stepMap[key].targets.length > 0) {
      result[key] = stepMap[key];
    }
  }, this);

  return result;
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

  // Get the pieces we have that are available to attack.
  var piecesToAttackWith = this.myAvailableToAttackPieceIndicies(boardState);
  piecesToAttackWith = piecesToAttackWith.filter(function (index) {
    var xPos = boardState.pieces[index].position.x;
    var yPos = boardState.pieces[index].position.y;

    if (boardState.getPieceForPosition(xPos + 1, yPos) && boardState.getPieceForPosition(xPos + 1, yPos).team !== this.teamIndex) {
      return true;
    }
    if (boardState.getPieceForPosition(xPos - 1, yPos) && boardState.getPieceForPosition(xPos - 1, yPos).team !== this.teamIndex) {
      return true;
    }
    if (boardState.getPieceForPosition(xPos, yPos + 1) && boardState.getPieceForPosition(xPos, yPos + 1).team !== this.teamIndex) {
      return true;
    }
    if (boardState.getPieceForPosition(xPos, yPos - 1) && boardState.getPieceForPosition(xPos, yPos - 1).team !== this.teamIndex) {
      return true;
    }
  }, this);

  if (piecesToAttackWith.length > 0) {
    var ac = new GameLogic.AttackCommand();
    ac.attacker = piecesToAttackWith[0];
    ac.syle = -1;

    var targets = []
    var xPos = boardState.pieces[ac.attacker].position.x;
    var yPos = boardState.pieces[ac.attacker].position.y;

    if (boardState.getPieceForPosition(xPos + 1, yPos) && boardState.getPieceForPosition(xPos + 1, yPos).team !== this.teamIndex) {
      targets.push(boardState.pieces.indexOf(boardState.getPieceForPosition(xPos + 1, yPos)));
    }
    if (boardState.getPieceForPosition(xPos - 1, yPos) && boardState.getPieceForPosition(xPos - 1, yPos).team !== this.teamIndex) {
      targets.push(boardState.pieces.indexOf(boardState.getPieceForPosition(xPos - 1, yPos)));
    }
    if (boardState.getPieceForPosition(xPos, yPos + 1) && boardState.getPieceForPosition(xPos, yPos + 1).team !== this.teamIndex) {
      targets.push(boardState.pieces.indexOf(boardState.getPieceForPosition(xPos, yPos + 1)));
    }
    if (boardState.getPieceForPosition(xPos, yPos - 1) && boardState.getPieceForPosition(xPos, yPos - 1).team !== this.teamIndex) {
      targets.push(boardState.pieces.indexOf(boardState.getPieceForPosition(xPos, yPos - 1)));
    }

    var bestTargetIndex = targets.reduce(function(best, t) {
      if (best === null) {
        return t;
      } else {
        var bestDamage = GameLogic.ComputeAttackDamage(-1, -1, boardState.pieces[ac.attacker].romanceType, boardState.pieces[best].romanceType);
        var tDamage = GameLogic.ComputeAttackDamage(-1, -1, boardState.pieces[ac.attacker].romanceType, boardState.pieces[t].romanceType);

        if (bestDamage >= tDamage) {
          return best;
        } else {
          return t;
        }
      }
    }, null);

    ac.target = bestTargetIndex;
    return ac;

  } else if (piecesToMove.length > 0) {
    var mc = new GameLogic.MoveCommand();
    mc.piece = piecesToMove[0];

    var stepMap = this.getAvailablePaths(boardState, piecesToMove[0]);
    stepMap = this.addAttackOppurtunities(boardState, stepMap);
    stepMap = this.removeNonAttackMoves(boardState, stepMap);

    var stepMapKeys = Object.keys(stepMap);
    if (stepMapKeys.length > 0 ) {
      mc.steps = stepMap[stepMapKeys[~~(stepMapKeys.length * Math.random())]];
    }

    return mc;
  } else {
    return new GameLogic.EndTurnCommand();
  }
};

