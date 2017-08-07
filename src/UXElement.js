var UXElement = function (game) {
  this.game = game;

  this.showing = false;
  this.onHide = null;

  this.confirm = null;
  this.back = null;
};

UXElement.prototype.show = function(onHide) {
  if (onHide) {
    this.onHide = onHide;
  }

  this.showing = true;
};
UXElement.prototype.hide = function() {
  if (this.onHide) {
    this.onHide();
  }

  this.showing = false;
};
UXElement.prototype.onDown = function() {
  //
};
UXElement.prototype.onUp = function() {
  //
};
UXElement.prototype.onRight = function() {
  //
};
UXElement.prototype.onLeft = function() {
  //
};
UXElement.prototype.onConfirm = function() {
  return true;
};
UXElement.prototype.onBack = function() {
  return true;
};

var SelectCharacterUXElement = function (game, gameplayState) {
  UXElement.call(this, game);

  this.gameplayState = gameplayState;

  this.pathMarkers = this.game.add.group();
  for (var i = 0; i < 50; i++) {
    var marker = this.game.add.sprite(0, 0, 'map_sprites', 14);
    this.pathMarkers.addChild(marker);
    marker.kill();
  }

  this.cursorX = 5;
  this.cursorY = 5;

  this.cursor = this.game.add.sprite(0, 0, 'extraUI_48x48', 1);
  this.cursor.animations.add('spin', [49, 27, 28, 29,  37, 38, 39, 47, 48 ], 14, true);
  this.cursor.animations.play('spin');
  this.cursor.tint = 0x552255;

  var c2 = this.cursor.addChild(this.game.add.sprite(0, 0, 'extraUI_48x48', 1));
  c2.animations.add('spin', [37, 38, 39, 47, 48, 49, 27, 28, 29], 14, true);
  c2.animations.play('spin');
  c2.tint = 0xCC33CC;

  this.refreshCursorPosition();
};
SelectCharacterUXElement.prototype = Object.create(UXElement.prototype);
SelectCharacterUXElement.prototype.onDown = function() {
  if (this.cursorY + 1 >= this.gameplayState.boardState.terrain.length) { return; }

  this.cursorY++;
  this.refreshCursorPosition();
};
SelectCharacterUXElement.prototype.onUp = function() {
  if (this.cursorY - 1 < 0) { return; }

  this.cursorY--;
  this.refreshCursorPosition();
};
SelectCharacterUXElement.prototype.onRight = function() {
  if (this.cursorX + 1 >= this.gameplayState.boardState.terrain[0].length) { return; }

  this.cursorX++;
  this.refreshCursorPosition();
};
SelectCharacterUXElement.prototype.onLeft = function() {
  if (this.cursorX - 1 < 0) { return; }

  this.cursorX--;
  this.refreshCursorPosition();
};
SelectCharacterUXElement.prototype.onConfirm = function() {
  var selectedPiece = this.gameplayState.boardState.getPieceForPosition(this.cursorX, this.cursorY);
  var selectedPieceIndex = this.gameplayState.boardState.pieces.indexOf(selectedPiece);

  if (selectedPiece !== null && selectedPiece.team === this.gameplayState.boardState.currentTurnTeam() && this.gameplayState.boardState.movedThisTurn.indexOf(selectedPieceIndex) === -1) {
    return true;

    this.cursor.visible = false;
  } else {
    return false;
  }
};
SelectCharacterUXElement.prototype.show = function(onHide) {
  UXElement.prototype.show.call(this, onHide);
  
  this.cursor.visible = true;
};
SelectCharacterUXElement.prototype.hide = function() {
  UXElement.prototype.hide.call(this);

  this.cursor.visible = false;
};
SelectCharacterUXElement.prototype.refreshCursorPosition = function () {
  this.cursor.position.set(this.cursorX * this.gameplayState.tileSize - 2, this.cursorY * this.gameplayState.tileSize - 3);

  this.pathMarkers.killAll();
  var selectedPiece = this.gameplayState.boardState.getPieceForPosition(this.cursorX, this.cursorY);
  if (selectedPiece) {
    var selectedPieceIndex = this.gameplayState.boardState.pieces.indexOf(selectedPiece);

    if (this.gameplayState.boardState.movedThisTurn.indexOf(selectedPieceIndex) === -1) {
      var stepMap = this.gameplayState.ai.getAvailablePaths(this.gameplayState.boardState, selectedPieceIndex);
      var stepMapKeys = Object.keys(stepMap);
      for (var i = 0; i < stepMapKeys.length; i++) {
        var steps = stepMap[stepMapKeys[i]];
        var destination = steps[steps.length - 1];

        var marker = this.pathMarkers.getFirstDead();
        marker.x = destination.x * this.gameplayState.tileSize;
        marker.y = destination.y * this.gameplayState.tileSize;
        marker.frame = 14 + selectedPiece.team;
        marker.revive();
      }
    }
  }
};

