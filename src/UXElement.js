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

  this.cursorX = 2;
  this.cursorY = 2;

  this.cursor = this.game.add.sprite(0, 0, 'map_sprites', 1);
  this.refreshCursorPosition();
};
SelectCharacterUXElement.prototype = Object.create(UXElement.prototype);
SelectCharacterUXElement.prototype.onDown = function() {
  this.cursorY++;
  this.refreshCursorPosition();
};
SelectCharacterUXElement.prototype.onUp = function() {
  this.cursorY--;
  this.refreshCursorPosition();
};
SelectCharacterUXElement.prototype.onRight = function() {
  this.cursorX++;
  this.refreshCursorPosition();
};
SelectCharacterUXElement.prototype.onLeft = function() {
  this.cursorX--;
  this.refreshCursorPosition();
};
SelectCharacterUXElement.prototype.onConfirm = function() {
  var selectedPiece = this.gameplayState.boardState.getPieceForPosition(this.cursorX, this.cursorY);

  if (selectedPiece !== null && selectedPiece.team === this.gameplayState.boardState.currentTurnTeam()) {
    return true;
  } else {
    return false;
  }
};
SelectCharacterUXElement.prototype.refreshCursorPosition = function () {
  this.cursor.position.set(this.cursorX * this.gameplayState.tileSize, this.cursorY * this.gameplayState.tileSize);
};

