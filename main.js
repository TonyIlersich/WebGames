const TAU = 2 * Math.PI;

bg = {
	FPS: 1,
	width: undefined,
	height: undefined,
	canvas: null,
	context: null,
	
	clr: function(r, g, b, a)
	{
		return "rgba(" + r * 255 + "," + g * 255 + "," + b * 255 + "," + a + ")";
	},
	
	init: function()
	{
		this.width = $("#bgCanvas").attr("width");
		this.height = $("#bgCanvas").attr("height");
		this.canvas = document.getElementById("bgCanvas");
		this.context = this.canvas.getContext("2d");
		setInterval(() => { this.redraw(); }, 1000 / this.FPS);
	},
	
	redraw: function()
	{
		console.log("redrawing");
		this.context.clearRect(0, 0, this.width, this.height);
		this.context.strokeStyle = this.clr(1, 0, 0, .2);
		this.context.lineWidth = .5 * this.height;
		this.context.beginPath();
		//...
		this.context.stroke();
	},
	
	
}

$(document).ready(function ()
{
	console.log("page loaded");
	
	bg.init();
});