// UX logic for moving a character
var MoveCharacterUXElement = function (game, gameplayState) {
  UXElement.call(this, game);

  this.gameplayState = gameplayState;

  this.cursorX = -1;
  this.cursorY = -1;

  this.cursor = this.game.add.sprite(0, 0, 'extraUI_48x48', 1);
  this.cursor.animations.add('spin', [49, 27, 28, 29,  37, 38, 39, 47, 48 ], 14, true);
  this.cursor.animations.play('spin');
  this.cursor.tint = 0x222255;

  var c2 = this.cursor.addChild(this.game.add.sprite(0, 0, 'extraUI_48x48', 1));
  c2.animations.add('spin', [37, 38, 39, 47, 48, 49, 27, 28, 29], 14, true);
  c2.animations.play('spin');
  c2.tint = 0x3333CC;

  this.cursor.renderable = false;

  this.steps = [];
  this.selectedPiece = -1;

  this.moveIndicateText = this.game.add.bitmapText(2, 2, 'newsgeek', 'Select a position to\nmove to.', 12);
  this.moveIndicateText.visible = false;
  this.moveIndicateText.fixedToCamera = true;
};
MoveCharacterUXElement.prototype = Object.create(UXElement.prototype);

MoveCharacterUXElement.prototype.show = function(onHide) {
  UXElement.prototype.show.call(this, onHide);
  this.confirm = null;

  this.cursorX = this.gameplayState.cursorUX.cursorX;
  this.cursorY = this.gameplayState.cursorUX.cursorY;
  this.refreshCursorPosition();

  // this should never be null if cursorUX's coordinates are correct
  var selectedPieceObject = this.gameplayState.boardState.getPieceForPosition(this.cursorX, this.cursorY);
  this.selectedPiece = this.gameplayState.boardState.pieces.indexOf(selectedPieceObject);

  this.cursor.renderable = true;
  this.moveIndicateText.visible = true;

  this.steps = [];
  this.steps.push({ x: this.cursorX, y: this.cursorY });

  this.game.camera.follow(this.cursor, Phaser.Camera.FOLLOW_TOPDOWN, 0.2, 0.2);
};
MoveCharacterUXElement.prototype.hide = function() {
  UXElement.prototype.hide.call(this);

  this.game.camera.follow(this.gameplayState.cursorUX.cursor, Phaser.Camera.FOLLOW_TOPDOWN, 0.2, 0.2);

  this.gameplayState.cursorUX.cursorX = this.cursorX;
  this.gameplayState.cursorUX.cursorY = this.cursorY;
  this.gameplayState.cursorUX.refreshCursorPosition();

  this.cursor.renderable = false;
  this.moveIndicateText.visible = false;
};
MoveCharacterUXElement.prototype.onConfirm = function () {
  var flirtOptions = [];
  var flirtCheckPositions = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];
  flirtCheckPositions.forEach(function (checkPos) {
    var flirtOptionCandidate = this.gameplayState.boardState.getPieceForPosition(this.cursorX + checkPos.x, this.cursorY + checkPos.y);
    if (flirtOptionCandidate !== null && this.gameplayState.boardState.pieces.indexOf( flirtOptionCandidate ) !== this.selectedPiece && flirtOptionCandidate.team !== this.gameplayState.boardState.pieces[this.selectedPiece].team && this.gameplayState.boardState.kos.indexOf(this.gameplayState.boardState.pieces.indexOf( flirtOptionCandidate )) === -1) {
      flirtOptions.push( this.gameplayState.boardState.pieces.indexOf( flirtOptionCandidate ) );
    }
  }, this);

  this.steps.shift();
  var command = new GameLogic.MoveCommand();
  command.piece = this.selectedPiece;
  command.steps = this.steps;

  this.selectedPiece = -1;
  this.steps = null;

  if (flirtOptions.length > 0) {
    this.gameplayState.flirtUX.flirtOptions = flirtOptions;
    this.gameplayState.flirtUX.attackingPiece = command.piece;
    this.gameplayState.styleUX.attackingPiece = command.piece;
    this.confirm = this.gameplayState.flirtUX;
  } else {
    this.confirm = this.gameplayState.cursorUX;
  }

  this.gameplayState.processCommand(command);

  return true;
};
MoveCharacterUXElement.prototype.onDown = function() {
  if (this.cursorY + 1 >= this.gameplayState.boardState.terrain.length) { return; }
  if (this.gameplayState.boardState.terrain[this.cursorY + 1][this.cursorX]) { return; }
  if (this.gameplayState.boardState.getPieceForPosition(this.cursorX, this.cursorY + 1) && (this.gameplayState.boardState.pieces.indexOf(this.gameplayState.boardState.getPieceForPosition(this.cursorX, this.cursorY + 1)) !== this.selectedPiece)) { return }
  if (this.steps.length > 4 && (this.steps[this.steps.length - 1].y - this.steps[this.steps.length - 2].y !== -1)) { return; }

  this.cursorY++;
  this.refreshCursorPosition();

  this.updateStepsStack();
};
MoveCharacterUXElement.prototype.onUp = function() {
  if (this.cursorY - 1 < 0) { return; }
  if (this.gameplayState.boardState.terrain[this.cursorY - 1][this.cursorX]) { return; }
  if (this.gameplayState.boardState.getPieceForPosition(this.cursorX, this.cursorY - 1)  && (this.gameplayState.boardState.pieces.indexOf(this.gameplayState.boardState.getPieceForPosition(this.cursorX, this.cursorY - 1)) !== this.selectedPiece)) { return; }
  if (this.steps.length > 4 && (this.steps[this.steps.length - 1].y - this.steps[this.steps.length - 2].y !== 1)) { return; }

  this.cursorY--;
  this.refreshCursorPosition();

  this.updateStepsStack();
};
MoveCharacterUXElement.prototype.onRight = function() {
  if (this.cursorX + 1 >= this.gameplayState.boardState.terrain[0].length) { return; }
  if (this.gameplayState.boardState.terrain[this.cursorY][this.cursorX + 1]) { return; }
  if (this.gameplayState.boardState.getPieceForPosition(this.cursorX + 1, this.cursorY) && (this.gameplayState.boardState.pieces.indexOf(this.gameplayState.boardState.getPieceForPosition(this.cursorX + 1, this.cursorY)) !== this.selectedPiece)) { return; }
  if (this.steps.length > 4 && (this.steps[this.steps.length - 1].x - this.steps[this.steps.length - 2].x !== -1)) { return; }

  this.cursorX++;
  this.refreshCursorPosition();

  this.updateStepsStack();
};
MoveCharacterUXElement.prototype.onLeft = function() {
  if (this.cursorX - 1 < 0) { return; }
  if (this.gameplayState.boardState.terrain[this.cursorY][this.cursorX - 1]) { return; }
  if (this.gameplayState.boardState.getPieceForPosition(this.cursorX - 1, this.cursorY) && (this.gameplayState.boardState.pieces.indexOf(this.gameplayState.boardState.getPieceForPosition(this.cursorX - 1, this.cursorY)) !== this.selectedPiece)) { return; }
  if (this.steps.length > 4 && (this.steps[this.steps.length - 1].x - this.steps[this.steps.length - 2].x !== 1)) { return; }

  this.cursorX--;
  this.refreshCursorPosition();

  this.updateStepsStack();
};
MoveCharacterUXElement.prototype.updateStepsStack = function () {
  if (this.steps.length > 1 && (this.steps[this.steps.length - 2].x === this.cursorX && this.steps[this.steps.length - 2].y === this.cursorY)) {
    this.steps.pop(); // if we're backtracking, pop one off the steps instead of pushing
  } else {
    this.steps.push({ x: this.cursorX, y: this.cursorY });
  }
};
MoveCharacterUXElement.prototype.refreshCursorPosition = function () {
  this.cursor.position.set(this.cursorX * this.gameplayState.tileSize - 2, this.cursorY * this.gameplayState.tileSize - 3);
};

