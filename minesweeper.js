// JavaScript Document


Cell = function() {
	this.value = 0;
	this.status = "cover";
	this.div = null;
};

function Board() {
	var base = new Array();
	var mineNum;
	var n;
	var m;
	var setSize = function(rows,cols,_mineNum){
		mineNum = _mineNum;
		n = rows;
		m = cols;
	};
	var createCells = function() {
		var i = 0;
		var j = 0;
		for (i=0; i<n; i++) {
			base[i] = new Array();
			for (j=0; j<m; j++) {
				base[i][j] = new Cell();
			}
		}
	};
	var putMines = function() {
		for (var mine = 0; mine != mineNum; ++ mine)
		  putRandMine();
	};
	var putRandMine = function() {
		var randomX;
		var randomY;
		do{
		  randomX = Math.floor((Math.random()*n));
		  randomY = Math.floor((Math.random()*m));
		}while(_isMine(randomX, randomY));
		
		putMine(randomX, randomY);
		roundMine(randomX, randomY);
	};
	var putMine = function(x, y) {
		base[x][y].value = -1;
	};
	var roundMine = function(x, y) {
		for (var i = Math.max(x - 1, 0); i <= Math.min(x + 1, n - 1); i++) {
			for (var j = Math.max(y - 1, 0); j <= Math.min(y + 1, m - 1); j++) {
				if (_isMine(i, j) == false) {
					base[i][j].value++;
				}
			}
		}
	};
	var _isMine = function(x,y){
		if (base[x][y].value==-1) {
			return true;
		}
		else {
			return false;
		}
	};
	return {
		init:function(rows,cols,_mineNum){
			setSize(rows,cols,_mineNum);
			createCells();
			putMines();
		},
		isMine:function(x,y){
			return _isMine(x,y);
		},
		getCellValue: function(x,y){
			return base[x][y].value;
		},
		getCellStatus: function(x,y){
			return base[x][y].status;
		},
		setCellStatus: function(x,y,status) {
			base[x][y].status = status;
		},
		setCellDiv: function(x,y,div) {
			base[x][y].div = div;
		},
		getCellDiv: function(x, y) {
			return base[x][y].div;
		}
	}
};

