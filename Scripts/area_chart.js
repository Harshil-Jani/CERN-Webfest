const margin = { top: 10, right: 30, bottom: 30, left: 50 };
const width = (window.innerWidth - margin.left - margin.right) / 1.45;
const height = (window.innerHeight - margin.top - margin.bottom) / 1.45;
let total_points = 50;
let Y_axis = "value";
let data_file = "";
const name_fields = table_columns => {
    const options = [];
    for (let i = 0; i < table_columns.length; i++) {
        d3.selectAll("#column_fields-ac").append("option").text(table_columns[i]).attr("class", "area-column-1");
    }
    // Removing Duplicate Entries in Dropdown
    document.querySelectorAll(".area-column-1").forEach((option) => {
        if (options.includes(option.value)) {
            option.remove();
        } else {
            options.push(option.value);
        }
    })
}

const load_CSV = file => {
    console.log(file);
    //Read the data
    d3.csv(`Data/${file}`,
        // When reading the csv, I must format variables:
        function (d) {
                return { ...d, date: d3.timeParse("%Y-%m-%d")(d.date) }
        },

        // Now I can use this dataset:
        function (data) {
            console.log(data);
            let table_columns = data.columns;
            name_fields(table_columns);
            const svg = d3.select("#area-chart")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");
            // Keep only the few points
            data = data.filter(function (d, i) { return i < total_points })
            // Add X axis --> it is a date format
            var x = d3.scaleTime()
                .domain(d3.extent(data, function (d) { return d.date; }))
                .range([0, width]);
            svg.append("g")
                .attr("transform", "translate(0," + (height + 5) + ")")
                .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0));

            // Add Y axis
            const extent_array = d3.extent(data, function (d) { return +d[Y_axis]; });
            extent_array[0] = 0;
            var y = d3.scaleLinear()
                .domain(extent_array)
                .range([height, 0]);
            svg.append("g")
                .attr("transform", "translate(-5,0)")
                .call(d3.axisLeft(y).tickSizeOuter(0));

            // Add the area
            svg.append("path")
                .datum(data)
                .attr("fill", "#69b3a2")
                .attr("fill-opacity", .3)
                .attr("stroke", "none")
                .attr("d", d3.area()
                    .x(function (d) { return x(d.date) })
                    .y0(height)
                    .y1(function (d) { return y(d[Y_axis]) })
                )

            // Add the line
            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "#69b3a2")
                .attr("stroke-width", 4)
                .attr("d", d3.line()
                    .x(function (d) { return x(d.date) })
                    .y(function (d) { return y(d[Y_axis]) })
                )

            // Add the line
            svg.selectAll("myCircles")
                .data(data)
                .enter()
                .append("circle")
                .attr("fill", "red")
                .attr("stroke", "none")
                .attr("cx", function (d) { return x(d.date) })
                .attr("cy", function (d) { return y(d[Y_axis]) })
                .attr("r", 5)
                .append("title").text(d => d[Y_axis])
        })
};

document.getElementById("area-entries").addEventListener("change", (e) => {
    total_points = e.target.value;
    d3.select("#area-chart").text("");
    load_CSV(data_file);
})

document.getElementById("column_fields-ac").addEventListener("change", e => {
    // document.getElementById("column_fields-ac").options.length = 0;
    Y_axis = e.target.value;
    d3.select("#area-chart").text("");
    load_CSV(data_file);
})

document.getElementById("uploader").addEventListener("change", (e) => {
    data_file = e.target.value.split('\\')[2];
    d3.select("#area-chart").text("");
    load_CSV(data_file)
})

if (data_file == "") {
    d3.select('#area-chart').append("span").attr("class", "No-Data").append("h1").text("Please Choose a File to preview the Data Report and the Data Visuals !");
} else {
    d3.select("table").remove();
    d3.select("#area-chart").text("");
    load_CSV(data_file);
}