var CheckFlirtUXElement = function (game, gameplayState) {
  UXElement.call(this, game);

  this.gameplayState = gameplayState;

  this.attackingPiece = -1;

  this.flirtOptions = [];
  this.flirtIndex = -1;

  this.cursor = this.game.add.sprite(0, 0, 'extraUI_48x48', 1);
  this.cursor.animations.add('spin', [49, 27, 28, 29,  37, 38, 39, 47, 48 ], 14, true);
  this.cursor.animations.play('spin');
  this.cursor.tint = 0x552221;

  var c2 = this.cursor.addChild(this.game.add.sprite(0, 0, 'extraUI_48x48', 1));
  c2.animations.add('spin', [37, 38, 39, 47, 48, 49, 27, 28, 29], 14, true);
  c2.animations.play('spin');
  c2.tint = 0xCC3333;
  this.cursor.visible = false;

  this.moveIndicateText = this.game.add.bitmapText(2, 2, 'newsgeek', '', 12);
  this.moveIndicateText.visible = false;
  this.moveIndicateText.fixedToCamera = true;

  this.character1TypeText = this.game.add.bitmapText(2, 32, 'newsgeek', 'TEAM1', 14);
  this.character2TypeText = this.game.add.bitmapText(2, 64, 'newsgeek', 'TEAM2', 14);
  this.character2TypeText.align = 'center';
  this.character2TypeText.anchor.x = 0.5;
  this.character1TypeText.visible = false;
  this.character2TypeText.visible = false;
  this.character2TypeText.data.tween = this.game.add.tween(this.character2TypeText);
  this.advantageIcon = this.character2TypeText.addChild(this.game.add.sprite(2, 0, 'extraUI_48x48', 80));
  this.advantageIcon.scale.set(0.5);
  this.advantageIcon.anchor.x = 0.5;
  this.advantageIcon.x = 16;
  this.advantageIcon.y = -24;
  this.advantageIcon.animations.add('arrow', [80, 81, 82, 81], 10, true);
  this.advantageIcon.animations.play('arrow');
  this.advantageIcon.animations.add('equal', [83, 84, 85, 84], 10, true);
  this.advantageIcon.animations.play('equal');
};
CheckFlirtUXElement.prototype = Object.create(UXElement.prototype);
CheckFlirtUXElement.prototype.show = function(onHide) {
  UXElement.prototype.show.call(this, onHide);

  this.flirtIndex = 0;
  if (this.flirtOptions.length === 0) {
    throw 'Daniel, we shouldn\'t be in this state if there are no options';
  }

  this.flirtIndex = 0;
  this.updateSelectedView();
  this.cursor.visible = true;
  //this.character1TypeText.visible = true;
  this.character2TypeText.visible = true;

  this.moveIndicateText.visible = true;
};
CheckFlirtUXElement.prototype.hide = function() {
  UXElement.prototype.hide.call(this);

  this.moveIndicateText.visible = false;
  this.cursor.visible = false;
  this.character1TypeText.visible = false;
  this.character2TypeText.visible = false;
};
CheckFlirtUXElement.prototype.onConfirm = function () {
  if (this.confirm instanceof SelectFlirtStyleUXElement) {
    this.confirm.targetIndex = this.flirtOptions[this.flirtIndex];
  }

  return true;
};
CheckFlirtUXElement.prototype.onBack = function () {
  this.back = this.gameplayState.cursorUX;

  return true;
};
CheckFlirtUXElement.prototype.onDown = function() {
  this.flirtIndex = (this.flirtIndex + 1) % this.flirtOptions.length;
  this.updateSelectedView();
};
CheckFlirtUXElement.prototype.onUp = function() {
  this.flirtIndex = (this.flirtIndex - 1 + this.flirtOptions.length) % this.flirtOptions.length;
  this.updateSelectedView();
};
CheckFlirtUXElement.prototype.onRight = function() {
  this.flirtIndex = (this.flirtIndex + 1) % this.flirtOptions.length;
  this.updateSelectedView();
};
CheckFlirtUXElement.prototype.onLeft = function() {
  this.flirtIndex = (this.flirtIndex - 1 + this.flirtOptions.length) % this.flirtOptions.length;
  this.updateSelectedView();
};
CheckFlirtUXElement.prototype.updateSelectedView = function() {
  this.moveIndicateText.text = 'Have ' + this.gameplayState.boardState.pieces[this.attackingPiece].name + ' flirt with ' + this.gameplayState.boardState.pieces[this.flirtOptions[this.flirtIndex]].name + '?';

  this.cursor.x = this.gameplayState.boardState.pieces[this.flirtOptions[this.flirtIndex]].position.x * 16 - 2;
  this.cursor.y = this.gameplayState.boardState.pieces[this.flirtOptions[this.flirtIndex]].position.y * 16 - 3;

  this.character1TypeText.x = this.gameplayState.cursorUX.cursor.x + 18;
  this.character1TypeText.y = this.gameplayState.cursorUX.cursor.y - 14;
  this.character1TypeText.text = this.gameplayState.boardState.pieces[this.attackingPiece].romanceType;

  this.character2TypeText.x = this.cursor.x + 8;
  this.character2TypeText.y = this.cursor.y + 20;
  this.character2TypeText.text = GameLogic.RomanceType.getStringName(this.gameplayState.boardState.pieces[this.flirtOptions[this.flirtIndex]].romanceType);

  this.character2TypeText.data.tween.stop();
  this.character2TypeText.data.tween = this.game.add.tween(this.character2TypeText);
  this.character2TypeText.data.tween.to( { y: this.character2TypeText.y - 5 }, 600, Phaser.Easing.Quadratic.In, false, 120, -1, true );
  this.character2TypeText.data.tween.start();

  var damagePrediction = GameLogic.ComputeAttackDamage(-1, -1, this.gameplayState.boardState.pieces[this.attackingPiece].romanceType, this.gameplayState.boardState.pieces[this.flirtOptions[this.flirtIndex]].romanceType);
  if (damagePrediction > 0) {
    this.advantageIcon.tint = 0x22AA22;
    this.advantageIcon.animations.play('arrow');
    this.advantageIcon.scale.set(0.5, 0.5);
    this.advantageIcon.y = -24;
  } else {
    this.advantageIcon.tint = 0xAA1122;
    this.advantageIcon.animations.play('arrow');
    this.advantageIcon.scale.set(0.5, -0.5);
    this.advantageIcon.y = -16;
  }
};

