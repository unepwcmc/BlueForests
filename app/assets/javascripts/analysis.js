//= require_tree ./analysis/js/lib
//= require ./analysis/js/application.js
//= require ./analysis/analysis.js.coffee
//= require pica

var roundToDecimals = function(number, places) {
  places = Math.pow(10, places);
  return Math.round(number * places) / places;
};
