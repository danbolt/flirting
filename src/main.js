
var Gameplay = function () {
  this.boardState = null;

  this.tileSize = 16;
};
Gameplay.prototype.create = function () {
  this.boardState = new GameLogic.BoardState();

  this.boardState.teams.push('red');
  this.boardState.teams.push('blue');

  var testChar1 = new GameLogic.BoardPiece();
  testChar1.position.x = 6;
  testChar1.position.y = 2;
  testChar1.name = 'Bapi';
  testChar1.team = 0;
  this.boardState.pieces.push(testChar1);

  var testChar2 = new GameLogic.BoardPiece();
  testChar2.position.x = 2;
  testChar2.position.y = 4;
  testChar2.name = 'Fish';
  testChar2.team = 1;
  this.boardState.pieces.push(testChar2);

  var testChar3 = new GameLogic.BoardPiece();
  testChar3.position.x = 8;
  testChar3.position.y = 5;
  testChar3.name = 'Chet';
  testChar3.team = 1;
  this.boardState.pieces.push(testChar3);

  this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR).onUp.add(function () {
    var testMoveCommand = new GameLogic.MoveCommand();
    testMoveCommand.piece = 0;
    for (var i = 1; i <= 3; i++) {
      if (testMoveCommand.steps.length > 0) {
        if ( i % 2 === 0) {
          testMoveCommand.steps.push( { x: testMoveCommand.steps[testMoveCommand.steps.length - 1].x, y: testMoveCommand.steps[testMoveCommand.steps.length - 1].y + 1 } );
        } else {
          testMoveCommand.steps.push( { x: testMoveCommand.steps[testMoveCommand.steps.length - 1].x + 1, y: testMoveCommand.steps[testMoveCommand.steps.length - 1].y } );
        }
      } else {
        testMoveCommand.steps.push( { x: this.boardState.pieces[0].position.x, y: this.boardState.pieces[0].position.y + 1 } );
      }
    }
    var moveResults = GameLogic.ApplyMoveCommand(this.boardState, testMoveCommand);

    moveResults.forEach(function (result) {
      this.boardState = GameLogic.ApplyMoveResult(this.boardState, result);
    }, this);
  }, this);
};
Gameplay.prototype.shutdown = function () {
  this.boardState = null;
};
Gameplay.prototype.render = function () {
  //this.game.debug.geom(new Phaser.Rectangle(10, 10, 16, 16));

  this.boardState.pieces.forEach(function (piece) {
    this.game.debug.geom(new Phaser.Rectangle(piece.position.x * this.tileSize, piece.position.y * this.tileSize, this.tileSize, this.tileSize), this.boardState.teams[piece.team])
  }, this);
};

var main = function () {
  var game = new Phaser.Game(320, 240, Phaser.AUTO, undefined, undefined, false, false);

  game.state.add('Gameplay', Gameplay, false);
  game.state.start('Gameplay');
};

