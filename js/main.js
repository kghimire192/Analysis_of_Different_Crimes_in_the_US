/*
*    main.js
*    
*/

	//load the google charts
	google.charts.load('current',{'packages':['corechart']});
			
	//load the Callback function that runs when page loads
	google.charts.setOnLoadCallback(drawGraphs);


	//function that runs when page loads
	function drawGraphs() {
		plotEachGraph('totalCrime', 
					'SELECT A, D',
					crimeRateGrowthHandler);	
					
		plotEachGraph('totalCrime', 
						'SELECT F,G,H,I,J,K,L,M,N,O',
						timeSeriesGrowthHandler);

		plotEachGraph('average', 
						'SELECT A,B,C',
						bubbleChartHandler);
	} //drawGraphs


	//function called within the callback function that takes in spreadsheet name, query and handler name as arguments,
			//which then sends the query response to the handler specified in the argument
	function plotEachGraph(sheet, queryString, handlerName) {
				var encodedQuery = encodeURIComponent(queryString);
				var query = new google.visualization.Query(
					'https://docs.google.com/spreadsheets/d/1GiYGgF2pZnr0V-9IxzwWv7MXGliuppyiZPRqy5_B0eM/gviz/tq?sheet='+
								sheet + '&headers=1&tq=' + encodedQuery);
				query.send(handlerName);
	} //plotEachGraph

	//function that draws a Geo chart to show the percentage growth (from 2010 to 2017) in crime rate for all US states
	function crimeRateGrowthHandler(response) {
		var data = response.getDataTable();
		var options = {
					region:'US',
					displayMode: 'regions',
					resolution: 'provinces',
					colorAxis: {colors: ['#eeebf4', '#655091']},
					//colorAxis: {colors: ['pink', 'purple']},
					backgroundColor: '#E0DFDE'
		};
		
		var chart = new google.visualization.GeoChart(
					document.getElementById('crime_Growth_percent'));
		
		chart.draw(data, options);
	} //crimeRateGrowthHandler

	//function that draws a line chart 
	function timeSeriesGrowthHandler(response) {
		var data = response.getDataTable();
		var options = {
					title: 'Total Crime Rate from 2011 to 2017',
					vAxis: {title: 'Total Crime Rate'},
					hAxis: {title: 'Year'},
					backgroundColor: '#E0DFDE'	
		};
		
		var chart = new google.visualization.LineChart(
					document.getElementById('line-chart-area'));
		
		chart.draw(data, options);
	} //timeSeriesGrowthHandler

	//function that draws bubble chart 
	function bubbleChartHandler(response) {
		var data = response.getDataTable();
		var options = {
					title: 'Violent Crime Rate vs. Property Crime Rate',
					
					vAxis: {title: 'Average Property Crime Rate'},
					hAxis: {title: 'Average Violent Crime Rate'},	
					colors:['red'],
					backgroundColor: '#E0DFDE'
		};
		
		var chart = new google.visualization.BubbleChart(
					document.getElementById('bubble-chart-area'));
		
		chart.draw(data, options);
	} //bubbleChartHandler

	// Bar Graph
	const drawBarGraph = () => {

			//set margins (left, top, right, bottom)
			let margin = {left:100, top:10, right:10, bottom: 150};
			
			let width = 1000 - margin.left - margin.right,
			height = 700 - margin.top - margin.bottom;
			
			//adding group <g> tag to svg
			let group = d3.select("#chart-area")
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", 
			"translate(" + margin.left + ", " + margin.top + ")");
			
			// tooltip
			let tip = d3.tip()
			.attr("class","d3-tip")
			.html(function(d){
				let text = "<strong>State: </strong><span style='color:#00CCFF'>" + d.State + "</span><br>";
				text += "<strong>Total Crime Rate: </strong><span style='color:#00CCFF'>" + d3.format("0.2f")(d.TotalCrimeRate) + "</span><br>";
				return text;
			})
			
			group.call(tip);
			
			//x label
			group.append("text")
			.attr("x", width/2)
			.attr("y", height+100)
			.attr("font-size", "25px")
			.attr("text-anchor", "middle")
			.text("States");
			
			//y label
			group.append("text")
			.attr("x", -(height/2))
			.attr("y", -50)
			.attr("font-size", "25px")
			.attr("text-anchor", "middle")
			.attr("transform", "rotate(-90)")
			.text("Total Crime Rate (per 100,000)");
			
			function renderBarGraph(file_name) {
				d3.csv(file_name).then(function(given_data) {
					
					// sort data in descending order

					given_data = given_data.sort((a,b) => b.TotalCrimeRate - a.TotalCrimeRate)

					// given_data = given_data.sort(function(a,b){
					// 	return d3.descending(a.TotalCrimeRate, b.TotalCrimeRate)
					// })
					
					console.log(given_data);
					
					given_data.forEach(function(d){
						d.TotalCrimeRate = +d.TotalCrimeRate; //casting into integer
					});
					
					// x scale
					let x = d3.scaleBand()
					.domain(given_data.map(function(d){ return d.State }))
					.range([0,width])
					.paddingInner(0.3)
					.paddingOuter(0.3);
					
					
					// y scale
					let y = d3.scaleLinear()
					.domain([0, d3.max(given_data, function(d){ return d.TotalCrimeRate}) + 20]) 
					.range([height,0]);
					
					//Axes generators
					let xAxisCall = d3.axisBottom(x);
					group.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0, " + height + ")")
					.call(xAxisCall)
					.selectAll("text")
					.attr("y", "0")
					.attr("x", "-5")
					.attr("text-anchor", "end")
					.attr("transform", "rotate(-90)");
					
					let yAxisCall = d3.axisLeft(y)
					.ticks(5)
					.tickFormat(function(d){ return d });
					group.append("g")
					.attr("class", "y axis")
					.call(yAxisCall);
					
					let rects = group.selectAll("rect")
					.data(given_data)
					.enter()
					.append("rect")
					.attr("x", function(d,i){ return x(d.State) })
					.attr("y", function(d){ return y(d.TotalCrimeRate) })
					.attr("width", x.bandwidth())
					.attr("height", function(d){ return height-y(d.TotalCrimeRate) })
					.attr("fill", "#1e5878")
					//.attr("fill", "#69a7ac")
					.on('mouseover', tip.show)
					.on('mouseout', tip.hide)
				}); //d3.json
			}
			renderBarGraph(file_name);
		} //Bar Graph
		
			file_name = document.getElementById("year-select").value;
			drawBarGraph();
			
			
	// Drop down menu actions
		// Event Listener
			// Get Element
			let dropDown = document.getElementById("year-select")
			// Add Event Listener
			dropDown.addEventListener("change", handleChange);
			// Handle event
			function handleChange(event) {
				file_name = event.target.value;
				console.log(event.target.value);
				// Delete Chart Area
				let chartArea =  document.getElementById("chart-area")
				chartArea.innerHTML = "";
				// Draw and render bar graph
				drawBarGraph();
			}