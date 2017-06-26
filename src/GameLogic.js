var GameLogic = (function () {
  var gameLogic = {};

  var undefinedName = 'UNDEFINED';

  var baseMoveDistance = 4;

  // --- math stuff
  Number.prototype.trueMod = function(n) {
    return ((this%n)+n)%n;
  };

  // --- enumerations ---

  var Style = {
    NONE: -1,
    SWEET: 0,
    BOLD: 1,
    BRASH: 2,
  };
  Style.ComputeTypeResult = function(attackerStyle, defenderStyle) {
    // Don't compute if one has no style
    if (attackerStyle === Style.NONE || defenderStyle === Style.NONE) {
      return 0;
    }

    // Rock-paper-scissors style results
    var battleResult = (attackerStyle - defenderStyle).trueMod(3);
    if (battleResult === 0) { return 0; }
    if (battleResult % 2 === 0) { return -1; }
    if (battleResult % 2 === 1) { return 1; }
  };
  Style.getStringName = function(style) {
    switch (style) {
      case Style.NONE:
        return "None";
      case Style.SWEET:
        return "Sweet";
      case Style.BOLD:
        return "Bold";
      case Style.BRASH:
        return "Brash";
    }

    return "None";
  }

  var RomanceType = {
    RUGGED: 0,
    MYSTERIOUS: 1,
    INTELLECTUAL: 2,
    CLEVER: 3,
    STYLISH: 4,
  };
  RomanceType.ComputeTypeResult = function(attackerType, defenderType) {
    // Rock-paper-scissors style results
    var battleResult = (attackerType - defenderType).trueMod(5);
    if (battleResult === 0) { return 0; }
    if (battleResult % 2 === 0) { return -1; }
    if (battleResult % 2 === 1) { return 1; }
  };
  RomanceType.getStringName = function(romanceType) {
    switch (romanceType) {
      case RomanceType.RUGGED:
        return "Rugged";
      case RomanceType.MYSTERIOUS:
        return "Mysterious";
      case RomanceType.INTELLECTUAL:
        return "Intellectual";
      case RomanceType.CLEVER:
        return "Clever";
      case RomanceType.STYLISH:
        return "Stylish";
    }
  }

  // --- game logic utility functions --

  var ComputeAttackDamage = function(attackerStyle, defenderStyle, attackerRomanceType, defenderRomanceType) {
    return 1 + Style.ComputeTypeResult(attackerStyle, defenderStyle) + RomanceType.ComputeTypeResult(attackerRomanceType, defenderRomanceType);
  };

  // --- game state ---

  var BoardState = function () {
    this.pieces = [];
    this.teams = [];
    this.kos = [];
    this.turn = 0;
  };
  BoardState.prototype.currentTurnTeam = function () { return this.turn % this.teams.length; };

  var BoardPiece = function () {
    this.position = { x: -1, y: -1};
    this.name = undefinedName;
    this.team = -1;
    this.hp = 5;
    this.style = Style.NONE;
    this.romanceType = RomanceType.RUGGED;
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

  var AttackCommand = function () {
    Command.call(this);

    this.attacker = -1;
    this.target = -1;
    this.style = Style.NONE;
  };
  AttackCommand.prototype = Object.create(Command.prototype);

  var EndTurnCommand = function () {
    Command.call(this);
  };
  EndTurnCommand.prototype = Object.create(Command.prototype);

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

  var AttackResult = function () {
    Result.call(this);

    this.attacker = -1;
    this.target = -1;
    this.style = Style.NONE;
  };
  AttackResult.prototype = Object.create(Result.prototype);

  var KnockoutResult = function () {
    Result.call(this);

    this.piece = -1;
    this.koer = -1;
  };
  KnockoutResult.prototype = Object.create(KnockoutResult.prototype);

  var EndTurnResult = function () {
    Result.call(this);
  };
  EndTurnResult.prototype = Object.create(EndTurnResult.prototype);

  // --- logic functions ---

  var ApplyMoveCommand = function (boardState, moveCommand) {
    var output = [];

    // ensure the piece is an index within range of the board state array
    if (Number.isInteger(moveCommand.piece) && moveCommand.piece >= 0 && moveCommand.piece < boardState.pieces.length && boardState.pieces[moveCommand.piece].team === boardState.currentTurnTeam()) {
      var pieceToMove = boardState.pieces[moveCommand.piece];

      // check if the character is alive
      var isCharacterAlive = boardState.kos.indexOf(moveCommand.piece) === -1;

      // check if the path follows a linear movement
      var isPathConsistent = true;
      var step = { x: pieceToMove.position.x, y: pieceToMove.position.y };
      moveCommand.steps.forEach(function (nextStep) {
        if (!((Math.abs(step.x - nextStep.x) === 1 && Math.abs(step.y - nextStep.y) !== 1) ||
              (Math.abs(step.x - nextStep.x) !== 1 && Math.abs(step.y - nextStep.y) === 1))) {
          isPathConsistent = false;
        }

        // do not let paths blocked by an enemy piece go through
        boardState.pieces.forEach(function (piece, index) {
        if (piece.position.x === step.x && piece.position.y === step.y && pieceToMove.team !== piece.team && boardState.kos.indexOf(index) === -1) {
          isPathConsistent = false;
        }
      }, this);

        step.x = nextStep.x;
        step.y = nextStep.y;
      }, this);

      // check if there is anyone on the end step
      var destinationIsNotBlocked = true;
      boardState.pieces.forEach(function (piece) {
        if (piece.position.x === moveCommand.steps[moveCommand.steps.length - 1].x && piece.position.y === moveCommand.steps[moveCommand.steps.length - 1].y) {
          destinationIsNotBlocked = false;
        }
      }, this);

      // ensure the piece is able to move the provided path
      if (moveCommand.steps.length <= baseMoveDistance && isPathConsistent && destinationIsNotBlocked && isCharacterAlive) {
        var moveResult = new MoveResult();
        moveResult.piece = moveCommand.piece;
        moveResult.steps = JSON.parse(JSON.stringify(moveCommand.steps));
        output.push(moveResult);
      }
    }

    return output;
  };

  var ApplyAttackCommand = function (boardState, attackCommand) {
    // check command indicies
    if (!(Number.isInteger(attackCommand.attacker) && attackCommand.attacker >= 0 && attackCommand.attacker < boardState.pieces.length)) {
      return [];
    }
    if (!(Number.isInteger(attackCommand.target) && attackCommand.target >= 0 && attackCommand.target < boardState.pieces.length)) {
      return [];
    }

    if (boardState.pieces[attackCommand.attacker].team !== boardState.currentTurnTeam()) {
      return [];
    }

    if (boardState.kos.indexOf(attackCommand.attacker) !== -1 || boardState.kos.indexOf(attackCommand.target) !== -1) {
      return []
    }

    var attackerPiece = boardState.pieces[attackCommand.attacker];
    var targetPiece = boardState.pieces[attackCommand.target];

    // no friendly fire flirts
    if (attackerPiece.team === targetPiece.team) {
      return [];
    }

    // check style index range
    if (attackCommand.style < -1 || attackCommand.style >= 3) {
      return [];
    }

    if (!((Math.abs(attackerPiece.position.x - targetPiece.position.x) === 1 && Math.abs(attackerPiece.position.y - targetPiece.position.y) !== 1) ||
             (Math.abs(attackerPiece.position.x - targetPiece.position.x) !== 1 && Math.abs(attackerPiece.position.y - targetPiece.position.y) === 1))) {
      return [];
    }

    var output = [];

    var newAttackResult = new AttackResult();
    newAttackResult.attacker = attackCommand.attacker;
    newAttackResult.target = attackCommand.target;
    newAttackResult.style = attackCommand.style;

    output.push(newAttackResult);

    var damage = ComputeAttackDamage(newAttackResult.style, targetPiece.style, attackerPiece.romanceType, targetPiece.romanceType);
    if (targetPiece.hp - damage <= 0) {
      var newKOResult = new KnockoutResult();
      newKOResult.piece = attackCommand.target;
      newKOResult.koer = attackCommand.attacker;
      output.push(newKOResult);
    }

    return output;
  };

  var ApplyEndTurnCommand = function (boardState, endTurnCommand) {
    return [ new EndTurnCommand() ];
  }

  var ApplyMoveResult = function (boardState, moveResult) {
    var newBoardState = JSON.parse(JSON.stringify(boardState));
    Object.setPrototypeOf(newBoardState, BoardState.prototype);

    newBoardState.pieces[moveResult.piece].position.x = moveResult.steps[moveResult.steps.length - 1].x;
    newBoardState.pieces[moveResult.piece].position.y = moveResult.steps[moveResult.steps.length - 1].y;

    return newBoardState;
  };
  var ApplyAttackResult = function (boardState, attackResult) {
    var newBoardState = JSON.parse(JSON.stringify(boardState));
    Object.setPrototypeOf(newBoardState, BoardState.prototype);

    var attackerPiece = newBoardState.pieces[attackResult.attacker];
    var targetPiece = newBoardState.pieces[attackResult.target];

    var damage = ComputeAttackDamage(attackResult.style, targetPiece.style, attackerPiece.romanceType, targetPiece.romanceType);
    targetPiece.hp -= damage;

    return newBoardState;
  };
  var ApplyKnockoutResult = function (boardState, knockoutResult) {
    var newBoardState = JSON.parse(JSON.stringify(boardState));
    Object.setPrototypeOf(newBoardState, BoardState.prototype);

    newBoardState.kos.push(knockoutResult.piece);

    return newBoardState;
  };

  var ApplyEndTurnResult = function (boardState, endTurnResult) {
    var newBoardState = JSON.parse(JSON.stringify(boardState));
    Object.setPrototypeOf(newBoardState, BoardState.prototype);

    newBoardState.turn++;

    return newBoardState;
  };
  var ApplyResult = function (boardState, result) {
    if (result instanceof MoveResult) {
      return ApplyMoveResult(boardState, result);
    } else if (result instanceof AttackResult) {
      return ApplyAttackResult(boardState, result);
    } else if (result instanceof KnockoutResult) {
      return ApplyKnockoutResult(boardState, result);
    } else if (result instanceof EndTurnResult) {
      return ApplyEndTurnResult(boardState, result);
    }
  };

  gameLogic.Style = Style;
  gameLogic.RomanceType = RomanceType;
  gameLogic.BoardState = BoardState;
  gameLogic.BoardPiece = BoardPiece;
  gameLogic.Command = Command;
  gameLogic.MoveCommand = MoveCommand;
  gameLogic.AttackCommand = AttackCommand;
  gameLogic.EndTurnCommand = EndTurnCommand;
  gameLogic.Result = Result;
  gameLogic.ApplyMoveCommand = ApplyMoveCommand;
  gameLogic.ApplyAttackCommand = ApplyAttackCommand;
  gameLogic.MoveResult = MoveResult;
  gameLogic.AttackResult = AttackResult;
  gameLogic.KnockoutResult = KnockoutResult;
  gameLogic.ApplyResult = ApplyResult;
  gameLogic.EndTurnResult = EndTurnResult;

  return gameLogic;
})();
