var game = {
	maze: {
		x: 20, //initial cell height and width
	},
	state: undefined
};

game.create = function() {
	var game = this;
	var ponyName = $("input[name='pony']:checked").val();
	var ponyId = $("input[name='pony']:checked").attr("id");
	var height = $("input[id='height']").val();
	var width = $("input[id='width']").val();
	
	var dataToSend = {"maze-width" : parseInt(width), "maze-height": parseInt(height), "maze-player-name": ponyName};
	var jqxhr = $.post({
		url: "https://ponychallenge.trustpilot.com/pony-challenge/maze",
		data: JSON.stringify(dataToSend),
		dataType: "json",
		contentType: "application/json; charset=utf-8"
		});
		
		jqxhr.fail(function(jqXHR, textStatus, errorThrown) {
				showErrorMessage(jqXHR.responseText);
			});
		
		jqxhr.done(function(gameInfo) {
			game.construct(gameInfo['maze_id'], ponyId);
		});
};

game.load = function(newMaze, ponyImgId) {
	var maze = this.maze;
	maze.construct(newMaze, ponyImgId);
	maze.draw();
	
	$("#play .game-play").removeClass("active");
	$("#play .game-play.playground").addClass("active");
	
	scrollToSection("#play", -140);
}

game.construct = function(id, ponyImgId) {
	var jqxhr = $.get({
		url: "https://ponychallenge.trustpilot.com/pony-challenge/maze/" + id,
		contentType: "application/json; charset=utf-8"	
	});
	
	jqxhr.fail(function(jqXHR, textStatus, errorThrown) {
		showErrorMessage(jqXHR.responseText);
	});
	
	var game = this;
	
	jqxhr.done(function (newMaze) {
		game.state = newMaze["game-state"].state
		
		if(game.state === "active" || game.state === "Active") {
			game.load(newMaze, ponyImgId);
		}
		else { //game isn't active
			var imgUrl = newMaze["game-state"]["hidden-url"];
			game.over(imgUrl);
		}
	});
}

game.maze.construct = function(newMaze, ponyId) {
	var maze = this;
	
	maze.data = newMaze.data;
	maze.domokun = newMaze.domokun[0];
	maze.pony = newMaze.pony[0];
	maze.endPoint = newMaze["end-point"][0];
	maze.id = newMaze.maze_id;
	maze.height = newMaze.size[1];
	maze.width = newMaze.size[0];
	maze.gameState = newMaze["game-state"];
			
	var canvas = $("#gameCanvas")[0];
	maze.canvas = canvas;
	maze.ctx = canvas.getContext("2d");	
	maze.ctx.strokeStyle = 'grey';
				
	//update canvas dimensions
	maze.canvas.width = maze.width * maze.x;
	maze.canvas.height = maze.height * maze.x;
		
	maze.ponyImg = $("img#" + ponyId)[0];
}

game.update = function() {
	var game = this;
	
	var jqxhr = $.get({
			url: "https://ponychallenge.trustpilot.com/pony-challenge/maze/" + game.maze.id,
			contentType: "application/json; charset=utf-8"	
		});
	
	jqxhr.fail(function(jqXHR, textStatus, errorThrown) {
		showErrorMessage(jqXHR.responseText);
	});
	
	jqxhr.done(function(newMaze) {
			game.state = newMaze["game-state"].state;
			game.maze.update(newMaze);
		});
}

game.maze.update = function(newMaze) {
	var maze = this;
	
	maze.eraseCell(maze.pony);
	maze.eraseCell(maze.domokun);
			
	maze.domokun = newMaze.domokun[0];
	maze.pony = newMaze.pony[0];
			
	maze.drawCell($("#end")[0], maze.endPoint);
	maze.drawCell(maze.ponyImg, maze.pony);
	maze.drawCell($("#domokun")[0], maze.domokun);
}

//add moving via keystrokes
$(document).keydown(function(e) {
	if(game.state == "active" || game.state == "Active") {
		switch(e.which) {
			case 37: game.move("west");
			break;

			case 38: game.move("north");
			break;

			case 39: game.move("east");
			break;

			case 40: game.move("south");
			break;
			
			case 83: game.move("stay"); //keycode for 's'
			break;

			default: return;
		}
		e.preventDefault();
	}
	
});

game.move = function(direction) {
	var dataToSend = {direction : direction};
	var game = this;
	
	var jqxhr = $.post({
		url: "https://ponychallenge.trustpilot.com/pony-challenge/maze/" + game.maze.id,
		contentType: "application/json; charset=utf-8",
		data: JSON.stringify(dataToSend),
		dataType: "json"
		});
	
	jqxhr.fail(function(jqXHR, textStatus, errorThrown) {
		showErrorMessage(jqXHR.responseText);
	});
		
	jqxhr.done(function(newState) {
		game.state = newState.state;
		
		if(game.state !== "active") { //game over
			var hiddenUrl = newState["hidden-url"];
			game.over(hiddenUrl);
			return;
		}
		game.update();
	});
}

game.over = function(imgUrl) {	
	$("#play .game-play.game-over img").attr("src", "https://ponychallenge.trustpilot.com" + imgUrl);
	
	$("#play .game-play").removeClass("active");
	$("#play .game-play.game-over").addClass("active");
	
	scrollToSection("#play", -140);
}

game.maze.drawPath = function(path) {
	var maze = this;
	for(cell in path) {
		maze.drawDot(path[cell]);
	}
}

