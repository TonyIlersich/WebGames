const TAU = 2 * Math.PI;
const PHI = 1.61803398875;

bg = {
	FPS: 24,
	width: undefined,
	height: undefined,
	aspect: undefined,
	canvas: null,
	context: null,
	tick: undefined,
	circuit: null,
	meter: null,
	
	//this 
	Circuit: function(x0, y0, x1, y1)
	{
		//these properties are used for spacing
		const WIDTH = x1 - x0;
		const HEIGHT = y1 - y0;
		const MARGIN = .1 * WIDTH;
		var N_BRANCHES = undefined;
		var BRANCH_WIDTH = undefined;
		const N_SEGMENTS = 30;
		const SEGMENT_HEIGHT = (HEIGHT - 2 * MARGIN) / N_SEGMENTS;
		const OPTIONS = {
			"start node": [ "continue" ],
			"end node": [ "dead" ],
			"line": [ "continue", "shift", "end node" ],
			"dead": [ "dead", "start node" ]
		};
		
		//this function recalculates some constants to address a change in aspect ratio
		this.refresh = function()
		{
			N_BRANCHES = Math.floor(bg.aspect * 4);
			BRANCH_WIDTH = (WIDTH - 2 * MARGIN) / (N_BRANCHES - 1);
			if (this.branchState)
			{
				while (this.branchState.length < N_BRANCHES)
				{
					this.branchState.push("start node");
				}
			}
		}
		
		this.refresh();
		
		//this function calculates the x-position of the i-th branch
		this.branchX = function(i)
		{
			return MARGIN + i * BRANCH_WIDTH;
		}
		
		//this property keeps track of what state we left each branch in
		this.branchState = [];
		for (var i = 0; i < N_BRANCHES; i++)
		{
			this.branchState.push("start node");
		}
		
		//this property keeps track of which segment we are on
		this.segment = 0;
		
		//this function selects a random option given a the state a branch is in
		this.randomOption = function(state)
		{
			var i = Math.floor(Math.random() * OPTIONS[state].length);
			return OPTIONS[state][i];
		}
		
		//this function draws the next segment in the animation
		this.step = function()
		{
			//set the correct context settings
			bg.context.lineCap = "round";
			bg.context.lineWidth = Math.min(.5 * MARGIN, .2 * BRANCH_WIDTH);
			
			//check that we would draw on-screen
			if (this.segment >= 0)
			{
				//assume each branch will be dead in the next step
				var futureState = [];
				for (var i = 0; i < N_BRANCHES; i++)
				{
					futureState[i] = "dead";
				}
				
				//cycle through all branches
				for (var i = 0; i < N_BRANCHES; i++)
				{
					//choose an appropriate action for how to proceed
					var action = "error";
					if (this.segment == N_SEGMENTS)
					{
						action = "end node";
					}
					else
					{
						action = this.randomOption(this.branchState[i]);
					}
					
					if (action == "error")
					{
						console.log("failed to choose action for branch " + i + "!");
					}
					else if (action == "start node" || action == "end node")
					{
						//get the position of the node on the canvas
						var x = this.branchX(i);
						var y;
						
						if (action == "start node")
						{
							y = (this.segment + 1) * SEGMENT_HEIGHT + MARGIN;
						}
						else
						{
							y = this.segment * SEGMENT_HEIGHT + MARGIN;
						}
						
						//draw circle to canvas
						var radius = Math.min(MARGIN, .4 * BRANCH_WIDTH);
						bg.context.fillStyle = bg.clr(0, .5, 1, 1);
						bg.context.beginPath();
						bg.context.ellipse(x, y, radius, radius * bg.aspect, 0, 0, TAU);
						bg.context.fill();

						if (action == "start node")
						{
							futureState[i] = "start node";
						}
					}
					else if (action == "continue" || action == "shift")
					{
						var fromX = this.branchX(i);
						var fromY = this.segment * SEGMENT_HEIGHT + MARGIN;
						var toX = fromX;
						var toY = (this.segment + 1) * SEGMENT_HEIGHT + MARGIN;
						
						if (action == "shift")
						{
							var dir;
							
							if (i == 0)
							{
								dir = 1;
							}
							else if (i == N_BRANCHES - 1)
							{
								dir = -1;
							}
							else
							{
								dir = Math.random() < .5 ? -1 : 1;
							}
							
							if (futureState[i + dir] == "line" || futureState[i + dir] == "dead")
							{
								toX = this.branchX(i + dir);
								futureState[i + dir] = "line";
							}
							else
							{
								futureState[i] = "line";
							}
						}
						else
						{
							futureState[i] = "line";
						}
						
						bg.context.strokeStyle = bg.clr(0, .5, 1, 1);
						bg.context.shadowBlur = .5 * BRANCH_WIDTH;
						bg.context.shadowColor = bg.clr(0, .5, 1, 1);
						bg.context.beginPath();
						bg.context.moveTo(fromX, fromY);
						bg.context.lineTo(toX, toY);
						bg.context.stroke();
						bg.context.shadowBlur = 0;
					}
				}
			
				this.branchState = futureState;
			}
			
			this.segment++;
			
			if (this.segment - 1 == N_SEGMENTS)
			{
				this.segment = -N_SEGMENTS * 2;
				this.branchState = [];
				for (var i = 0; i < N_BRANCHES; i++)
				{
					this.branchState.push("start node");
				}
			}
		}
	},
	
	Meter: function()
	{
		const WIDTH = .1 * bg.width;
		const HEIGHT = bg.height;
		const MARGIN = .1 * WIDTH;
		
		const N_NOTCHES = 61;
		
		this.y = undefined;
		
		this.notchY = function(i)
		{
			var progress = i / (N_NOTCHES - 1);
			var usefulHeight = HEIGHT - 2 * MARGIN;
			return MARGIN + usefulHeight * progress;
		}
		
		this.redraw = function()
		{
			bg.context.lineCap = "square";
			bg.context.lineWidth = .2 * MARGIN;
			bg.context.strokeStyle = bg.clr(.5, .65, 1, 1);
			bg.context.shadowColor = bg.clr(0, .5, 1, 1);
			bg.context.shadowBlur = 10 * bg.context.lineWidth;
			bg.context.beginPath();
			
			for (var i = 0; i < N_NOTCHES; i++)
			{
				var usefulWidth = WIDTH - 2 * MARGIN;
				
				var x0 = bg.width - usefulWidth * .5 - MARGIN;
				var x1 = bg.width - usefulWidth * .375 - MARGIN;
				var x2 = bg.width - usefulWidth * .25 - MARGIN;
				var x3 = bg.width - usefulWidth * .125 - MARGIN;
				var x4 = bg.width - MARGIN;
				
				var xl = (i % 10 == 0) ? x0 : x1;
				var xr = (i % 10 == 0) ? x4 : x3;
				
				bg.context.moveTo(x2, this.notchY(0));
				bg.context.lineTo(x2, this.notchY(N_NOTCHES - 1));
				
				var y0 = this.notchY(i);
				var y1 = this.notchY(i * PHI);
				
				bg.context.moveTo(x2, y0);
				bg.context.lineTo(xl, y0);
				
				bg.context.moveTo(x2, y1);
				bg.context.lineTo(xr, y1);
			}
			
			bg.context.stroke();
			bg.context.stroke();
			
			bg.context.shadowBlur = 0;
		}
		
		this.drawPointer = function()
		{
			var elem = $("#gameList");
			
			var usefulHeight = HEIGHT - 2 * MARGIN;
			var yScroll = elem.scrollTop();
			var yMax = elem[0].scrollHeight - elem.height();
			var yTarget = usefulHeight * yScroll / yMax;
			
			var weight = .8;
			if (this.y)
			{
				this.y = weight * this.y + (1 - weight) * yTarget;
			}
			else
			{
				this.y = yTarget;
			}
			
			var pointerHeight = .02 * usefulHeight;
			var y0 = this.y - pointerHeight / 2;
			var y1 = this.y + pointerHeight / 2;
			
			var usefulWidth = WIDTH - 2 * MARGIN;
			var x0 = bg.width - usefulWidth * .6 - MARGIN;
			var x1 = bg.width - usefulWidth * .3 - MARGIN;
			
			bg.context.lineCap = "round";
			bg.context.lineWidth = .25 * MARGIN;
			bg.context.fillStyle = bg.clr(.5, .75, 1, 1);
			
			bg.context.beginPath();
			bg.context.moveTo(x0, y0);
			bg.context.lineTo(x1, this.y);
			bg.context.lineTo(x0, y1);
			bg.context.lineTo(x0, y0);
			bg.context.closePath();
			bg.context.fill();
			bg.context.stroke();
		}
		
		this.update = function()
		{
			this.redraw();
			this.drawPointer();
		}
	},
	
	clr: function(r, g, b, a)
	{
		return "rgba(" + r * 255 + "," + g * 255 + "," + b * 255 + "," + a + ")";
	},
	
	getAspect: function()
	{
		this.aspect = $("#bgCanvas").width() / $("#bgCanvas").height();
		console.log(this.aspect);
	},
	
	init: function()
	{
		this.width = $("#bgCanvas").attr("width");
		this.height = $("#bgCanvas").attr("height");
		
		this.getAspect();
		
		this.canvas = document.getElementById("bgCanvas");
		this.context = this.canvas.getContext("2d");
		
		this.circuit = new this.Circuit(0, 0, .1 * this.width, this.height);
		this.meter = new this.Meter();
		
		this.tick = 0;
		
		setInterval(() => { this.redraw(); }, 1000 / this.FPS);
	},
	
	redraw: function()
	{
		this.fade();
		
		this.circuit.step();
		this.meter.update();
		
		this.tick++;
	},
	
	fade: function()
	{
		var delta = .01 * 255;
		var img = this.context.getImageData(0, 0, .1 * this.width, this.height);
		for (var i = 3; i < img.data.length; i += 4)
		{
			img.data[i] = Math.max(0, img.data[i] * .9 - delta);
		}
		this.context.clearRect(0, 0, this.width, this.height);
		this.context.putImageData(img, 0, 0);
		
		//this.context.fillRect(0, 0, .1 * this.width, this.height);
		//this.context.clearRect(.1 * this.width, 0, .9 * this.width, this.height);
	},
}

$(document).ready(function ()
{
	console.log("page loaded");
	
	$(window).resize(() => { bg.getAspect(); bg.circuit.refresh(); });
	
	bg.init();
});
