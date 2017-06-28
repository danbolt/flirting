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

  if (selectedPiece !== null) {
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

  this.moveIndicateText = this.game.add.text(0, 0, 'Select a position to move to, kid!', { font: 'monospace', size: '16px' });
  this.moveIndicateText.renderable = false;
  this.moveIndicateText.fixedToCamera = true;
};
MoveCharacterUXElement.prototype = Object.create(UXElement.prototype);

MoveCharacterUXElement.prototype.show = function(onHide) {
  UXElement.prototype.show.call(this, onHide);

  this.cursorX = this.gameplayState.cursorUX.cursorX;
  this.cursorY = this.gameplayState.cursorUX.cursorY;
  this.refreshCursorPosition();

  this.cursor.renderable = true;
  this.moveIndicateText.renderable = true;

  this.steps.length = 0;
  this.steps.push({ x: this.cursorX, y: this.cursorY });

  this.game.camera.follow(this.cursor, Phaser.Camera.FOLLOW_TOPDOWN, 0.2, 0.2);
};
MoveCharacterUXElement.prototype.hide = function() {
  UXElement.prototype.hide.call(this);

  this.game.camera.follow(this.gameplayState.cursorUX.cursor, Phaser.Camera.FOLLOW_TOPDOWN, 0.2, 0.2);

  this.cursor.renderable = false;
  this.moveIndicateText.renderable = false;
};
MoveCharacterUXElement.prototype.onDown = function() {
  if (this.steps.length > 4 && (this.steps[this.steps.length - 1].y - this.steps[this.steps.length - 2].y !== -1)) { return; }

  this.cursorY++;
  this.refreshCursorPosition();

  this.updateStepsStack();
};
MoveCharacterUXElement.prototype.onUp = function() {
  if (this.steps.length > 4 && (this.steps[this.steps.length - 1].y - this.steps[this.steps.length - 2].y !== 1)) { return; }

  this.cursorY--;
  this.refreshCursorPosition();

  this.updateStepsStack();
};
MoveCharacterUXElement.prototype.onRight = function() {
  if (this.steps.length > 4 && (this.steps[this.steps.length - 1].x - this.steps[this.steps.length - 2].x !== -1)) { return; }

  this.cursorX++;
  this.refreshCursorPosition();

  this.updateStepsStack();
};
MoveCharacterUXElement.prototype.onLeft = function() {
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