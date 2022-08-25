import * as d3 from "https://cdn.skypack.dev/d3@7";

let toggle_sort = true;

const name_fields = numeric_columns => {

    const options = [];
    for (let i = 0; i < numeric_columns.length; i++) {
        d3.selectAll("#column_fields").append("option").text(numeric_columns[i]).attr("class", "csv-columns");
    }

    // Removing Duplicate Entries in Dropdown
    document.querySelectorAll(".csv-columns").forEach((option) => {
        if (options.includes(option.value)) {
            option.remove();
        } else {
            options.push(option.value);
        }
    })
}
// Convert the CSV into Tables
const tabulate = (data, table_columns, numeric_columns,extent_array) => {
    2
    const table = d3.select("#html-table").append("table").attr("id", "report-table");
    table.append("thead").append("tr");
    const header = table.select("tr").selectAll("th").data(table_columns).enter().append("th").text(d => d + "🛗");
    const tbody = table.append("tbody");
    const selectField = document.getElementById("column_fields").value;

    // Threshold Logics
    let h_input, l_input, h_filter, l_filter;
    h_input = document.getElementById("h_threshold");
    l_input = document.getElementById("l_threshold");
    h_filter = parseFloat(h_input.value);
    l_filter = parseFloat(l_input.value);

    // Count to check if there are no available entries
    let count = 0;
    const rows = tbody.selectAll("tr").data(data.filter(d => {
        if (d.cycles == 0 || d.instructions == 0) {
            return false;
        }

        let compare_value = d[selectField];
        if (h_filter >= 0 && l_filter >= 0) {
            if (compare_value >= l_filter && compare_value <= h_filter) {
                count++;
                return d;
            } else {
                return null;
            }
        }
        return d;
    })).enter().append("tr");

    // If there are no entries then report for the same
    if (h_filter >= 0 && l_filter >= 0 && count == 0) {
        d3.select("table").remove();
        d3.select("#html-table").text("No valid data available for given range");
    }

    const cells = rows.selectAll('td')
        .data(row => (
            table_columns.map(column => {
                return { column: column, value: row[column] };
            }
            )
        ))
        .enter()
        .append('td')
        .text(d => d.value).style("background-color", d => {
            if (numeric_columns.indexOf(d.column) != -1) {
                const max_col = extent_array[numeric_columns.indexOf(d.column)]
                return d3.scaleLinear().domain([max_col[0] / 100, 75 * max_col[1] / 100, 95 * max_col[1] / 100]).range(["green", "white", "red"])(parseFloat(d.value));
            }
        });

    header.on("click", (event, d) => {
        if (toggle_sort) {
            rows.sort(function (a, b) {
                if (a[d] < b[d]) {
                    return -1;
                } else if (a[d] > b[d]) {
                    return 1;
                } else {
                    return 0;
                }
            })
            toggle_sort = false;
        } else {
            rows.sort(function (a, b) {
                if (a[d] < b[d]) {
                    return 1;
                } else if (a[d] > b[d]) {
                    return -1;
                } else {
                    return 0;
                }
            })
            toggle_sort = true;
        }
    }
    )
}


const load_CSV = file => {
    d3.csv(`${file}.csv`).then(data => {
        let table_columns = data.columns;
        let numeric_columns = [];

        table_columns.forEach(cols => {
            if (isNaN(data[0][cols]) == false) {
                numeric_columns.push(cols)
            }
        });
        const extent_array = [];
        numeric_columns.forEach((i) => {
            const value_array = [];
            data.filter(d => {
                if (d['cycles'] == 0 || d['instructions'] == 0) {
                    return false;
                }
                if (!isNaN(d[i]) || isFinite(d[i])) {
                    value_array.push(d[i]);
                }
            })

            extent_array.push(d3.extent(value_array));
        });
        tabulate(data, table_columns,numeric_columns,extent_array);
        name_fields(numeric_columns);
    });

};
// Apply Button for Thresholds
document.getElementById("apply-btn").addEventListener("click", () => {
    d3.select("#report-table").remove();
    load_CSV(`data`);
})

// Reset the reports without filters
document.getElementById("reset-filter").addEventListener("click", () => {
    const h_input = document.getElementById("h_threshold");
    const l_input = document.getElementById("l_threshold");
    h_input.value = "";
    l_input.value = "";
    d3.select("table").remove();
    d3.select("#html-table").text("");
    load_CSV(`data`);
})
load_CSV(`data`);