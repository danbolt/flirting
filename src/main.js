
var Gameplay = function () {
  this.boardState = null;

  // --- ui state
  this.tileSize = 16;

  // --- phaser ui data --
  this.cursor = null;
  this.tilemap = null;
  this.characterSprites = null;
  this.dataPane = null;
  this.portrait = null;
  this.selectedCharacterText = null;
};
Gameplay.prototype.preload = function () {
  //
};
Gameplay.prototype.create = function () {

  // initialize game state
  this.boardState = new GameLogic.BoardState();
  this.boardState.teams.push('red');
  this.boardState.teams.push('blue');

  var testChar1 = new GameLogic.BoardPiece();
  testChar1.position.x = 7;
  testChar1.position.y = 2;
  testChar1.name = 'Bapi';
  testChar1.hp = 5;
  testChar1.team = 0;
  testChar1.romanceType = GameLogic.RomanceType.STYLISH;
  testChar1.style = GameLogic.Style.NONE;
  this.boardState.pieces.push(testChar1);

  var testChar2 = new GameLogic.BoardPiece();
  testChar2.position.x = 2;
  testChar2.position.y = 4;
  testChar2.name = 'Fish';
  testChar2.hp = 2;
  testChar2.team = 1;
  testChar2.style = GameLogic.Style.BOLD;
  testChar2.romanceType = GameLogic.RomanceType.CLEVER;
  this.boardState.pieces.push(testChar2);

  var testChar3 = new GameLogic.BoardPiece();
  testChar3.position.x = 8;
  testChar3.position.y = 5;
  testChar3.name = 'Chet';
  testChar3.hp = 6;
  testChar3.team = 1;
  testChar3.style = GameLogic.Style.SWEET;
  testChar3.romanceType = GameLogic.RomanceType.INTELLECTUAL;
  this.boardState.pieces.push(testChar3);

  // initialize map
  this.tilemap = this.game.add.tilemap(null, this.tileSize, this.tileSize, 30, 30);
  this.tilemap.addTilesetImage('map_image_data', 'map_sprites_tilesheet', 16, 16);
  var mapLayer = this.tilemap.createBlankLayer('map', 30, 30, this.tileSize, this.tileSize);
  this.tilemap.fill(2, 0, 0, 30, 30, mapLayer);
  mapLayer.resizeWorld();

  // initialize characters on map
  this.characterSprites = this.game.add.group();
  this.boardState.pieces.forEach(function (piece, index) {
    var newCharacterOnMap = this.game.add.sprite(piece.position.x * this.tileSize, piece.position.y * this.tileSize, 'map_sprites', 32);
    newCharacterOnMap.data.index = index;

    if (piece.name === 'Bapi') {
      newCharacterOnMap.animations.add('idle', [32, 33, 34], 3, true);
    } else {
      newCharacterOnMap.animations.add('idle', [35, 36, 37], 3, true);
    }

    newCharacterOnMap.animations.play('idle');
    this.characterSprites.addChild(newCharacterOnMap);
  }, this);

  // initialize ui
  this.dataPane = this.game.add.group();
  this.dataPane.fixedToCamera = true;
  this.dataPane.cameraOffset.x = this.game.width - 112;

  var backing = this.game.add.sprite(0, 0, 'map_sprites', 3);
  backing.width = 112;
  backing.height = this.game.height;
  this.dataPane.addChild(backing);
  this.portrait = this.game.add.sprite(24, this.game.height - 160 + 24, 'portraits', 0);
  this.dataPane.addChild(this.portrait);
  this.selectedCharacterText = this.game.add.text(0, 0, '', { font: 'monospace', size: '16px' });
  this.selectedCharacterText.smoothed = false;
  this.dataPane.addChild(this.selectedCharacterText);
  this.selectedCharacterText.position.set(0, 0);

  // initialize ui logic

  var stitch = function(uxElementA, uxElementB) { uxElementA.confirm = uxElementB; uxElementB.back = uxElementA; };
  //  ^^^^^^ maybe we should put this into different functionality? 
  
  this.cursorUX = new SelectCharacterUXElement(this.game, this);
  this.cursorUX.show();
  var moveUX = new MoveCharacterUXElement(this.game, this);
  stitch(this.cursorUX, moveUX);

  this.game.camera.width = this.game.width - 112;
  this.game.camera.setBoundsToWorld();
  this.game.camera.follow(this.cursorUX.cursor, Phaser.Camera.FOLLOW_TOPDOWN, 0.2, 0.2);

  // handle UI logic
  this.currentUX = this.cursorUX;
  this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR).onUp.add(function () {
    if (this.currentUX.onConfirm() === false) { return; }

    if (this.currentUX.confirm) {
      this.currentUX.hide();
      this.currentUX.confirm.show();
      this.currentUX = this.currentUX.confirm;
    }
  }, this);
  this.game.input.keyboard.addKey(Phaser.KeyCode.BACKSPACE).onUp.add(function () {
    if (this.currentUX.onBack() === false) { return; }

    if (this.currentUX.back) {
      this.currentUX.hide();
      this.currentUX.back.show();
      this.currentUX = this.currentUX.back;
    }
  }, this);
  this.game.input.keyboard.addKey(Phaser.KeyCode.DOWN).onUp.add(function () {
    this.currentUX.onDown();

    this.refreshPaneData();
  }, this);
  this.game.input.keyboard.addKey(Phaser.KeyCode.UP).onUp.add(function () {
    this.currentUX.onUp();

    this.refreshPaneData();
  }, this);
  this.game.input.keyboard.addKey(Phaser.KeyCode.RIGHT).onUp.add(function () {
    this.currentUX.onRight();

    this.refreshPaneData();
  }, this);
  this.game.input.keyboard.addKey(Phaser.KeyCode.LEFT).onUp.add(function () {
    this.currentUX.onLeft();

    this.refreshPaneData();
  }, this);

  /*
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
      this.boardState = GameLogic.ApplyResult(this.boardState, result);
    }, this);
  }, this);

    this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER).onUp.add(function () {
    var atk = new GameLogic.AttackCommand();
    atk.attacker = 0;
    atk.target = 2;
    atk.style = GameLogic.Style.BOLD;
    var attackResults = GameLogic.ApplyAttackCommand(this.boardState, atk)

    attackResults.forEach(function (result) {
      this.boardState = GameLogic.ApplyResult(this.boardState, result);
    }, this);
  }, this);

  */
};
Gameplay.prototype.shutdown = function () {
  this.boardState = null;

  this.cursor = null;
  this.tilemap = null;
  this.characterSprites = null;
  this.dataPane = null;
  this.portrait = null;
  this.selectedCharacterText = null;
};
Gameplay.prototype.refreshPaneData = function () {
  var selectedPieces = this.boardState.pieces.filter(function (piece) { return piece.position.x === this.cursorUX.cursorX && piece.position.y === this.cursorUX.cursorY }, this);

  if (selectedPieces.length > 0) {
    var selectedPiece = selectedPieces[0];
    if (selectedPiece.name === 'Bapi') {
      this.portrait.frame = 1;
    } else {
      this.portrait.frame = 2;
    }

    this.selectedCharacterText.text = selectedPiece.name;
  } else {
    this.portrait.frame = 0;
    this.selectedCharacterText.text = '';
  }
};
Gameplay.prototype.processCommand = function (command) {
  var results = GameLogic.ApplyCommand(this.boardState, command);
  results.forEach(function (result) {
    this.boardState = GameLogic.ApplyResult(this.boardState, result);
  }, this);

  this.refreshBoardView();
};
Gameplay.prototype.refreshBoardView = function () {
  this.characterSprites.forEachAlive(function (sprite) {
    sprite.x = this.boardState.pieces[sprite.data.index].position.x * this.tileSize;
    sprite.y = this.boardState.pieces[sprite.data.index].position.y * this.tileSize;
  }, this);
};

var Preload = function () {
  //
};
Preload.prototype.init = function () {
  this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  this.game.scale.refresh();

  this.game.scale.pageAlignHorizontally = true;
  this.game.scale.pageAlignVertically = true;

  // enable crisp rendering
  this.game.stage.smoothed = false;
  this.game.renderer.renderSession.roundPixels = true;  
  Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
  PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST; //for WebGL
};
Preload.prototype.preload = function () {
  this.game.load.image('map_sprites_tilesheet', 'asset/img/map_sprites.png');

  this.game.load.spritesheet('portraits', 'asset/img/portraits.png', 100, 160);
  this.game.load.spritesheet('map_sprites', 'asset/img/map_sprites.png', 16, 16);
};
Preload.prototype.create = function() {
  this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.DOWN);
  this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.UP);
  this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);

  this.game.state.start('Gameplay');
};

var main = function () {
  var game = new Phaser.Game(320, 180, Phaser.AUTO, undefined, undefined, false, false);

  game.state.add('Preload', Preload, false);
  game.state.add('Gameplay', Gameplay, false);
  game.state.start('Preload');
};