var SelectFlirtStyleUXElement = function (game, gameplayState) {
  UXElement.call(this, game);

  this.styleText = this.game.add.bitmapText(0, 0, 'newsgeek', '', 16);

  this.arrowsOverlay = this.game.add.sprite(0, 0, 'extraUI_320x180', 0);
  this.arrowsOverlay.visible = false;
  this.arrowsOverlay.scale.set(0.001);
  this.arrowsOverlay.fixedToCamera = true;
  this.arrowsOverlay.anchor.set(0.5);
  this.arrowsOverlay.cameraOffset.set(this.game.width / 2, this.game.height / 2 + 10);
  var decorator = this.arrowsOverlay.addChild(this.game.add.sprite(this.game.width / -2, this.game.height / -2 - 8, 'extraUI_320x180', 1));
  this.game.add.tween(decorator).to({y: [decorator.y + 3, decorator.y, decorator.y - 3, decorator.y]}, 3000, Phaser.Easing.Sinusoidal.InOut, true, 0, -1).interpolation(Phaser.Math.catmullRomInterpolation);
  
  this.arrowsOverlay.addChild(this.styleText);
  this.styleText.anchor.set(0.5);
  this.styleText.position.set(0, 0);
  this.styleText.align = 'center';

  this.sweetIcon = this.game.add.sprite(0, 0, 'extraUI_48x48', 7);
  this.sweetIcon.anchor.set(0.5);
  this.arrowsOverlay.addChild(this.sweetIcon);

  this.boldIcon = this.game.add.sprite(0, 0, 'extraUI_48x48', 8);
  this.boldIcon.anchor.set(0.5);
  this.arrowsOverlay.addChild(this.boldIcon);

  this.brashIcon = this.game.add.sprite(0, 0, 'extraUI_48x48', 9);
  this.brashIcon.anchor.set(0.5);
  this.arrowsOverlay.addChild(this.brashIcon);

  this.icons = [this.sweetIcon, this.boldIcon, this.brashIcon];

  this.targetIndex = -1;
  this.attackingPiece = -1;

  this.gameplayState = gameplayState;
};
SelectFlirtStyleUXElement.prototype = Object.create(UXElement.prototype);
SelectFlirtStyleUXElement.prototype.show = function(onHide) {
  UXElement.prototype.show.call(this, onHide);

  this.sweetIcon.x = 0;
  this.sweetIcon.y = -60;
  this.boldIcon.x = 58;
  this.boldIcon.y = 42;
  this.brashIcon.x = -70;
  this.brashIcon.y = 40;

  this.styleIndex = 0;
  this.updateSelectedView();

  this.icons[0].scale.set(1.1);
  this.icons[1].scale.set(1);
  this.icons[2].scale.set(1);

  if (this.attackingPiece === -1) {
    throw 'Daniel, we should have an attackingPiece at this state';
  }

  this.styleText.visible = true;
  this.arrowsOverlay.visible = true;
  this.game.add.tween(this.arrowsOverlay.scale).to( {x : 1, y: 1}, 400, Phaser.Easing.Cubic.In).start();
};
SelectFlirtStyleUXElement.prototype.hide = function() {
  UXElement.prototype.hide.call(this);

  this.styleText.visible = false;
  var t = this.game.add.tween(this.arrowsOverlay.scale).to( {x : 0.001, y: 0.001}, 300, Phaser.Easing.Cubic.Out);
  t.onComplete.add(function () { this.arrowsOverlay.visible = false; }, this);
  t.start();
};
SelectFlirtStyleUXElement.prototype.onConfirm = function() {
  var command = new GameLogic.AttackCommand();
  command.attacker = this.attackingPiece;
  command.target = this.targetIndex;
  command.style = this.styleIndex;

  this.gameplayState.dialogueUX.dialogueData = Convos.Flirts[this.gameplayState.boardState.pieces[this.attackingPiece].name][GameLogic.Style.getStringName(this.styleIndex)];
  this.gameplayState.dialogueUX.portraitA.frame = PortraitMap[this.gameplayState.boardState.pieces[this.targetIndex].name];
  this.gameplayState.dialogueUX.portraitB.frame = PortraitMap[this.gameplayState.boardState.pieces[this.attackingPiece].name];
  this.gameplayState.dialogueUX.speakerNameA.text = this.gameplayState.boardState.pieces[this.targetIndex].name;
  this.gameplayState.dialogueUX.speakerNameB.text = this.gameplayState.boardState.pieces[this.attackingPiece].name;

  this.gameplayState.processCommand(command);

  return true;
};
SelectFlirtStyleUXElement.prototype.onRight = function() {
  this.styleIndex = (this.styleIndex + 2) % 3;
  this.updateSelectedView();

  for (var i = 0; i < this.icons.length; i++) {
    var t = this.game.add.tween(this.icons[i]);
    t.to( { x: this.icons[(i + 1) % this.icons.length].x, y: this.icons[(i + 1) % this.icons.length].y }, 300, Phaser.Easing.Cubic.InOut );
    t.start();
  }
};
SelectFlirtStyleUXElement.prototype.onLeft = function() {
  this.styleIndex = (this.styleIndex + 1) % 3;
  this.updateSelectedView();

  for (var i = 0; i < this.icons.length; i++) {
    var t = this.game.add.tween(this.icons[i]);
    t.to( { x: this.icons[(i - 1 + this.icons.length) % this.icons.length].x, y: this.icons[(i - 1 + this.icons.length) % this.icons.length].y }, 300, Phaser.Easing.Cubic.InOut );
    t.start();
  }
};
SelectFlirtStyleUXElement.prototype.updateSelectedView = function() {
  this.styleText.text = GameLogic.Style.getStringName(this.styleIndex);

  for (var i = 0; i < this.icons.length; i++) {
    var t = this.game.add.tween(this.icons[i].scale);

    if (i === this.styleIndex) {
      t.to( { x: 1.1, y: 1.1 }, 400, Phaser.Easing.Cubic.In );
    } else {
      t.to( { x: 1, y: 1 }, 300, Phaser.Easing.Cubic.Out );
    }
    t.start();
  }
};

