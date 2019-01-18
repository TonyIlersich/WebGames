const TAU = 2 * Math.PI;

bg = {
	FPS: 1,
	width: undefined,
	height: undefined,
	canvas: null,
	context: null,
	
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
		this.context.strokeStyle = "#00ff00";
		this.context.beginPath();
		this.context.arc(this.width / 2, this.height / 2, 0, Date.now() * TAU);
		this.context.stroke();
	},
	
	
}

$(document).ready(function ()
{
	console.log("page loaded");
	
	bg.init();
});
