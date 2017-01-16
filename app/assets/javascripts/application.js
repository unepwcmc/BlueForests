//= require async
//= require jquery
//= require jquery_ujs
//= require h5bp
//= require bootstrap
//= require leaflet
//= require leaflet.draw
//= require Leaflet.Bing
//= require jQuery.XDomainRequest
//= require underscore.1.4.4
//= require backbone.1.0.0
//= require backbone_rails_sync
//= require backbone_datalink
//= require backbone/blue_carbon
//= require jquery.dataTables
//= require jquery.dataTables.dateSorter
//= require opentip-jquery
//= require data_tables_bootstrap
//= require ajaxupload
//= require OpenLayers
//= require_tree ./modules
//= require areas
//= require_tree ./analysis/lib
//= require_tree ./analysis/templates/
//= require_tree ./analysis/views/
//= require_tree ./analysis/routers/
//= require ./analysis/analysis.js.coffee
//= require home
//= require validations

var roundToDecimals = function(number, places) {
  if(typeof number === "undefined") {
    return 0;
  }

  return number.toFixed(places).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
};

// Check if polygon self intersects (using openLayers)
// http://gis.stackexchange.com/questions/23755/determine-if-a-polygon-intersects-itself-in-openlayers

function checkSelfIntersection(polygon) {
  if(polygon.CLASS_NAME=="OpenLayers.Geometry.Polygon") {
    // checking only outer ring
    var outer = polygon.components[0].components;
    var segments = [];
    for(var i=1;i<outer.length;i++) {
      var segment= new OpenLayers.Geometry.LineString([outer[i-1].clone(),outer[i].clone()]);
      segments.push(segment);
    }
    for(var j=0;j<segments.length;j++) {
      if(segmentIntersects(segments[j],segments)) {
        return true;
      }
    }
  }
  return false;
}

function segmentIntersects(segment,segments){
  for(var i=0;i<segments.length;i++) {
    if(!segments[i].equals(segment)) {
      if(segments[i].intersects(segment) && !startOrStopEquals(segments[i],segment)) {
        return true;
      }
    }
  }
  return false;
}

function startOrStopEquals(segment1,segment2){
  if(segment1.components[0].equals(segment2.components[0])) {
    return true;
  }
  if(segment1.components[0].equals(segment2.components[1])) {
    return true;
  }
  if(segment1.components[1].equals(segment2.components[0])) {
    return true;
  }
  if(segment1.components[1].equals(segment2.components[1])) {
    return true;
  }
  return false;
}