var DialogueUXElement = function(game, gameplayState) {
  UXElement.call(this, game);

  this.elements = this.game.add.group();
  this.elements.fixedToCamera = true;
  this.portraitA = this.game.add.sprite(           -100, this.game.height - 140, 'portraits', 1);
  this.portraitB = this.game.add.sprite(this.game.width, this.game.height - 140, 'portraits', 2);

  this.textArea = new NineSliceMenu(this.game, 54, this.game.height + 18, this.game.width - 120 + 16, 48 + 8);
  this.dialogueText = this.game.add.bitmapText(60, this.game.height, 'newsgeek', 'I love flowers in the springtime. What happens if we add more dialogue? We could keep going, but we only get 4 lines max. Keep going too. I want to see more and more. It\'d be easier if I was able to keep going as well. I want to keep typing.', 12);
  this.dialogueText.maxWidth = this.textArea.width - 8;
  this.speakerNameA = this.game.add.bitmapText(-50, 104, 'newsgeek', 'target', 12);
  this.speakerNameB = this.game.add.bitmapText(this.game.width + 50, 104, 'newsgeek', 'speaker', 12);
  this.speakerNameB.align = 'right';
  this.speakerNameB.anchor.x = 1;

  this.backing = this.game.add.sprite(0, 0, 'map_sprites', 5);
  this.backing.width = this.game.width;
  this.backing.height = this.game.height;
  this.backing.alpha = 0;

  this.hearts = this.game.add.group();
  this.hearts.position.set(this.game.width / 2 - (24 * 7 * 0.75 * 0.5), -50);
  for (var i = 0; i < 7; i++) {
    var newHeart = this.game.add.sprite(i * 24, 0, 'extraUI_48x48', 18);
    this.hearts.addChild(newHeart);
  }
  this.hearts.scale.set(0.75);

  this.elements.addChild(this.backing);
  this.elements.addChild(this.portraitA);
  this.elements.addChild(this.portraitB);
  this.elements.addChild(this.speakerNameA);
  this.elements.addChild(this.speakerNameB);
  this.elements.addChild(this.textArea);
  this.elements.addChild(this.dialogueText);
  this.elements.addChild(this.hearts);
  this.elements.forEach(function (c) {
    c.visible = false;
  });

  this.dialogueData = null;
};
DialogueUXElement.prototype = Object.create(UXElement.prototype);

