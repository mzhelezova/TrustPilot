$(document).ready(function() {
	var data = {
		datasets: [{
			data: [25, 17, 32, 9, 8, 9],
			backgroundColor: [
				"lightpink",
				"whitesmoke",				
				"mediumpurple",
				"deepskyblue", 
				"hotpink", 
				"lightgoldenrodyellow"
			],
			hoverBorderColor: "orange"
		}],

		labels: [
			'Java developer',
			'C++/C# developer',
			'Algorithms and data structures',
			'HTML/CSS/JS',
			'MLP fan',
			'Adventure lover'
		]
	};
	var ctx = $("#about-me")[0].getContext("2d");
	skillsChart = new Chart(ctx, {
		type: 'doughnut',
		data: data,
		options: {
			responsive: true, 
			maintainAspectRatio: false
		}
	});

});