let margin = { top: 100, right: 0, bottom: 0, left: 0 };
let width = 0.8 * window.innerWidth - margin.left - margin.right;
let height = 0.8 * window.innerHeight - margin.top - margin.bottom;
let innerRadius = 90;
let outerRadius = Math.min(width, height) / 2;   // the outerRadius goes from the middle of the SVG area to the border
let data_file = "";
let total_points = 50;
let Y_axis = "value";

const load_CSV = file => {
    //Read the data
    d3.csv(`Data/${file}`,

        function (data) {
            // Keep only the few points
            data = data.filter(function (d, i) { return i < total_points });
            // append the svg object
            var svg = d3.select("#radial-chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");
            // X scale: common for 2 data series
            var x = d3.scaleBand()
                .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
                .align(0)                  // This does nothing
                .domain(data.map(function (d) { return d.date; })); // The domain of the X axis is the list of states.

            // Y scale outer variable
            var y = d3.scaleRadial()
                .range([innerRadius, outerRadius])   // Domain will be define later.
                .domain([0, 100]); // Domain of Y is from 0 to the max seen in the data

            // Second barplot Scales
            var ybis = d3.scaleRadial()
                .range([innerRadius, 5])   // Domain will be defined later.
                .domain([0, 100]);

            // Add the bars
            svg.append("g")
                .selectAll("path")
                .data(data)
                .enter()
                .append("path")
                .attr("fill", "#69b3a2")
                .attr("class", "yo")
                .attr("d", d3.arc()     // imagine your doing a part of a donut plot
                    .innerRadius(innerRadius)
                    .outerRadius(function (d) { return y(d['New York']); })
                    .startAngle(function (d) { return x(d.date); })
                    .endAngle(function (d) { return x(d.date) + x.bandwidth(); })
                    .padAngle(0.01)
                    .padRadius(innerRadius))

            // Add the labels
            svg.append("g")
                .selectAll("g")
                .data(data)
                .enter()
                .append("g")
                .attr("text-anchor", function (d) { return (x(d.date) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
                .attr("transform", function (d) { return "rotate(" + ((x(d.date) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (y(d['New York']) + 10) + ",0)"; })
                .append("text")
                .text(function (d) { return (d.date) })
                .attr("transform", function (d) { return (x(d.date) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
                .style("font-size", "11px")
                .attr("alignment-baseline", "middle")

            // Add the second series
            svg.append("g")
                .selectAll("path")
                .data(data)
                .enter()
                .append("path")
                .attr("fill", "red")
                .attr("d", d3.arc()     // imagine your doing a part of a donut plot
                    .innerRadius(function (d) { return ybis(0) })
                    .outerRadius(function (d) { return ybis(d['San Francisco']); })
                    .startAngle(function (d) { return x(d.date); })
                    .endAngle(function (d) { return x(d.date) + x.bandwidth(); })
                    .padAngle(0.01)
                    .padRadius(innerRadius))

        })
};
document.getElementById("radial-entries").addEventListener("change", (e) => {
    total_points = e.target.value;
    d3.select("#radial-chart").text("");
    load_CSV(data_file);
})
document.getElementById("uploader").addEventListener("change", (e) => {
    data_file = e.target.value.split('\\')[2];
    d3.select("#radial-chart").text("");
    load_CSV(data_file)
})

if (data_file == "") {
    d3.select('#radial-chart').append("span").attr("class", "No-Data").append("h1").text("Please Choose a File to preview the Data Report and the Data Visuals !");
} else {
    d3.select("#radial-chart").text("");
    load_CSV(data_file);
}