DialogueUXElement.prototype.show = function(onHide, heartCount, heartDelta, reverse) {
  if (this.showing) { return; }

  UXElement.prototype.show.call(this, onHide);

  this.elements.forEachAlive(function (c) { c.visible = true; });
  this.dialogueText.children.forEach(function (c) { c.visible = false; });

  if (this.dialogueData[0].speaker === '<FLIRTER>') {
    this.speakerNameA.visible = false;
    this.speakerNameB.visible = true;
  } else if (this.dialogueData[0].speaker === '<TARGET>') {
    this.speakerNameA.visible = true;
    this.speakerNameB.visible = false;
  }

  var tweenTime = 600;
  var fadeBackingIn = this.game.add.tween(this.backing);
  fadeBackingIn.to( { alpha: 0.5 } , tweenTime, Phaser.Easing.Cubic.Out);
  fadeBackingIn.start();
  var movePortraitA = this.game.add.tween(this.portraitA);
  movePortraitA.to( {x: 0, y:this.game.height-160 }, tweenTime, Phaser.Easing.Cubic.InOut );
  movePortraitA.start();
  var movePortraitB = this.game.add.tween(this.portraitB);
  movePortraitB.to( {x: this.game.width-102, y:this.game.height-162 }, tweenTime, Phaser.Easing.Cubic.InOut );
  movePortraitB.start();
  var moveTitleA = this.game.add.tween(this.speakerNameA);
  moveTitleA.to({ x: this.textArea.x + 9 }, tweenTime, Phaser.Easing.Cubic.InOut );
  moveTitleA.start();
  var moveTitleB = this.game.add.tween(this.speakerNameB);
  moveTitleB.to({ x: this.textArea.x + this.textArea.width - 9 }, tweenTime, Phaser.Easing.Cubic.InOut );
  moveTitleB.start();
  var moveDialogueBacking = this.game.add.tween(this.textArea);
  moveDialogueBacking.to({ y: 116 }, tweenTime, Phaser.Easing.Cubic.InOut );
  moveDialogueBacking.start();
  var moveDialogueText = this.game.add.tween(this.dialogueText);
  moveDialogueText.to({ y: 122 }, tweenTime, Phaser.Easing.Cubic.InOut );
  moveDialogueText.start();
  var moveHearts = this.game.add.tween(this.hearts);
  moveHearts.to( {y: 32}, tweenTime, Phaser.Easing.Cubic.In);
  moveHearts.start();

  this.hearts.children.forEach(function (heart, index) {
    heart.frame = index < (7 - heartCount) ? 17 : 18;

    if (!reverse) { heart.frame += 39; }
  }, this);
  this.heartCount = heartCount;
  this.heartDelta = heartDelta;

  moveDialogueText.onComplete.add(function () {
    this.game.time.events.add(300, function () {
      var tickLettersLoop = null;

      var childIndex = 0;
      var topLineIndex = 0;
      var tickOneDialogueItem = function (onDone) {
        tickLettersLoop.delay = this.game.input.keyboard.isDown(Phaser.KeyCode.SHIFT) ? 20 : 60;

        this.dialogueText.children[childIndex].visible = true;
        if (~~(this.dialogueText.children[childIndex].y / 12) - topLineIndex >= 4) {
          topLineIndex++;
          this.dialogueText.y -= 12;

          for (var i = 0; i < this.dialogueText.children.length; i++) {
            if (~~(this.dialogueText.children[i].y / 12) < topLineIndex) {
              this.dialogueText.children[i].visible = false;
            } else {
              break;
            }
          }
        }

        childIndex++;

        if (childIndex === this.dialogueText.children.length) {
          this.game.time.events.remove(tickLettersLoop);

          onDone.call(this);
        }
      };

      var dialogeIndex = 0;
      var playOneDialogueItem = function () {
        topLineIndex = 0;
        childIndex = 0;
        this.dialogueText.y = 122;
        this.dialogueText.text = this.dialogueData[dialogeIndex].line;
        this.dialogueText.children.forEach(function (c) { c.visible = false; });
        if (this.dialogueData[dialogeIndex].speaker === '<FLIRTER>') {
          this.speakerNameA.visible = false;
          this.speakerNameB.visible = true;
        } else if (this.dialogueData[dialogeIndex].speaker === '<TARGET>') {
          this.speakerNameA.visible = true;
          this.speakerNameB.visible = false;
        }

        var shakeSprite = function (portrait) {
          var tweens = [];

          for (var i = 0; i < 7; i++) {
            var t = this.game.add.tween(portrait);
            t.to( { x: portrait.x + ~~(Math.random() * 16) - 8, y: portrait.y + ~~(Math.random() * 8) }, 50);
            tweens.push(t);

            if (i === 6) {
              var t = this.game.add.tween(this.portraitA.cameraOffset);
              t.to( { x: portrait.x, y: portrait.y }, 50);
              tweens.push(t);
            }
          }

          for (var i = 1; i < tweens.length; i++) {
            tweens[i - 1].chain(tweens[i]);
          }

          tweens[0].start();
        };

        var swoonSprite = function (portrait) {
          var tween = this.game.add.tween(portrait.scale);
          tween.to( { x: [1.1, 1], y: [1.1, 1] }, 1600, Phaser.Easing.Cubic.Out);
          tween.start();
        };

        if (this.dialogueData[dialogeIndex].flirterStagger) {
          shakeSprite.call(this, this.portraitB);
        }
        if (this.dialogueData[dialogeIndex].targetStagger) {
          shakeSprite.call(this, this.portraitA);
        }
        if (this.dialogueData[dialogeIndex].targetSwoon) {
          swoonSprite.call(this, this.portraitA);
        }

        tickLettersLoop = this.game.time.events.loop(60, tickOneDialogueItem, this, function () {
          dialogeIndex++;

          if (dialogeIndex < this.dialogueData.length) {
            this.game.time.events.add(1450, playOneDialogueItem, this);
          } else {
            this.game.time.events.add(200, function () {

              for (var i = 0; i < this.hearts.children.length; i++ ) {
                var currentHeart = this.hearts.children[i];

                if (i < ( (7 - this.heartCount + this.heartDelta) )) {
                  currentHeart.frame = 17;

                  if (i < ( (7 - this.heartCount + this.heartDelta)) &&
                      i >= ( (7 - this.heartCount) )) {
                    var t = this.game.add.tween(currentHeart.scale);
                    t.to( {x: [1.1, 1], y: [1.1, 1]}, 200, Phaser.Easing.Cubic.InOut);
                    t.start();
                  }
                } else {
                  currentHeart.frame = 18;

                  if (i >= ( (7 - this.heartCount + this.heartDelta) ) &&
                      i < ( (7 - this.heartCount) )) {
                    var t = this.game.add.tween(currentHeart.scale);
                    t.to( {x: [0.8, 1.1, 1], y: [0.8, 1.1, 1]}, 320, Phaser.Easing.Cubic.InOut);
                    t.start();
                  }
                }

                if (!reverse) { currentHeart.frame += 39; }
              }

              this.game.time.events.add(1800, this.hide, this);
            }, this);
          }
        });
      };

      this.game.time.events.add(100, playOneDialogueItem, this);

    }, this);
  }, this);
};
DialogueUXElement.prototype.hide = function() {
  UXElement.prototype.hide.call(this);

  var tweenTime = 600;
  var fadeBackingOut = this.game.add.tween(this.backing);
  fadeBackingOut.to( { alpha: 0 } , tweenTime, Phaser.Easing.Cubic.Out);
  fadeBackingOut.start();
  var movePortraitA = this.game.add.tween(this.portraitA);
  movePortraitA.to({x: -100, y:this.game.height-140}, tweenTime, Phaser.Easing.Cubic.InOut );
  movePortraitA.start();
  var movePortraitB = this.game.add.tween(this.portraitB);
  movePortraitB.to({x: this.game.width, y:this.game.height-140}, tweenTime, Phaser.Easing.Cubic.InOut );
  movePortraitB.start();
  var moveDialogueBacking = this.game.add.tween(this.textArea);
  moveDialogueBacking.to({ y: this.game.height + 18 }, tweenTime, Phaser.Easing.Cubic.InOut );
  moveDialogueBacking.start();
  var moveDialogueText = this.game.add.tween(this.dialogueText);
  moveDialogueText.to({ y: this.game.height + 20 }, tweenTime, Phaser.Easing.Cubic.InOut );
  moveDialogueText.start();
  var moveTitleA = this.game.add.tween(this.speakerNameA);
  moveTitleA.to({ x: -50 }, tweenTime, Phaser.Easing.Cubic.InOut );
  moveTitleA.start();
  var moveTitleB = this.game.add.tween(this.speakerNameB);
  moveTitleB.to({ x: this.game.width + 50 }, tweenTime, Phaser.Easing.Cubic.InOut );
  moveTitleB.start();
  var moveHearts = this.game.add.tween(this.hearts);
  moveHearts.to( {y: -50}, tweenTime, Phaser.Easing.Cubic.Out);
  moveHearts.start();

  this.dialogueData = null;

  moveDialogueText.onComplete.add(function () { this.elements.forEachAlive(function (c) { c.visible = false; }); }, this);
};

