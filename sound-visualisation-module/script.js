//Modified from http://bl.ocks.org/mbostock/1157787

var margin = {top: 8, right: 10, bottom: 40, left: 10},
    width = 600 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

var parseDate = d3.time.format("%b %Y").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var area = d3.svg.area()
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.price); });

var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.price); });

d3.csv("stocks.csv", type, function(error, data) {

  // Nest data by symbol.
  var symbols = d3.nest()
      .key(function(d) { return d.symbol; })
      .entries(data);

  // Compute the maximum price per symbol, needed for the y-domain.
  symbols.forEach(function(s) {
    s.maxPrice = d3.max(s.values, function(d) { return d.price; });
  });

  // Compute the minimum and maximum date across symbols.
  // We assume values are sorted by date.
  x.domain([
    d3.min(symbols, function(s) { return s.values[0].date; }),
    d3.max(symbols, function(s) { return s.values[s.values.length - 1].date; })
  ]);

  // Add an SVG element for each symbol, with the desired dimensions and margin.
  var svg = d3.select("#charts").selectAll("svg")
      .data(symbols)
    .enter().append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add the area path elements. Note: the y-domain is set per element.
  svg.append("path")
      .attr("class", "area")
      .attr("d", function(d) { y.domain([0, d.maxPrice]); return area(d.values); });

  // Add the line path elements. Note: the y-domain is set per element.
  svg.append("path")
      .attr("class", "line")
      .attr("d", function(d) { y.domain([0, d.maxPrice]); return line(d.values); });

  // Add a small label for the symbol name.
  svg.append("text")
      .attr("x", width - 6)
      .attr("y", height - 6)
      .style("text-anchor", "end")
      .text(function(d) { return d.key; })
      .class("oog");
});

function type(d) {
  d.price = +d.price;
  d.date = parseDate(d.date);
  return d;
}
