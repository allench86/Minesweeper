// JavaScript Document



//
// Game
//
function Game() {
  var self = this;

  this.board     = new Board();
  this.startTime = null;

  this.run = function() {
    self.start();
  }
  this.start = function() {
    self.hideSmiley();
    self.createBoard();
    self.registerMouse();
    self.startTimer();
    self.updateScore();
  }
  this.restart = function() {
    self.board.destroyImgs();
    self.start();
  }

  this.onMouseDown = function(e) {
    var img = getMouseObject(e);
    if ( self.board.isCell(img) ){
      if ( getMouseButton(e) == 1)
        self.onLeftClick(img.mRow, img.mCol);
      else
        self.onRightClick(img.mRow, img.mCol);
    }
    self.updateScore();
    return(false);
  }
  this.onLeftClick = function(row, col) {
    if ( self.board.isFlag(row, col) )
      return;
    if ( self.board.isMine(row, col) ) {
      self.looseGame(row, col);
      return;
    }
    self.board.flip(row, col);
    if (0 == self.board.downs)
      self.winGame();
  }
  this.onRightClick = function(row, col) {
    if ( self.board.isDown(row, col) )
      return;
    self.board.changeState(row, col);
    if (self.board.flags == self.board.mines)
      self.tryWinGame();
  }
  
  this.tryWinGame = function() {
    if ( self.board.testFlags() )
      self.winGame();
  }
  this.winGame = function() {
    self.showSmiley("happy");
    self.board.showFlags();
    self.endGame();
  }
  this.looseGame = function(row, col) {
    self.showSmiley("sad");
    self.board.showMines(row, col);
    self.endGame();
  }
  this.endGame = function() {
    self.stopTimer();
    self.unregisterMouse();
  }

  this.updateScore = function() {
    document.getElementById("div-mines").innerHTML = String(self.board.mines - self.board.flags);
  }
  
  this.showSmiley = function(pic) {
    var img = document.getElementById("img-smiley");
    img.src = self.board.getImgSrc(pic);
    img.style.visibility = "visible";
  }
  this.hideSmiley = function() {
    document.getElementById("img-smiley").style.visibility = "hidden";
  }

  this.startTimer = function() {
    self.startTime = new Date().getTime();
    self.timer();
  }
  this.stopTimer = function() {
    self.startTime = null;
  }
  this.timer = function() {
    if (self.startTime) {
      var diff = Math.floor( ( new Date().getTime() - self.startTime) / 1000);
      var mins = "0" + String( Math.floor(diff / 60) );
      var secs = "0" + String(diff % 60);
      document.getElementById("div-time").innerHTML = 
		mins.substring(mins.length - 2) + ":" + secs.substring(secs.length - 2);
      setTimeout(self.timer, 1000);
    }
  }

  this.registerMouse = function() {
    self.board.div.onmousedown   = self.onMouseDown;
    self.board.div.onclick       = function(){return false;};
    self.board.div.ondblclick    = function(){return false;};
    self.board.div.oncontextmenu = function(){return false;};
  }
  this.unregisterMouse = function() {
    self.board.div.onmousedown = null;
  }
  
  this.createBoard = function() {
     switch( document.getElementById("lb-level").value ) {
       case "easy"    : self.board.create(10, 10,  10); break;
       case "normal"  : self.board.create(15, 15,  25); break;
       case "advanced": self.board.create(20, 20,  50); break;
       case "hard"    : self.board.create(20, 25, 100); break;
       case "expert"  : self.board.create(20, 30, 150); break;
     }
  }
}