// UX logic for moving a character
var MoveCharacterUXElement = function (game, gameplayState) {
  UXElement.call(this, game);

  this.gameplayState = gameplayState;

  this.cursorX = -1;
  this.cursorY = -1;
  this.cursor = this.game.add.sprite(0, 0, 'map_sprites', 1);
  this.cursor.tint = 0xFF0000;
  this.cursor.renderable = false;

  this.steps = [];
  this.selectedPiece = -1;

  this.moveIndicateText = this.game.add.text(0, 0, 'Select a position to move to, kid!', { font: 'monospace', size: '16px' });
  this.moveIndicateText.renderable = false;
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
  this.moveIndicateText.renderable = true;

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
  this.moveIndicateText.renderable = false;
};
MoveCharacterUXElement.prototype.onConfirm = function () {
  var flirtOptions = [];
  var flirtCheckPositions = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];
  flirtCheckPositions.forEach(function (checkPos) {
    var flirtOptionCandidate = this.gameplayState.boardState.getPieceForPosition(this.cursorX + checkPos.x, this.cursorY + checkPos.y);
    if (flirtOptionCandidate !== null && this.gameplayState.boardState.pieces.indexOf( flirtOptionCandidate ) !== this.selectedPiece && this.gameplayState.boardState.kos.indexOf(this.gameplayState.boardState.pieces.indexOf( flirtOptionCandidate )) === -1) {
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
  if (this.gameplayState.boardState.terrain[this.cursorY + 1][this.cursorX]) { return; }
  if (this.gameplayState.boardState.getPieceForPosition(this.cursorX, this.cursorY + 1) && (this.gameplayState.boardState.pieces.indexOf(this.gameplayState.boardState.getPieceForPosition(this.cursorX, this.cursorY + 1)) !== this.selectedPiece)) { return }
  if (this.steps.length > 4 && (this.steps[this.steps.length - 1].y - this.steps[this.steps.length - 2].y !== -1)) { return; }

  this.cursorY++;
  this.refreshCursorPosition();

  this.updateStepsStack();
};
MoveCharacterUXElement.prototype.onUp = function() {
  if (this.gameplayState.boardState.terrain[this.cursorY - 1][this.cursorX]) { return; }
  if (this.gameplayState.boardState.getPieceForPosition(this.cursorX, this.cursorY - 1)  && (this.gameplayState.boardState.pieces.indexOf(this.gameplayState.boardState.getPieceForPosition(this.cursorX, this.cursorY - 1)) !== this.selectedPiece)) { return; }
  if (this.steps.length > 4 && (this.steps[this.steps.length - 1].y - this.steps[this.steps.length - 2].y !== 1)) { return; }

  this.cursorY--;
  this.refreshCursorPosition();

  this.updateStepsStack();
};
MoveCharacterUXElement.prototype.onRight = function() {
  if (this.gameplayState.boardState.terrain[this.cursorY][this.cursorX + 1]) { return; }
  if (this.gameplayState.boardState.getPieceForPosition(this.cursorX + 1, this.cursorY) && (this.gameplayState.boardState.pieces.indexOf(this.gameplayState.boardState.getPieceForPosition(this.cursorX + 1, this.cursorY)) !== this.selectedPiece)) { return; }
  if (this.steps.length > 4 && (this.steps[this.steps.length - 1].x - this.steps[this.steps.length - 2].x !== -1)) { return; }

  this.cursorX++;
  this.refreshCursorPosition();

  this.updateStepsStack();
};
MoveCharacterUXElement.prototype.onLeft = function() {
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
  this.cursor.position.set(this.cursorX * this.gameplayState.tileSize, this.cursorY * this.gameplayState.tileSize);
};

var CheckFlirtUXElement = function (game, gameplayState) {
  UXElement.call(this, game);

  this.gameplayState = gameplayState;

  this.attackingPiece = -1;

  this.flirtOptions = [];
  this.flirtIndex = -1;

  this.moveIndicateText = this.game.add.text(0, 0, 'THIS SHOULD NEVER BE SEEN', { font: 'monospace', size: '16px' });
  this.moveIndicateText.renderable = false;
  this.moveIndicateText.fixedToCamera = true;
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

  this.moveIndicateText.renderable = true;
};
CheckFlirtUXElement.prototype.hide = function() {
  UXElement.prototype.hide.call(this);

  this.moveIndicateText.renderable = false;
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
CheckFlirtUXElement.prototype.updateSelectedView = function() {
  this.moveIndicateText.text = 'Have ' + this.gameplayState.boardState.pieces[this.attackingPiece].name + ' flirt with ' + this.gameplayState.boardState.pieces[this.flirtOptions[this.flirtIndex]].name + '?';
};

var SelectFlirtStyleUXElement = function (game, gameplayState) {
  UXElement.call(this, game);

  this.styleText = this.game.add.text(0, 0, 'Flirt?', { font: 'monospace', size: '16px' });
  this.styleText.renderable = false;
  this.styleText.fixedToCamera = true;

  this.targetIndex = -1;
  this.attackingPiece = -1;

  this.gameplayState = gameplayState;
};
SelectFlirtStyleUXElement.prototype = Object.create(UXElement.prototype);
SelectFlirtStyleUXElement.prototype.show = function(onHide) {
  UXElement.prototype.show.call(this, onHide);

  this.styleIndex = 0;
  this.updateSelectedView()

  if (this.attackingPiece === -1) {
    throw 'Daniel, we should have an attackingPiece at this state';
  }

  this.styleText.renderable = true;
};
SelectFlirtStyleUXElement.prototype.hide = function() {
  UXElement.prototype.hide.call(this);

  this.styleText.renderable = false;
};
SelectFlirtStyleUXElement.prototype.onConfirm = function() {
  var command = new GameLogic.AttackCommand();
  command.attacker = this.attackingPiece;
  command.target = this.targetIndex;
  command.style = this.styleIndex;

  this.gameplayState.processCommand(command);

  return true;
};
SelectFlirtStyleUXElement.prototype.onDown = function() {
  this.styleIndex = (this.styleIndex + 1) % 3;
  this.updateSelectedView();
};
SelectFlirtStyleUXElement.prototype.onUp = function() {
  this.styleIndex = (this.styleIndex + 2) % 3;
  this.updateSelectedView();
};
SelectFlirtStyleUXElement.prototype.updateSelectedView = function() {
  this.styleText.text = 'Have ' + this.gameplayState.boardState.pieces[this.attackingPiece].name + ' use ' + GameLogic.Style.getStringName(this.styleIndex) + ' style on ' + this.gameplayState.boardState.pieces[this.targetIndex].name + '?';
};

var DialogueUXElement = function(game, gameplayState) {
  UXElement.call(this, game);

  this.elements = this.game.add.group();
  this.elements.fixedToCamera = true;
  this.portraitA = this.game.add.sprite(           -100, this.game.height - 140, 'portraits', 1);
  this.portraitB = this.game.add.sprite(this.game.width, this.game.height - 140, 'portraits', 2);

  this.textArea = this.game.add.sprite(60, this.game.height + 20, 'map_sprites', 5);
  this.textArea.width = this.game.width -120;
  this.textArea.height = 48;
  this.dialogueText = this.game.add.text(60, this.game.height + 20, 'i love flowers in the springtime i am on the ferry what would be some nice dialogue put something here daniel plz change font', { font: 'monospace', size: '16px', fill: 'white', wordWrap: true, wordWrapWidth: this.textArea.width });
  this.dialogueText.lineSpacing = -8;

  this.backing = this.game.add.sprite(0, 0, 'map_sprites', 5);
  this.backing.width = this.game.width;
  this.backing.height = this.game.height;
  this.backing.alpha = 0;

  this.elements.addChild(this.backing);
  this.elements.addChild(this.portraitA);
  this.elements.addChild(this.portraitB);
  this.elements.addChild(this.textArea);
  this.elements.addChild(this.dialogueText);
  this.elements.forEach(function (c) {
    c.visible = false;
  });
};
DialogueUXElement.prototype = Object.create(UXElement.prototype);

DialogueUXElement.prototype.show = function(onHide) {
  UXElement.prototype.show.call(this, onHide);

  this.elements.forEachAlive(function (c) { c.visible = true; });

  var tweenTime = 600;
  var fadeBackingIn = this.game.add.tween(this.backing);
  fadeBackingIn.to( { alpha: 0.5 } , tweenTime, Phaser.Easing.Cubic.Out);
  fadeBackingIn.start();
  var movePortraitA = this.game.add.tween(this.portraitA);
  movePortraitA.to({x: 0, y:this.game.height-160}, tweenTime, Phaser.Easing.Cubic.InOut );
  movePortraitA.start();
  var movePortraitB = this.game.add.tween(this.portraitB);
  movePortraitB.to({x: this.game.width-100, y:this.game.height-160}, tweenTime, Phaser.Easing.Cubic.InOut );
  movePortraitB.start();
  var moveDialogueBacking = this.game.add.tween(this.textArea);
  moveDialogueBacking.to({ y: 120 }, tweenTime, Phaser.Easing.Cubic.InOut );
  moveDialogueBacking.start();
  var moveDialogueText = this.game.add.tween(this.dialogueText);
  moveDialogueText.to({ y: 120 }, tweenTime, Phaser.Easing.Cubic.InOut );
  moveDialogueText.start();
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
  moveDialogueBacking.to({ y: this.game.height + 20 }, tweenTime, Phaser.Easing.Cubic.InOut );
  moveDialogueBacking.start();
  var moveDialogueText = this.game.add.tween(this.dialogueText);
  moveDialogueText.to({ y: this.game.height + 20 }, tweenTime, Phaser.Easing.Cubic.InOut );
  moveDialogueText.start();

  moveDialogueText.onComplete.add(function () { this.elements.forEachAlive(function (c) { c.visible = false; }); }, this);
};