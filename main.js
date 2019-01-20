const TAU = 2 * Math.PI;

bg = {
	FPS: 24,
	width: undefined,
	height: undefined,
	aspect: undefined,
	canvas: null,
	context: null,
	tick: undefined,
	fractal: null,
	
	Fractal: function(x0, y0, x1, y1)
	{
		const WIDTH = x1 - x0;
		const HEIGHT = y1 - y0;
		const MARGIN = .1 * WIDTH;
		var N_BRANCHES = undefined;
		var BRANCH_WIDTH = undefined;
		const N_SEGMENTS = 30;
		const SEGMENT_HEIGHT = (HEIGHT - 2 * MARGIN) / N_SEGMENTS;
		const OPTIONS_FROM_START_NODE = [
			"continue"
		];
		const OPTIONS_FROM_END_NODE = [
			"dead"
		];
		const OPTIONS_FROM_LINE = [
			"continue",
			"shift",
			"end node"
		];
		const OPTIONS_FROM_DEAD = [
			"dead",
			"start node"
		];
		
		this.refresh = function()
		{
			N_BRANCHES = Math.floor(bg.aspect * 4);
			BRANCH_WIDTH = (WIDTH - 2 * MARGIN) / (N_BRANCHES - 1);
		}
		
		this.refresh();
		
		this.branchX = function(i)
		{
			return MARGIN + i * BRANCH_WIDTH;
		}
		
		this.branchState = [];
		for (var i = 0; i < N_BRANCHES; i++)
		{
			this.branchState.push("start node");
		}
		
		this.segment = 0;
		
		this.step = function()
		{
			bg.context.lineCap = "round";
			bg.context.lineWidth = Math.min(.5 * MARGIN, .2 * BRANCH_WIDTH);
			
			if (this.segment >= 0)
			{
				var futureState = [];
				
				for (var i = 0; i < N_BRANCHES; i++)
				{
					futureState[i] = "dead";
				}
				
				for (var i = 0; i < N_BRANCHES; i++)
				{
					var action = "error";
					
					if (this.segment == N_SEGMENTS)
					{
						action = "end node";
					}
					else if (this.branchState[i] == "start node")
					{
						action = OPTIONS_FROM_START_NODE[Math.floor(Math.random() * OPTIONS_FROM_START_NODE.length)];
					}
					else if (this.branchState[i] == "end node")
					{
						action = OPTIONS_FROM_END_NODE[Math.floor(Math.random() * OPTIONS_FROM_END_NODE.length)];
					}
					else if (this.branchState[i] == "line")
					{
						action = OPTIONS_FROM_LINE[Math.floor(Math.random() * OPTIONS_FROM_LINE.length)];
					}
					else if (this.branchState[i] == "dead")
					{
						action = OPTIONS_FROM_DEAD[Math.floor(Math.random() * OPTIONS_FROM_DEAD.length)];
					}
					
					if (action == "error")
					{
						console.log("failed to choose action for branch " + i + "!");
					}
					else if (action == "start node" || action == "end node")
					{
						var x = this.branchX(i);
						var y = this.segment * SEGMENT_HEIGHT + MARGIN;
						
						if (action == "start node")
						{
							y = (this.segment + 1) * SEGMENT_HEIGHT + MARGIN;
						}
						
						bg.context.fillStyle = bg.clr(0, .5, 1, 1);
						bg.context.beginPath();
						var radius = Math.min(MARGIN, .4 * BRANCH_WIDTH);
						console.log(radius * bg.aspect);
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
		
		this.fractal = new this.Fractal(0, 0, .1 * this.width, this.height);
		
		this.tick = 0;
		
		setInterval(() => { this.redraw(); }, 1000 / this.FPS);
	},
	
	redraw: function()
	{
		console.log("redrawing");
		
		this.fade(this.clr(0, .05, .1, .1));
		
		this.fractal.step();
		
		this.tick++;
	},
	
	fade: function(toColor)
	{
		this.context.fillStyle = toColor;
		this.context.fillRect(0, 0, this.width, this.height);
	},
}

$(document).ready(function ()
{
	console.log("page loaded");
	
	$(window).resize(() => { bg.getAspect(); bg.fractal.refresh(); });
	
	bg.init();
});