var TurnStartUXElement = function(game, gameplayState) {
  UXElement.call(this, game);

  this.gameplayState = gameplayState;

  this.slideText = this.game.add.bitmapText(this.game.width / 2, this.game.height / 2, 'newsgeek', 'TURN', 20);
  this.slideText.visible = false;
  this.slideText.anchor.set(0.5, 0.5);
  this.slideText.align = 'center';
  this.slideText.tint = '0xEE1112';
  this.slideText.fixedToCamera = true;
};
TurnStartUXElement.prototype = Object.create(UXElement.prototype);
TurnStartUXElement.prototype.show = function(onHide) {
  UXElement.prototype.show.call(this, onHide);

  this.game.camera.follow(this.gameplayState.cursorUX.cursor, Phaser.Camera.FOLLOW_TOPDOWN, 0.2, 0.2);

  this.slideText.visible = true;
  this.slideText.cameraOffset.x = -100;

  if (this.gameplayState.boardState.currentTurnTeam() === 0) {
    this.slideText.text = 'Flirt Round!';
  } else {
    this.slideText.text = 'Rebuff Round!';
  }

  var slideTextTweenA = this.game.add.tween(this.slideText.cameraOffset);
  slideTextTweenA.to( { x: this.game.width / 2 - 50 }, 500, Phaser.Easing.Cubic.In);
  var slideTextTweenB = this.game.add.tween(this.slideText.cameraOffset);
  slideTextTweenB.to( { x: this.game.width / 2 + 25 }, 1000, Phaser.Easing.Linear.None);
  var slideTextTweenC = this.game.add.tween(this.slideText.cameraOffset);
  slideTextTweenC.to( { x: this.game.width + 150}, 800, Phaser.Easing.Cubic.Out);
  slideTextTweenA.chain(slideTextTweenB);
  slideTextTweenB.chain(slideTextTweenC);

  slideTextTweenC.onComplete.add(function () {
    this.hide();
  }, this);

  slideTextTweenA.start();
};
TurnStartUXElement.prototype.hide = function() {
  UXElement.prototype.hide.call(this);

  this.slideText.visible = false;
};