//
// Board
//
function Board() {
  var self = this;

  this.div = document.getElementById("div-board");
  
  this.cells = null;  
  this.rows  = 0;
  this.cols  = 0;
  this.mines = 0;
  this.downs = 0;
  this.flags = 0;

  this.imgClass  = "cell";
  this.imgWidth  = 16;
  this.imgHeight = 16;
  this.imgURL    = "pictures/juegos/minesweeper/";
  this.imgExt    = ".png";

  this.create = function(rows, cols, mines) {
    self.cells = null;
    self.rows  = rows;
    self.cols  = cols;
    self.mines = mines;
    self.downs = (self.rows * self.cols) - self.mines;
    self.flags = 0;

    self.createCells();
    self.putMines();
    self.createImgs();
  }
  
  this.createCells = function() {
    self.cells = new Array(self.rows);
    for (var row = 0; row != self.rows; ++ row) {
      self.cells[row] = new Array(self.cols);
      for (var col = 0; col != self.cols; ++ col)
        self.cells[row][col] = new Cell();
     }
  }
  
  this.putMines = function() {
    for (var mine = 0; mine != self.mines; ++ mine)
      self.putRandMine();
  }
  this.putRandMine = function() {
    var row, col;
    do{
      row = rand(self.rows);
      col = rand(self.cols);
    }while( self.isMine(row, col) );
 
    self.putMine(row, col);
    self.roundMine(row, col);
  }
  this.putMine = function(row, col) {
    self.cells[row][col].value = 'm';
  }
  this.roundMine = function(row, col) {
    for (var r = Math.max(row - 1, 0); r <= Math.min(row + 1, self.rows - 1); ++ r)
      for (var c = Math.max(col - 1, 0); c <= Math.min(col + 1, self.cols - 1); ++ c)
        if ( self.isMine(r, c) == false)
          ++ self.cells[r][c].value;
  }

  this.createImgs = function() {
    for (var row = 0; row != self.rows; ++ row)
      for (var col = 0; col != self.cols; ++ col)
        this.createImg(row, col);
  }
  this.createImg = function(row, col) {
    var img = document.createElement("img");
    
    img.id           = self.getImgId(row, col);
    img.className    = self.imgClass;
    img.style.width  = String(self.imgWidth)  + "px";
    img.style.height = String(self.imgHeight) + "px";
    img.style.top    = String( Math.floor( ( (340 - self.imgHeight * self.rows) / 2) + (row * (self.imgHeight - 1) ) ) ) + "px";
    img.style.left   = String( Math.floor( ( (510 - self.imgWidth  * self.cols) / 2) + (col * (self.imgWidth  - 1) ) ) ) + "px";
    img.src          = self.getImgSrc("up");
    img.mRow         = row;
    img.mCol         = col;

    self.div.appendChild(img);
  }
  this.destroyImgs = function() {
    for (var row = 0; row != self.rows; ++ row)
      for (var col = 0; col != self.cols; ++ col)
        self.destroyImg(row, col);
  }
  this.destroyImg = function(row, col) {
    self.div.removeChild( document.getElementById( self.getImgId(row, col) ) );
  }

  this.flip = function(row, col) {
    if ( self.isDown(row, col) )
      return;
    if ( self.isFlag(row, col) )
      return;
    self.flipCell(row, col);
    if ( self.isHole(row, col) )
      self.roundFlip(row, col);
  }
  this.flipCell = function(row, col) {
    self.getImgElement(row, col).src = self.getImgSrc( self.cells[row][col].value );
    self.cells[row][col].state = "down";
    -- self.downs;
  }
  this.roundFlip = function(row, col) {
    var left  = (col > 0);
    var right = (col < self.cols - 1);
    if (row > 0) {
      if (left) self.flip(row - 1, col - 1);
      self.flip(row - 1, col);
      if (right) self.flip(row - 1, col + 1);
    }
    if (left) self.flip(row, col - 1);
    if (right) self.flip(row, col + 1);
    if (row < self.rows - 1) {
      if (left) self.flip(row + 1, col - 1);
      self.flip(row + 1, col);
      if (right) self.flip(row + 1, col + 1);
    }
  }

  this.changeState = function(row, col) {
    var change = self.getNextState(row, col);
    if ( ("flag" == change) && (self.flags == self.mines) )
      return;

    if ("flag" == change)
      ++ self.flags;
    if ("question" == change)
      -- self.flags;

    self.getImgElement(row, col).src = self.getImgSrc(change);
    self.cells[row][col].state = change;
  }
  this.getNextState = function(row, col) {
    switch( self.cells[row][col].state ){
      case "up"      : return("flag");
      case "flag"    : return("question");
      case "question": return("up");
    }
  }

  this.testFlags = function() {
    for (var row = 0; row != self.rows; ++ row)
      for (var col = 0; col != self.cols; ++ col)
        if ( self.isFlag(row, col) && ( self.isMine(row, col) == false ) )
          return(false);
    return(true);
  }

  this.showMines = function(rowBoom, colBoom) {
    for (var row = 0; row != self.rows; ++ row)
      for (var col = 0; col != self.cols; ++ col)
        if ( self.isMine(row, col) || self.isFlag(row, col) )
          self.showMine(row, col, rowBoom, colBoom);
  }
  this.showMine = function(row, col, rowBoom, colBoom) {
    var pic = "mine";
    if ( self.isFlag(row, col) )
       pic = self.isMine(row, col)? "flag" : "cross";
    if ( (row == rowBoom) && (col == colBoom) )
      pic = "boom";

    self.getImgElement(row, col).src = self.getImgSrc(pic);
  }
  this.showFlags = function() {
    for (var row = 0; row != self.rows; ++ row)
      for (var col = 0; col != self.cols; ++ col)
        if ( self.isMine(row, col) && ( self.isFlag(row, col) == false) ){
          self.getImgElement(row, col).src = self.getImgSrc("flag");
          ++ self.flags;
        }
  }

  this.isMine = function(row, col) {
    return( 'm' == self.cells[row][col].value );
  }
  this.isHole = function(row, col) {
    return( 0 == self.cells[row][col].value );
  }
  this.isFlag = function(row, col) {
    return( 'flag' == self.cells[row][col].state );
  }
  this.isDown = function(row, col) {
    return( 'down' == self.cells[row][col].state );
  }

  this.isCell = function(img) {
    return(img.className == self.imgClass);
  }
  this.getImgElement = function(row, col) {
    return( document.getElementById( self.getImgId(row, col) ) );
  }
  this.getImgId = function(row, col) {
    return( self.imgClass + String( (row * self.cols) + col) );
  }
  this.getImgSrc = function(pic) {
    return(  self.imgURL + pic + self.imgExt );
  }
}

//
// Cell
//
function Cell() {
  this.value = 0;
  this.state = 'up';
}

//
// Utils
//
function rand(x) {
  return( Math.floor( Math.random() * x ) );
}

function getMouseObject(e) {
  return(e? e.target: window.event.srcElement);
}
function getMouseButton(e) {
  return(e? e.which: window.event.button);
}

//
// Instance and start Game
//
var game = new Game();
game.run();

