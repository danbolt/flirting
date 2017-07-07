var GameAI = function (teamIndex) {
  this.teamIndex = teamIndex;
};
GameAI.prototype.getCommandForBoardState = function(boardState) {
  throw "Daniel, don't use the default GameAI."
};

DeadSimpleAI = function (teamIndex) {
  GameAI.call(this, teamIndex);
}
;
DeadSimpleAI.prototype.getCommandForBoardState = function(boardState) {
  return new GameLogic.EndTurnCommand();
};