// Sprite Utils
var NineSliceMenu = function (game, x, y, width, height) {
  Phaser.Group.call(this, game);

  this.x = x;
  this.y = y;

  var topLeftCorner = this.addChild(this.game.add.sprite(0, 0, 'map_sprites', 125));
  var topRightCorner = this.addChild(this.game.add.sprite(width - 16, 0, 'map_sprites', 127));
  var middle = this.addChild(this.game.add.sprite(16, 16, 'map_sprites', 142));
  var bottomRightCorner = this.addChild(this.game.add.sprite(32, 32, 'map_sprites', 159));
  var bottomLeftCorner = this.addChild(this.game.add.sprite(0, 32, 'map_sprites', 157));
  var topEdge = this.addChild(this.game.add.sprite(16, 0, 'map_sprites', 126));
  var bottomEdge = this.addChild(this.game.add.sprite(16, height - 16, 'map_sprites', 158));
  var rightEdge = this.addChild(this.game.add.sprite(width - 16, 16, 'map_sprites', 143));
  var leftEdge = this.addChild(this.game.add.sprite(0, 16, 'map_sprites', 141));

  // resize the pieces
  middle.width = width - 32;
  middle.height = height - 32;
  bottomRightCorner.x = width - 16;
  bottomRightCorner.y = height - 16;
  bottomLeftCorner.y = height - 16;
  topEdge.width = width - 32;
  bottomEdge.width = width - 32;
  rightEdge.height = height - 32;
  leftEdge.height = height - 32;
};
NineSliceMenu.prototype = Object.create(Phaser.Group.prototype);
NineSliceMenu.prototype.constructor = NineSliceMenu;