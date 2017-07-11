
// TODO: Move this to its own file
var PortraitMap = {};
PortraitMap['Bapi'] = 1;
PortraitMap['Chet'] = 2;
PortraitMap['Fish'] = 3;
PortraitMap['Yang'] = 4;
PortraitMap['Joss'] = 5;
PortraitMap['Sanders'] = 6;
PortraitMap['Neil'] = 7;
PortraitMap['Jace'] = 8;
PortraitMap['Lester'] = 9;


var Gameplay = function () {
  this.boardState = null;
  this.ai = null;

  // --- ui state
  this.tileSize = 16;
  this.animating = false;

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

  // initialize map
  this.tilemap = this.game.add.tilemap('test_map_1');
  this.tilemap.addTilesetImage('map_sprites', 'map_sprites_tilesheet');
  var mapLayer = this.tilemap.createLayer(0);
  mapLayer.resizeWorld();

  // initialize game state
  this.boardState = new GameLogic.BoardState();
  this.boardState.teams.push('red');
  this.boardState.teams.push('blue');

  this.ai = new DumbMoveAI(1);

  mapLayer.layer.data.forEach(function (row, y) {
    this.boardState.terrain.push([]);

    row.forEach(function (t, x) {
      if (t.index === 3) {
        this.boardState.terrain[y].push(0);
      } else {
        this.boardState.terrain[y].push(1);
      }
    }, this);
  }, this);

  var testChar1 = new GameLogic.BoardPiece();
  testChar1.position.x = 7;
  testChar1.position.y = 2;
  testChar1.name = 'Bapi';
  testChar1.hp = 5;
  testChar1.team = 0;
  testChar1.romanceType = GameLogic.RomanceType.STYLISH;
  testChar1.style = GameLogic.Style.NONE;
  this.boardState.pieces.push(testChar1);

  var herob = new GameLogic.BoardPiece();
  herob.position.x = 9;
  herob.position.y = 3;
  herob.name = 'Yang';
  herob.hp = 4;
  herob.team = 0;
  herob.romanceType = GameLogic.RomanceType.CLEVER;
  herob.style = GameLogic.Style.NONE;
  this.boardState.pieces.push(herob);

  var heroc = new GameLogic.BoardPiece();
  heroc.position.x = 8;
  heroc.position.y = 4;
  heroc.name = 'Chet';
  heroc.hp = 5;
  heroc.team = 0;
  heroc.romanceType = GameLogic.RomanceType.RUGGED;
  heroc.style = GameLogic.Style.NONE;
  this.boardState.pieces.push(heroc);

  var herod = new GameLogic.BoardPiece();
  herod.position.x = 5;
  herod.position.y = 5;
  herod.name = 'Sanders';
  herod.hp = 5;
  herod.team = 0;
  herod.romanceType = GameLogic.RomanceType.RUGGED;
  herod.style = GameLogic.Style.NONE;
  this.boardState.pieces.push(herod);

  var heroe = new GameLogic.BoardPiece();
  heroe.position.x = 6;
  heroe.position.y = 6;
  heroe.name = 'Neil';
  heroe.hp = 5;
  heroe.team = 0;
  heroe.romanceType = GameLogic.RomanceType.RUGGED;
  heroe.style = GameLogic.Style.NONE;
  this.boardState.pieces.push(heroe);

  var herof = new GameLogic.BoardPiece();
  herof.position.x = 2;
  herof.position.y = 3;
  herof.name = 'Jace';
  herof.hp = 5;
  herof.team = 0;
  herof.romanceType = GameLogic.RomanceType.STYLISH;
  herof.style = GameLogic.Style.NONE;
  this.boardState.pieces.push(herof);

  var herog = new GameLogic.BoardPiece();
  herog.position.x = 1;
  herog.position.y = 3;
  herog.name = 'Lester';
  herog.hp = 5;
  herog.team = 0;
  herog.romanceType = GameLogic.RomanceType.RUGGED;
  herog.style = GameLogic.Style.NONE;
  this.boardState.pieces.push(herog);

  var testChar2 = new GameLogic.BoardPiece();
  testChar2.position.x = 2;
  testChar2.position.y = 4;
  testChar2.name = 'Fish';
  testChar2.hp = 1;
  testChar2.team = 1;
  testChar2.style = GameLogic.Style.BOLD;
  testChar2.romanceType = GameLogic.RomanceType.CLEVER;
  this.boardState.pieces.push(testChar2);

  var testChar3 = new GameLogic.BoardPiece();
  testChar3.position.x = 3;
  testChar3.position.y = 5;
  testChar3.name = 'Joss';
  testChar3.hp = 1;
  testChar3.team = 1;
  testChar3.style = GameLogic.Style.SWEET;
  testChar3.romanceType = GameLogic.RomanceType.INTELLECTUAL;
  this.boardState.pieces.push(testChar3);

  // initialize characters on map
  this.characterSprites = this.game.add.group();
  this.boardState.pieces.forEach(function (piece, index) {
    var newCharacterOnMap = this.game.add.sprite(piece.position.x * this.tileSize, piece.position.y * this.tileSize, 'map_sprites', 32);
    newCharacterOnMap.data.index = index;

    if (piece.team === 0) {
      newCharacterOnMap.animations.add('idle', [32, 33, 34], 3, true);
    } else {
      newCharacterOnMap.animations.add('idle', [35, 36, 37], 3, true);
    }

    newCharacterOnMap.animations.play('idle');
    this.characterSprites.addChild(newCharacterOnMap);
  }, this);

  // initialize ui
  this.animating = false;

  this.dataPane = this.game.add.group();
  this.dataPane.fixedToCamera = true;
  this.dataPane.cameraOffset.x = this.game.width - 112;

  var backing = this.game.add.sprite(0, 0, 'map_sprites', 3);
  backing.width = 112;
  backing.height = this.game.height;
  this.dataPane.addChild(backing);
  this.portrait = this.game.add.sprite(12, this.game.height - 160 + 24, 'portraits', 0);
  this.dataPane.addChild(this.portrait);
  this.selectedCharacterText = this.game.add.bitmapText(0, 0, 'newsgeek', '', 12);
  this.selectedCharacterText.smoothed = false;
  this.dataPane.addChild(this.selectedCharacterText);
  this.selectedCharacterText.position.set(2, 2);
  this.turnInfoText = this.game.add.bitmapText(0, this.game.height - 16, 'newsgeek', 'TURN', 16);
  this.turnInfoText.tint = 0xEE1112;
  this.dataPane.addChild(this.turnInfoText);

  // initialize ui logic

  var stitch = function(uxElementA, uxElementB) { uxElementA.confirm = uxElementB; uxElementB.back = uxElementA; };
  //  ^^^^^^ maybe we should put this into different functionality? 
  
  this.cursorUX = new SelectCharacterUXElement(this.game, this);
  this.cursorUX.show();
  this.moveUX = new MoveCharacterUXElement(this.game, this);
  stitch(this.cursorUX, this.moveUX);
  this.flirtUX = new CheckFlirtUXElement(this.game, this);
  stitch(this.moveUX, this.flirtUX);
  this.styleUX = new SelectFlirtStyleUXElement(this.game, this);
  stitch(this.flirtUX, this.styleUX);
  stitch(this.styleUX, this.cursorUX);

  this.dialogueUX = new DialogueUXElement(this.game, this);

  this.turnShowUX = new TurnStartUXElement(this.game, this);

  this.game.camera.width = this.game.width - 112;
  this.game.camera.setBoundsToWorld();
  this.game.camera.follow(this.cursorUX.cursor, Phaser.Camera.FOLLOW_TOPDOWN, 0.2, 0.2);

  this.game.input.keyboard.addKey(Phaser.KeyCode.ESC).onDown.add(function() {
    if (this.boardState.currentTurnTeam() === 0 && this.animating === false && this.cursorUX.showing) {
      this.processCommand(new GameLogic.EndTurnCommand());
    }
  }, this);

  // handle UI logic
  this.currentUX = this.cursorUX;
  this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR).onUp.add(function () {
    if (this.dialogueUX.showing === true) { return; }
    if (this.animating === true) { return; }
    if (this.currentUX.onConfirm() === false) { return; }

    if (this.currentUX.confirm) {
      this.currentUX.hide();
      this.currentUX.confirm.show();
      this.currentUX = this.currentUX.confirm;
    }
  }, this);
  this.game.input.keyboard.addKey(Phaser.KeyCode.BACKSPACE).onUp.add(function () {
    if (this.dialogueUX.showing === true) { return; }
    if (this.animating === true) { return; }
    if (this.currentUX.onBack() === false) { return; }

    if (this.currentUX.back) {
      this.currentUX.hide();
      this.currentUX.back.show();
      this.currentUX = this.currentUX.back;
    }
  }, this);
  this.game.input.keyboard.addKey(Phaser.KeyCode.DOWN).onUp.add(function () {
    if (this.dialogueUX.showing === true) { return; }
    if (this.animating === true) { return; }
    this.currentUX.onDown();

    this.refreshPaneData();
  }, this);
  this.game.input.keyboard.addKey(Phaser.KeyCode.UP).onUp.add(function () {
    if (this.dialogueUX.showing === true) { return; }
    if (this.animating === true) { return; }
    this.currentUX.onUp();

    this.refreshPaneData();
  }, this);
  this.game.input.keyboard.addKey(Phaser.KeyCode.RIGHT).onUp.add(function () {
    if (this.dialogueUX.showing === true) { return; }
    if (this.animating === true) { return; }
    this.currentUX.onRight();

    this.refreshPaneData();
  }, this);
  this.game.input.keyboard.addKey(Phaser.KeyCode.LEFT).onUp.add(function () {
    if (this.dialogueUX.showing === true) { return; }
    if (this.animating === true) { return; }
    this.currentUX.onLeft();

    this.refreshPaneData();
  }, this);


  this.refreshBoardView();
};
Gameplay.prototype.update = function () {
  // if it's the AI's turn and nothing is animating, process a turn this frame
  if (this.boardState.currentTurnTeam() === this.ai.teamIndex && this.animating === false) {
    this.processCommand(this.ai.getCommandForBoardState(this.boardState));
  }

  // if we moved all our pieces, the turn is over!
  if (this.boardState.currentTurnTeam() === 0 && this.animating === false && this.cursorUX.showing) {
    var allPlayerPiecesMoved = true;
    for (var i = 0; i < this.boardState.pieces.length; i++) {
      if (this.boardState.pieces[i].team === 0 && this.boardState.movedThisTurn.indexOf(i) === -1) {
        allPlayerPiecesMoved = false;
        break;
      }
    }
    if (allPlayerPiecesMoved === true) {
      this.processCommand(new GameLogic.EndTurnCommand());
    }
  }
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
  var selectedPieces = this.boardState.pieces.filter(function (piece, index) { return piece.position.x === this.cursorUX.cursorX && piece.position.y === this.cursorUX.cursorY && this.boardState.kos.indexOf(index) === -1; }, this);

  if (selectedPieces.length > 0) {
    var selectedPiece = selectedPieces[0];
    this.portrait.frame = PortraitMap[selectedPiece.name];

    this.selectedCharacterText.text = selectedPiece.name + '\n love: ' + selectedPiece.hp + '\n' + GameLogic.RomanceType.getStringName(selectedPiece.romanceType);
  } else {
    this.portrait.frame = 0;
    this.selectedCharacterText.text = '';
  }
};
Gameplay.prototype.processCommand = function (command) {
  if (this.animating === true) { return; }

  var results = GameLogic.ApplyCommand(this.boardState, command);
  if (results.length > 0) {
    // generate tweens for the results
    var resultTweens = [];

    results.forEach(function (result) {
      this.boardState = GameLogic.ApplyResult(this.boardState, result);

      
      if (result instanceof GameLogic.MoveResult) {
        var characterToMove = null;
        this.characterSprites.forEach(function (sprite) { if (sprite.data.index === result.piece) { characterToMove = sprite } });

        result.steps.forEach(function (step) {
          var t = this.game.add.tween(characterToMove);
          t.to( { x: step.x * this.tileSize, y: step.y * this.tileSize }, 100 );
          resultTweens.push(t);
        }, this);
      } else if (result instanceof GameLogic.AttackResult) {
        var characterToMove = null;
        this.characterSprites.forEach(function (sprite) { if (sprite.data.index === result.attacker) { characterToMove = sprite; } });

        var characterToGetHitOn = null;
        this.characterSprites.forEach(function (sprite) { if (sprite.data.index === result.target) { characterToGetHitOn = sprite; } });

        var t1 = this.game.add.tween(characterToMove);
        t1.to( { x: ((characterToMove.x + characterToGetHitOn.x) / 2), y: ((characterToMove.y + characterToGetHitOn.y) / 2) }, 100 );
        resultTweens.push(t1);
        var t2 = this.game.add.tween(characterToMove);
        t2.to( { x: characterToMove.x, y: characterToMove.y }, 100 );
        resultTweens.push(t2);

        t1.doNotChain = true;
        t1.onComplete.add(function () {
          this.dialogueUX.show(function () {
            t2.start();
          });
        }, this);
      } else if (result instanceof GameLogic.KnockoutResult) {
        var characterToMove = null;
        this.characterSprites.forEach(function (sprite) { if (sprite.data.index === result.piece) { characterToMove = sprite } });

        var playerTeam = this.boardState.pieces[characterToMove.data.index].team === 0;
        var t = this.game.add.tween(characterToMove);
        t.to( { x: this.game.camera.x + (playerTeam ? 150 : -150) }, 1400, undefined, false, 500);
        resultTweens.push(t);

      } else if (result instanceof GameLogic.EndTurnResult) {
        var stubTween = this.game.add.tween(this.characterSprites.children[0]);
        stubTween.to( { x: this.characterSprites.children[0].x }, 10);
        stubTween.doNotChain = true;
        resultTweens.push(stubTween);

        var firstTween = null;
        this.characterSprites.forEach(function(sprite) {
          if (this.boardState.pieces[sprite.data.index].team === this.boardState.currentTurnTeam()) {
            var t1 = this.game.add.tween(sprite);
            t1.to( {y: sprite.y - Math.random() * 7 - 5}, 100 + Math.random() * 60, Phaser.Easing.Quadratic.In);
            var t2 = this.game.add.tween(sprite);
            t2.to( {y: sprite.y}, 120, Phaser.Easing.Quadratic.Out);

            if (firstTween === null) {
              resultTweens.push(t1);
              resultTweens.push(t2);

              firstTween = t1;
              firstTween.onStart.add( function () { this.turnInfoText.text = 'TURN ' + this.boardState.turn; }, this); 
            } else {
              t1.chain(t2);

              firstTween.onStart.add(function () { t1.start(); }, this);
            }
            
          };
        }, this);

        stubTween.onComplete.add(function () {
          this.turnShowUX.show(function () {
            firstTween.start();
          })
        }, this);
      }
    }, this);

    // tween or refresh if no tweens
    if (resultTweens.length > 0) {
      // stitch together tweens
      if (resultTweens.length > 1) {
        for (var i = 0; i < resultTweens.length - 1; i++) {
          if (resultTweens[i].doNotChain === true) { continue; }
          resultTweens[i].chain(resultTweens[i+1]);
        }
      }

      // if we've tweened right, a call to refreshBoardView shouldn't change anything
      resultTweens[resultTweens.length - 1].onComplete.add(function () {
        this.animating = false;
        this.refreshBoardView();

        // check if we've won the game
        var teamsLost = this.boardState.teams.map(function () { return true; });
        this.boardState.pieces.forEach(function (piece, index) {
          if (this.boardState.kos.indexOf(index) === -1) {
            teamsLost[piece.team] = false;
          }
        }, this);

        if (teamsLost[0]) {
          // DANIEL MAKE A SICK TWEEN FOR LOSING
          this.game.state.start('Gameplay');
        } else if (teamsLost[1]) {
          // K DANIEL NOW MAKE A SIIIIIICK TWEEEN FOR WINNING
          this.game.state.start('Gameplay');
        }
      }, this);

      this.animating = true;
      resultTweens[0].start();
      
    } else {
      this.refreshBoardView();
    }
  }

};
Gameplay.prototype.refreshBoardView = function () {
  this.characterSprites.forEachAlive(function (sprite) {
    sprite.x = this.boardState.pieces[sprite.data.index].position.x * this.tileSize;
    sprite.y = this.boardState.pieces[sprite.data.index].position.y * this.tileSize;
    if (this.boardState.kos.indexOf(sprite.data.index) !== -1) {
      sprite.renderable = false;
    }
    sprite.tint = (this.boardState.movedThisTurn.indexOf(sprite.data.index) !== -1 && this.boardState.currentTurnTeam() === this.boardState.pieces[sprite.data.index].team) ? 0x333333 : 0xFFFFFF;
  }, this);

  this.turnInfoText.text = 'TURN ' + this.boardState.turn;
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

  this.game.load.tilemap('test_map_1', 'asset/map/test_map_1.json', undefined, Phaser.Tilemap.TILED_JSON);

  this.game.load.bitmapFont('newsgeek', 'asset/font/newsgeek.png', 'asset/font/newsgeek.json');
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

