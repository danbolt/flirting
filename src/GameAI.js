var GameAI = function (teamIndex) {
  this.teamIndex = teamIndex;
};
GameAI.prototype.getCommandForBoardState = function(boardState) {
  throw "Daniel, don't use the default GameAI."
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

DumpAttackAI = function (teamIndex) {
  GameAI.call(this, teamIndex);
};
DumpAttackAI.prototype.getCommandForBoardState = function(boardState) {

  if (boardState.attackedThisTurn.indexOf(7) !== -1) {
    return new GameLogic.EndTurnCommand();
  }

  var ac = new GameLogic.AttackCommand();
  ac.attacker = 7;
  ac.target = 5;
  ac.style = -1;
  return ac;
};


