import * as d3 from "d3"

const drawChart = (data) => {

  const margin = {top: 20, right: 100, bottom: 50, left: 40};
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const x = d3.scaleLinear().range([width, 0]);
  const y = d3.scaleLinear().range([0, height]);

  // time in seconds of the first
  const timeOfFirst = d3.min(data, (d) => d.Seconds);

  // Delay behind the first
  x.domain([0, d3.max(data, (d) => d.Seconds - timeOfFirst) + 5]);

  // Ranking: Scale the range of the data
  y.domain([1, d3.max(data, (d) => d.Place) + 1]);

  const svg = d3.select(".chart")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const div = d3.select("#app").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

  const xMap = (d) => x(d.Seconds - timeOfFirst);
  const yMap = (d) => y(d.Place);
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const dots = svg.selectAll(".dot")
                    .data(data)
                    .enter().append("g")
                      .attr("class", "dot")
                      .on("mouseenter", (d, i) => {
                        div.html(
                              "<strong>" + d.Name + ", " + d.Nationality + "</strong>" +
                              d.Year + "<br>" +
                              d.Place + ". " + d.Time +
                              (d.Doping ? "<br>" + d.Doping : '')
                            )
                           .transition()
                           .duration(50)
                           .style("opacity", .9);
                      })
                      .on("mouseleave", function(d) {
                        div.transition()
                           .duration(500)
                           .style("opacity", 0);
                      });

  dots.append("circle")
    .attr("r", 5)
    .attr("cx", xMap)
    .attr("cy", yMap)
    .style("fill", (d) => color(!d.Doping));

  dots.append("text")
    .attr("class", "dot-title")
    .attr("transform", d => "translate(" + (8 + xMap(d)) + " ," + (5 + yMap(d)) + ")")
    .style("text-anchor", "start")
    .text(d => d.Name);

  // Add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat((d) => {
        const m = Math.floor(d/60);
        const s = d%60;
        return (m < 9 ? '0' : '') + m + ":" + (s < 9 ? '0' : '') + s;
      }));


  // Add the y Axis
  svg.append("g")
       .call(d3.axisLeft(y));

  // text label for the x axis
  svg.append("text")
       .attr("class", "axis-title")
       .attr("transform",
            "translate(" + (width/2) + " ," +
                           (height + margin.top + 15) + ")")
       .style("text-anchor", "middle")
       .text("Time behind the fastest");

  // text label for the y axis
  svg.append("text")
       .attr("class", "axis-title")
       .attr("transform", "rotate(-90)")
       .attr("y", 10)
       .attr("x", -height/2)
       .attr("dy", "1em")
       .style("text-anchor", "middle")
       .text("Place");

 // draw legend
 const legend = svg.selectAll(".legend")
     .data(color.domain())
   .enter().append("g")
     .attr("class", "legend")
     .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

 // draw legend colored rectangles
 legend.append("rect")
     .attr("x", width + 28)
     .attr("y", height - 88)
     .attr("width", 18)
     .attr("height", 18)
     .style("fill", color);

 // draw legend text
 legend.append("text")
     .attr("x", width + 22)
     .attr("y", height - 79)
     .attr("dy", ".35em")
     .style("text-anchor", "end")
     .text(d => !d ? "Doping allegations" : "No doping allegations")
}

d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json', (err, data) => {
  if (err) return console.warn(err);
  drawChart(data);
});