game.maze.drawDot = function (cell) {
	var maze = this;
	var coors = maze.getCoordinates(cell);
	
	maze.ctx.beginPath();
	maze.ctx.arc(coors.x + maze.x / 2, coors.y + maze.x / 2, maze.x / 4, 0, 2 * Math.PI);
	maze.ctx.fillStyle = "#f0a";
	maze.ctx.fill();
}

game.findWay = function(endPos) {
	var maze = this.maze;
	
	var ponyPos = maze.pony;
	
	//to preserve the path
	var parents = {};
	var used = [ponyPos];
	
	var queue = [ponyPos];
	
	while(queue.length != 0) {
		var current = queue.shift();

		if(current == endPos) {
			var result = [];
			current = parents[current];
			while(current != ponyPos) {
				result.push(current);
				current = parents[current];
			}
			return result;
		}
		
		//north neighbour
		var northNeighbour = current - maze.width;
		if( northNeighbour >= 0
			&& maze.data[current].indexOf("north") == -1
			&& used.indexOf(northNeighbour) == -1) {
			used.push(northNeighbour);
			queue.push(northNeighbour);
			parents[northNeighbour] = current;
		}
		
		//south neighbour
		var southNeighbour = current + maze.width;
		if( southNeighbour < maze.width * maze.height
			&& maze.data[southNeighbour].indexOf("north") == -1
			&& used.indexOf(southNeighbour) == -1) {
			used.push(southNeighbour);
			queue.push(southNeighbour);
			parents[southNeighbour] = current;
		}
		
		//east neighbour
		var eastNeighbour = current + 1;
		if( (eastNeighbour) % maze.width != 0
			&& maze.data[eastNeighbour].indexOf("west") == -1
			&& used.indexOf(eastNeighbour) == -1) {
			used.push(eastNeighbour);
			queue.push(eastNeighbour);
			parents[eastNeighbour] = current;
		}
		
		//west neighbour
		var westNeightbour = current - 1;
		if( current % maze.width != 0
			&& maze.data[current].indexOf("west") == -1
			&& used.indexOf(westNeightbour) == -1) {
			used.push(westNeightbour);
			queue.push(westNeightbour);
			parents[westNeightbour] = current;
		}
	}	
}

game.maze.draw = function() {
	var maze = this;
	
	for(cell in this.data) {
		if(maze.data[cell].indexOf("north") >= 0)
			maze.drawNorthWall(cell);
		if(maze.data[cell].indexOf("west") >= 0)
			maze.drawWestWall(cell);
	}
	
	//draw rigth wall
	maze.ctx.moveTo(maze.width * maze.x, 0);
	maze.ctx.lineTo(maze.width * maze.x, maze.height * maze.x);
	maze.ctx.stroke();
	
	//draw bottom wall
	maze.ctx.moveTo(0, maze.height * maze.x);
	maze.ctx.lineTo(maze.width * maze.x, maze.height * maze.x);
	maze.ctx.stroke();
	
	maze.drawCell(maze.ponyImg, maze.pony);
	maze.drawCell($("#domokun")[0], maze.domokun);
	maze.drawCell($("#end")[0], maze.endPoint);
}

game.maze.clear = function() {
	var maze = this;
	maze.ctx.clearRect(0, 0, maze.canvas.width, maze.canvas.height);
}

game.maze.increaseCellSize = function() {
	var maze = this;
	maze.x++;
	if(maze.x > 35) maze.x = 35;
	
	//update canvas dimensions
	maze.canvas.width = maze.width * maze.x;
	maze.canvas.height = maze.height * maze.x;
	
	maze.clear();
	maze.draw();
}

game.maze.decreaseCellSize = function() {
	var maze = this;
	maze.x--;
	if(maze.x < 15) maze.x = 15;
	
	//update canvas dimensions
	maze.canvas.width = maze.width * maze.x;
	maze.canvas.height = maze.height * maze.x;
	
	maze.clear();
	maze.draw();
}

game.maze.drawCell = function(img, tile) {
	var maze = this;
	var coordinates = maze.getCoordinates(tile);
	
	maze.ctx.drawImage(img, coordinates.x + 1, coordinates.y + 1, maze.x - 5, maze.x - 5);
}

game.maze.eraseCell = function(cell) {
	var maze = this;
	var coordinates = maze.getCoordinates(cell);
	
	maze.ctx.clearRect(coordinates.x + 1, coordinates.y + 1, maze.x - 5, maze.x - 5);
}

game.maze.drawNorthWall = function(cell) {
	var maze = this;
	var coors = maze.getCoordinates(cell);
	
	maze.ctx.moveTo(coors.x, coors.y);
	maze.ctx.lineTo(coors.x + maze.x, coors.y);
	
	maze.ctx.stroke();
}

game.maze.drawWestWall = function drawWestWall(cell) {
	var maze = this;
	var coors = maze.getCoordinates(cell);
	
	maze.ctx.moveTo(coors.x, coors.y);
	maze.ctx.lineTo(coors.x, coors.y + maze.x);
	
	maze.ctx.stroke();
}

game.maze.getCoordinates = function(cell) {
	var maze = this;
	
	var rowAndCol = maze.getRowAndColumn(cell);
	var xCoor = maze.x * rowAndCol.column;
	var yCoor = maze.x * rowAndCol.row;
	
	return {x : xCoor, y : yCoor};
}

game.maze.getRowAndColumn = function(cell) {
	var maze = this;
	var row = Math.floor(cell / maze.width);
	var column = cell % maze.width;
	
	return {row: row, column: column};
}