function Game(placeAtDivID) {
	
	var difficulty = (function() {
		return {
			easy:{mineNum:10, n:8, m:8}, 
			middle:{mineNum:40, n:16, m:16}, 
			hard:{mineNum:100, n:16, m:31}
			};
	})();
	var cellHeight = 27;
	var cellWidth = 27;
	var menuFieldHeight = 35;
	var menuFieldWidth = 0;
	var digitWidth = 17;
	var marginPixel = 10;
	var flagNum = 0;
	var downNum = 0;
	var menuFieldID = "menuField";
	var faceID = "face";
	var timerID = "timer";
	var timerD0ID = "timerD0";
	var timerD1ID = "timerD1";
	var timerD2ID = "timerD2";
	var mineCountID = "mineCount";
	var mineCountD0ID = "mineCountD0";
	var mineCountD1ID = "mineCountD1";
	var mineCountD2ID = "mineCountD2";
	var mineCountSignID = "mineCountSign";
	var levelDivID = "levelDiv";
	var blockDivID = "blockDiv";
	var level = "easy";
	var mineNum;
	var n;
	var m;
	var coverClass= "cell cover";
	var cellClass = "cell"
	var board = new Board();
	var baseDiv = document.getElementById(placeAtDivID);
	var menuFiledDiv = document.getElementById(menuFieldID);
	var faceDiv = document.getElementById(faceID);
	var timerDiv = document.getElementById(timerID);
	var timerD0Div = document.getElementById(timerD0ID);
	var timerD1Div = document.getElementById(timerD1ID);
	var timerD2Div = document.getElementById(timerD2ID);
	var mineCountDiv = document.getElementById(mineCountID);
	var mineCountD0Div = document.getElementById(mineCountD0ID);
	var mineCountD1Div = document.getElementById(mineCountD1ID);
	var mineCountD2Div = document.getElementById(mineCountD2ID);
	var mineCountSignDiv = document.getElementById(mineCountSignID);
	var levelDiv = document.getElementById(levelDivID);
	var blockDiv = document.getElementById(blockDivID);
	var started = false;
	var elapsedTime = 0;
	var timer = null;
	var createCoverDivs = function() {
		var i = 0;
		var j = 0;
		while(i<n) {
			j = 0;
			while(j<m){
				createCoverDiv(i,j);
				j++;
			}
			i++;
		}
	};
	var createCoverDiv = function(x,y){
		var div = document.createElement("div");
		div.className = coverClass;
		div.style.top = String(x * (cellHeight-1) + marginPixel) + "px";
		div.style.left = String(y * (cellWidth-1) + marginPixel) + "px";
		div.x = x;
		div.y = y;
		div.onmousedown = mouseDownHandler;
		div.oncontextmenu = function(){return false;}
		baseDiv.appendChild(div);
		board.setCellDiv(x, y, div);
	};
	var getDigitClass = function(value){
		var className = "";
		switch (value) {
			case 0:
			className = "zero";
			break;
			case 1:
			className = "one";
			break;
			case 2:
			className = "two";
			break;
			case 3:
			className = "three";
			break;
			case 4:
			className = "four";
			break;
			case 5:
			className = "five";
			break;
			case 6:
			className = "six";
			break;
			case 7:
			className = "seven";
			break;
			case 8:
			className = "eight";
			break;
			case 9:
			className = "nine";
			break;
		}
		return className;
	};
	
	var isMine = function(x,y) {
		return board.isMine(x,y);
	};
	
	var mouseDownHandler = function(e) {
		var rightClick;
		if (!e) {
			var e = window.event;
		}
		if (e.which) {
			rightClick = (e.which == 3);
		}
		else if (e.button) {
			rightClick = (e.button == 2);
		}
		if (rightClick) {
			rightClickHandler(this.x, this.y);
		}
		else {
			leftClickHandler(this.x, this.y);
		}
		
	};
	var leftClickHandler = function(x, y){
		if (isFlag(x, y) ){
		  return;
		}
		
		if (isMine(x, y) ) {
		  lose(x, y);
		  return;
		}
		
		flip(x, y);
		if (0 == downNum) {
			win();
		}
	};
	
	var rightClickHandler = function(x, y) {
		if (isDown(x, y)) {
			return;
		}
		changeStatus(x, y);
		if (flagNum == mineNum){
			if (tryWinGame()) {
				win();
			}
		}
	};
	
	var isDown = function(x,y) {
		return board.getCellStatus(x,y) == 'down';
	};
	
	var isFlag = function(x,y) {
		return board.getCellStatus(x,y) == 'flag';
	};
	
	var isHole = function(x,y) {
		return board.getCellValue(x,y) == 0;
	};
	
	var flip = function(x, y) {
		if (isDown(x, y) ) {
			return;
		}
		if (isFlag(x, y) ) {
			return;
		}
		flipCell(x, y);
		if (isHole(x, y) ){
			roundFlip(x, y);
		}
	};
	
	var flipCell = function(x, y) {
		var div = board.getCellDiv(x,y);
		var value = board.getCellValue(x,y);
		var className = cellClass+" "+getDigitClass(value);
		div.className = className;
		board.setCellStatus(x,y, "down");
		downNum--;
	};
	
	var roundFlip = function(x,y) {
		var left  = (y > 0);
		var right = (y < m-1);
		if (x > 0) {
			if (left) {
				flip(x-1, y-1);
			}
			flip(x-1, y);
			if (right) {
				flip(x-1, y+1);
			}
		}
		if (left) {
			flip(x, y - 1);
		}
		if (right) {
			flip(x, y + 1);
		}
		if (x < n - 1) {
			if (left) {
				flip(x + 1, y - 1);
			}
			flip(x + 1, y);
			if (right) {
				flip(x + 1, y + 1);
			}
		}
	};
	
	var lose = function(x,y){
		showMines(x, y);
		over();
	};
	
	var showMines = function(boomX, boomY) {
		for (var i = 0; i < n; i++) {
			for (var j = 0; j < m; j++) {
				if ( isMine(i, j) || isFlag(i, j)) {
					showMine(i, j, boomX, boomY);
				}
			}
		}
	};
	
	var showMine = function(x, y, boomX, boomY) {
		var className = cellClass + " mine";
		if (isFlag(x, y)) {
			if (!isMine(x, y)) {
				className = cellClass +" wrong";
			}
			else {
				className = cellClass +" flag";
			}
		}
	
		if ( (x == boomX) && (y == boomY) ){
			className = cellClass + " boom";
		}
		var div = board.getCellDiv(x, y);
		div.className = className;
	};
	
	var changeStatus = function(x, y){
		var nextStatus = getNextState(x, y);
		//if ( ("flag" == nextStatus) && (flagNum == mineNum) ) {
		//	return;
		//}
	
		if ("flag" == nextStatus){
			flagNum++;
			var remainingMines = mineNum - flagNum;
			setMineCount(remainingMines);
		}
		if ("question" == nextStatus) {
			flagNum--;
			var remainingMines = mineNum - flagNum;
			setMineCount(remainingMines);
		}
		
		var div = board.getCellDiv(x,y);
		div.className = cellClass+ " " +nextStatus;
		board.setCellStatus(x,y,nextStatus);
		
	};
	
	var getNextState = function(x, y) {
		var status = board.getCellStatus(x,y);
		switch(status){
			case "cover"   : return("flag");
			case "flag"    : return("question");
			case "question": return("cover");
		}
	}
	
	var tryWinGame = function() {
		for (var i = 0; i<n; i++){
			for (var j = 0; j<m; j++) {
				if ( isFlag(i, j) && ( isMine(i, j) == false ) ){
					return(false);
				}
			}
		}
		return(true);
	};
	
	var setMineCount = function(remainMines) {
		var tmpRemainMines = remainMines;
		// set sign;
		if (tmpRemainMines<0) {
			tmpRemainMines = -tmpRemainMines;
			mineCountSignDiv.className = "digit sign";
		}
		else {
			mineCountSignDiv.className = "";
		}
		// set digit 0;
		mineCountD0Div.className = "digit "+getDigitClass(tmpRemainMines%10);
		tmpRemainMines=Math.floor(tmpRemainMines/10);
		// set digit 1;
		mineCountD1Div.className = "digit "+getDigitClass(tmpRemainMines%10);
		tmpRemainMines=Math.floor(tmpRemainMines/10);
		// set digit 2;
		mineCountD2Div.className = "digit "+getDigitClass(tmpRemainMines%10);
		
	};
	
	var win = function() {
		stopTimer();
		blockDiv.style.display = "block";
		faceDiv.className = "win";
		alert("Congratulations!");
	};
	
	var over = function() {
		stopTimer();
		blockDiv.style.display = "block";
		faceDiv.className = "lose";
		alert("Boom! Game Over.");
	};
	
	var startTimer = function() {
		started = true;
		elapsedTime = -1;
		timerHandler();
	};
	var stopTimer = function() {
		clearTimeout(timer);
		elapsedTime = -1;
    	started = false;
	};
	var timerHandler = function() {
		if (started) {
			elapsedTime++;
			setTimerDigit(elapsedTime);
			timer = setTimeout(timerHandler, 1000);
		}
	};
	var setTimerDigit = function(elapsedTime) {
		var tmpElapsedTime = elapsedTime;
		// set digit 0;
		timerD0Div.className = "digit "+getDigitClass(tmpElapsedTime%10);
		tmpElapsedTime=Math.floor(tmpElapsedTime/10);
		// set digit 1;
		timerD1Div.className = "digit "+getDigitClass(tmpElapsedTime%10);
		tmpElapsedTime=Math.floor(tmpElapsedTime/10);
		// set digit 2;
		timerD2Div.className = "digit "+getDigitClass(tmpElapsedTime%10);
		
	};
	
	var startGame = function() {
		stopTimer();
		init();
		board.init(n, m, mineNum);
		createCoverDivs();
		startTimer();
	}
	
	var init = function() {
		mineNum = difficulty[level].mineNum;
		n = difficulty[level].n;
		m = difficulty[level].m;
		setMineCount(mineNum);
		downNum = n*m - mineNum;
		flagNum = 0;
		downNum = 0;
		
		menuFieldWidth = m*cellWidth-m;
		baseDiv.style.top = menuFieldHeight+"px";
		baseDiv.style.width = menuFieldWidth+2*marginPixel+"px";
		baseDiv.style.height = n*cellHeight-n+2*marginPixel+"px";
		
		menuFiledDiv.style.width = menuFieldWidth+2*marginPixel+"px";
		menuFiledDiv.style.height = menuFieldHeight+"px";
		
		faceDiv.style.left = ((menuFieldWidth)/2) +"px";
		//levelDiv.style.left = (((menuFieldWidth-cellWidth)/2) +cellWidth +2*marginPixel)+"px";
		timerDiv.style.left = menuFieldWidth-3*digitWidth+marginPixel+"px";
		
		faceDiv.oncontextmenu = function() {return false;};
		faceDiv.onclick = startGame;
		faceDiv.className = "smile";
		
		blockDiv.style.top = menuFieldHeight+"px";
		blockDiv.style.width = menuFieldWidth+2*marginPixel+"px";
		blockDiv.style.height = n*cellHeight-n+2*marginPixel+"px";
		blockDiv.style.display = "none";
		
		timer = null;
	};
	
	return {
		setLevel : function(_level) {
			level = _level;
		},
		start : function() {
			startGame();
		},
		
	}
};
