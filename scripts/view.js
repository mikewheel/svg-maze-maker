/*
 * D3 code to handle the presentation of the maze in browser.
 * Written by Michael Wheeler.
 */

/**
 * Clears any elements contained within the SVG canvas.
 */
function clearCanvas() {
    d3.select("#canvas").selectAll("*").remove();
}

/**
 * Renders the graph's edges as rectangles to form a maze pattern across the grid.
 * @param graph
 */
function viewMazeSVG(graph) {
    d3.select("#canvas").selectAll(".edge")
        .data(graph.getAllEdges())
        .enter()
        .append("rect")
        .attr("class", "edge")
        .attr("width", edge => edge.getWidth())
        .attr("height", edge => edge.getHeight())
        .attr("x", edge => edge.getX())
        .attr("y", edge => edge.getY());
}

/**
 * Visualizes the excluded cells by adding one or more borders.
 * @param exclusions A 2D array of 1s and 0s for Coordinates (in inches) that should be excluded.
 */
function borderExclusionsSVG(exclusions) {
    for (let x = 0; x < exclusions.length; x++) {
        for (let y = 0; y < exclusions[x].length; y++) {
            if (!exclusions[x][y]) continue;

            let left = !(exclusions[x-1][y]);
            let right = !(exclusions[x+1][y]);
            let top = !(exclusions[x][y-1]);
            let bottom = !(exclusions[x][y+1]);

            let width = CELL_WIDTH_PIXELS * DENSITY;
            let upperLeft = (x * width).toString() + "," + (y * width).toString();
            let upperRight = ((x+1) * width).toString() + "," + (y * width).toString();
            let lowerLeft = (x * width).toString() + "," + ((y+1) * width).toString();
            let lowerRight = ((x+1) * width).toString() + "," + ((y+1) * width).toString();


            if (left) {
                d3.select("#canvas").append("polyline")
                    .attr("class", "excluded-polyline")
                    .attr("points", upperLeft + " " + lowerLeft)
            }

            if (right) {
                d3.select("#canvas").append("polyline")
                    .attr("class", "excluded-polyline")
                    .attr("points", upperRight + " " + lowerRight)
            }

            if (top) {
                d3.select("#canvas").append("polyline")
                    .attr("class", "excluded-polyline")
                    .attr("points", upperLeft + " " + upperRight)
            }

            if (bottom) {
                d3.select("#canvas").append("polyline")
                    .attr("class", "excluded-polyline")
                    .attr("points", lowerLeft + " " + lowerRight)
            }

        }
    }
}

/**
 * Visualizes the excluded cells by blacking them out.
 * @param exclusions A 2D array of 1s and 0s for Coordinates (in inches) that should be excluded.
 */
function blackOutExclusionsSVG(exclusions) {
    for (let x = 0; x < exclusions.length; x++) {
        for (let y = 0; y < exclusions[x].length; y++) {
            if (!(exclusions[x][y])) continue;
            let width = CELL_WIDTH_PIXELS * DENSITY;
            d3.select("#canvas").append("rect")
                .attr("class", "excluded-rect")
                .attr("width", width)
                .attr("height", width)
                .attr("x", x * width)
                .attr("y", y * width);
        }
    }
}