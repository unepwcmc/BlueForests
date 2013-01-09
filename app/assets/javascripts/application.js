// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require bootstrap
//= require leaflet
//= require leaflet.draw
//= require underscore
//= require backbone
//= require backbone_rails_sync
//= require backbone_datalink
//= require backbone/blue_carbon
//= require jquery.dataTables
//= require ajaxupload
//= require OpenLayers
//= require_tree .

// Check if polygon self intersects (using openLayers)
// http://gis.stackexchange.com/questions/23755/determine-if-a-polygon-intersects-itself-in-openlayers

function checkSelfIntersection(polygon) {
  if(polygon.CLASS_NAME=="OpenLayers.Geometry.Polygon") {
    // checking only outer ring
    var outer = polygon.components[0].components;
    var segments = [];
    for(var i=1;i<outer.length;i++) {
      var segment= new OpenLayers.Geometry.LineString([outer[i-1].clone(),outer  [i].clone()]);
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
