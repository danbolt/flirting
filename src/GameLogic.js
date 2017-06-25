var GameLogic = (function () {
  var gameLogic = {};

  var undefinedName = 'UNDEFINED';

  var baseMoveDistance = 4;

  // --- game state ---

  var BoardState = function () {
    this.pieces = [];
    this.teams = [];
  };

  var BoardPiece = function () {
    this.position = { x: -1, y: -1};
    this.name = undefinedName;
    this.team = -1;
  };

  // --- game commands ---

  var Command = function () {
    //
  };

  var MoveCommand = function () {
    Command.call(this);

    this.piece = -1;
    this.steps = [];
  };
  MoveCommand.prototype = Object.create(Command.prototype);

  // --- command results ---

  var Result = function () {
    //
  };

  var MoveResult = function () {
    Result.call(this);

    this.piece = -1;
    this.steps = [];
  };
  MoveResult.prototype = Object.create(Result.prototype);

  // --- logic functions ---

  var ApplyMoveCommand = function (boardState, moveCommand) {
    var output = [];

    // ensure the piece is an index within range of the board state array
    if (Number.isInteger(moveCommand.piece) && moveCommand.piece >= 0 && moveCommand.piece < boardState.pieces.length) {
      var pieceToMove = boardState.pieces[moveCommand.piece];

      // check if the path follows a linear movement
      var isPathConsistent = true;
      var step = { x: pieceToMove.position.x, y: pieceToMove.position.y };
      moveCommand.steps.forEach(function (nextStep) {
        if (!((Math.abs(step.x - nextStep.x) === 1 && Math.abs(step.y - nextStep.y) !== 1) ||
              (Math.abs(step.x - nextStep.x) !== 1 && Math.abs(step.y - nextStep.y) === 1))) {
          isPathConsistent = false;
        }

        step.x = nextStep.x;
        step.y = nextStep.y;
      }, this);

      // ensure the piece is able to move the provided path
      if (moveCommand.steps.length <= baseMoveDistance && isPathConsistent) {
        var moveResult = new MoveResult();
        moveResult.piece = moveCommand.piece;
        moveResult.steps = JSON.parse(JSON.stringify(moveCommand.steps));
        output.push(moveResult);
      }
    }

    return output;
  };

  var ApplyMoveResult = function (boardState, moveResult) {
    var newBoardState = JSON.parse(JSON.stringify(boardState));

    newBoardState.pieces[moveResult.piece].position.x = moveResult.steps[moveResult.steps.length - 1].x;
    newBoardState.pieces[moveResult.piece].position.y = moveResult.steps[moveResult.steps.length - 1].y;

    return newBoardState;
  };

  gameLogic.BoardState = BoardState;
  gameLogic.BoardPiece = BoardPiece;
  gameLogic.Command = Command;
  gameLogic.MoveCommand = MoveCommand;
  gameLogic.Result = Result;
  gameLogic.ApplyMoveCommand = ApplyMoveCommand;
  gameLogic.MoveResult = MoveResult;
  gameLogic.ApplyMoveResult = ApplyMoveResult;

  return gameLogic;
})();
