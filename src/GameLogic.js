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
    this.desiredDestination = { x: -1, y: -1 };
  };
  MoveCommand.prototype = Object.create(Command.prototype);

  // --- command results ---

  var Result = function () {
    //
  };

  var MoveResult = function () {
    Result.call(this);

    this.piece = -1;
    this.destination = { x: -1, y: -1 };
  };
  MoveResult.prototype = Object.create(Result.prototype);

  // --- logic functions ---

  var ApplyMoveCommand = function (boardState, moveCommand) {
    var output = [];

    // ensure the piece is an index within range of the board state array
    if (Number.isInteger(moveCommand.piece) && moveCommand.piece >= 0 && moveCommand.piece < boardState.pieces.length) {
      var pieceToMove = boardState.pieces[moveCommand.piece];

      // ensure the piece is able to move the complete limit
      var distanceTravelled = ~~(Math.abs(pieceToMove.position.x - moveCommand.desiredDestination.x) + Math.abs(pieceToMove.position.y - moveCommand.desiredDestination.y));
      if (distanceTravelled <= baseMoveDistance) {
        var moveResult = new MoveResult();
        moveResult.piece = moveCommand.piece;
        moveResult.destination.x = moveCommand.desiredDestination.x;
        moveResult.destination.y = moveCommand.desiredDestination.y;
        output.push(moveResult);
      }
    }

    return output;
  };

  var ApplyMoveResult = function (boardState, moveResult) {
    var newBoardState = JSON.parse(JSON.stringify(boardState));

    newBoardState.pieces[moveResult.piece].position.x = moveResult.destination.x;
    newBoardState.pieces[moveResult.piece].position.y = moveResult.destination.y;

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
