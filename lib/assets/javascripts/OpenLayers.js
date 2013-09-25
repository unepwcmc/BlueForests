/*

  OpenLayers.js -- OpenLayers Map Viewer Library

  Copyright (c) 2006-2013 by OpenLayers Contributors
  Published under the 2-clause BSD license.
  See http://openlayers.org/dev/license.txt for the full text of the license, and http://openlayers.org/dev/authors.txt for full list of contributors.

  Includes compressed code under the following licenses:

  (For uncompressed versions of the code used, please see the
  OpenLayers Github repository: <https://github.com/openlayers/openlayers>)

*/

/**
 * Contains XMLHttpRequest.js <http://code.google.com/p/xmlhttprequest/>
 * Copyright 2007 Sergey Ilinsky (http://www.ilinsky.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * OpenLayers.Util.pagePosition is based on Yahoo's getXY method, which is
 * Copyright (c) 2006, Yahoo! Inc.
 * All rights reserved.
 * 
 * Redistribution and use of this software in source and binary forms, with or
 * without modification, are permitted provided that the following conditions
 * are met:
 * 
 * * Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 * 
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 * 
 * * Neither the name of Yahoo! Inc. nor the names of its contributors may be
 *   used to endorse or promote products derived from this software without
 *   specific prior written permission of Yahoo! Inc.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
 * POSSIBILITY OF SUCH DAMAGE.
 */
/* ======================================================================
    OpenLayers/SingleFile.js
   ====================================================================== */

/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

var OpenLayers = {
    /**
     * Constant: VERSION_NUMBER
     */
    VERSION_NUMBER: "Release 2.13.1",

    /**
     * Constant: singleFile
     * TODO: remove this in 3.0 when we stop supporting build profiles that
     * include OpenLayers.js
     */
    singleFile: true,

    /**
     * Method: _getScriptLocation
     * Return the path to this script. This is also implemented in
     * OpenLayers.js
     *
     * Returns:
     * {String} Path to this script
     */
    _getScriptLocation: (function() {
        var r = new RegExp("(^|(.*?\\/))(OpenLayers[^\\/]*?\\.js)(\\?|$)"),
            s = document.getElementsByTagName('script'),
            src, m, l = "";
        for(var i=0, len=s.length; i<len; i++) {
            src = s[i].getAttribute('src');
            if(src) {
                m = src.match(r);
                if(m) {
                    l = m[1];
                    break;
                }
            }
        }
        return (function() { return l; });
    })(),
    
    /**
     * Property: ImgPath
     * {String} Set this to the path where control images are stored, a path  
     * given here must end with a slash. If set to '' (which is the default) 
     * OpenLayers will use its script location + "img/".
     * 
     * You will need to set this property when you have a singlefile build of 
     * OpenLayers that either is not named "OpenLayers.js" or if you move
     * the file in a way such that the image directory cannot be derived from 
     * the script location.
     * 
     * If your custom OpenLayers build is named "my-custom-ol.js" and the images
     * of OpenLayers are in a folder "/resources/external/images/ol" a correct
     * way of including OpenLayers in your HTML would be:
     * 
     * (code)
     *   <script src="/path/to/my-custom-ol.js" type="text/javascript"></script>
     *   <script type="text/javascript">
     *      // tell OpenLayers where the control images are
     *      // remember the trailing slash
     *      OpenLayers.ImgPath = "/resources/external/images/ol/";
     *   </script>
     * (end code)
     * 
     * Please remember that when your OpenLayers script is not named 
     * "OpenLayers.js" you will have to make sure that the default theme is 
     * loaded into the page by including an appropriate <link>-tag, 
     * e.g.:
     * 
     * (code)
     *   <link rel="stylesheet" href="/path/to/default/style.css"  type="text/css">
     * (end code)
     */
    ImgPath : ''
};
/* ======================================================================
    OpenLayers/BaseTypes/Class.js
   ====================================================================== */

/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/SingleFile.js
 */

/**
 * Constructor: OpenLayers.Class
 * Base class used to construct all other classes. Includes support for 
 *     multiple inheritance. 
 *     
 * This constructor is new in OpenLayers 2.5.  At OpenLayers 3.0, the old 
 *     syntax for creating classes and dealing with inheritance 
 *     will be removed.
 * 
 * To create a new OpenLayers-style class, use the following syntax:
 * (code)
 *     var MyClass = OpenLayers.Class(prototype);
 * (end)
 *
 * To create a new OpenLayers-style class with multiple inheritance, use the
 *     following syntax:
 * (code)
 *     var MyClass = OpenLayers.Class(Class1, Class2, prototype);
 * (end)
 * 
 * Note that instanceof reflection will only reveal Class1 as superclass.
 *
 */
OpenLayers.Class = function() {
    var len = arguments.length;
    var P = arguments[0];
    var F = arguments[len-1];

    var C = typeof F.initialize == "function" ?
        F.initialize :
        function(){ P.prototype.initialize.apply(this, arguments); };

    if (len > 1) {
        var newArgs = [C, P].concat(
                Array.prototype.slice.call(arguments).slice(1, len-1), F);
        OpenLayers.inherit.apply(null, newArgs);
    } else {
        C.prototype = F;
    }
    return C;
};

/**
 * Function: OpenLayers.inherit
 *
 * Parameters:
 * C - {Object} the class that inherits
 * P - {Object} the superclass to inherit from
 *
 * In addition to the mandatory C and P parameters, an arbitrary number of
 * objects can be passed, which will extend C.
 */
OpenLayers.inherit = function(C, P) {
   var F = function() {};
   F.prototype = P.prototype;
   C.prototype = new F;
   var i, l, o;
   for(i=2, l=arguments.length; i<l; i++) {
       o = arguments[i];
       if(typeof o === "function") {
           o = o.prototype;
       }
       OpenLayers.Util.extend(C.prototype, o);
   }
};

/**
 * APIFunction: extend
 * Copy all properties of a source object to a destination object.  Modifies
 *     the passed in destination object.  Any properties on the source object
 *     that are set to undefined will not be (re)set on the destination object.
 *
 * Parameters:
 * destination - {Object} The object that will be modified
 * source - {Object} The object with properties to be set on the destination
 *
 * Returns:
 * {Object} The destination object.
 */
OpenLayers.Util = OpenLayers.Util || {};
OpenLayers.Util.extend = function(destination, source) {
    destination = destination || {};
    if (source) {
        for (var property in source) {
            var value = source[property];
            if (value !== undefined) {
                destination[property] = value;
            }
        }

        /**
         * IE doesn't include the toString property when iterating over an object's
         * properties with the for(property in object) syntax.  Explicitly check if
         * the source has its own toString property.
         */

        /*
         * FF/Windows < 2.0.0.13 reports "Illegal operation on WrappedNative
         * prototype object" when calling hawOwnProperty if the source object
         * is an instance of window.Event.
         */

        var sourceIsEvt = typeof window.Event == "function"
                          && source instanceof window.Event;

        if (!sourceIsEvt
           && source.hasOwnProperty && source.hasOwnProperty("toString")) {
            destination.toString = source.toString;
        }
    }
    return destination;
};
/* ======================================================================
    OpenLayers/Geometry.js
   ====================================================================== */

/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */
 
/**
 * @requires OpenLayers/BaseTypes/Class.js
 */

/**
 * Class: OpenLayers.Geometry
 * A Geometry is a description of a geographic object.  Create an instance of
 * this class with the <OpenLayers.Geometry> constructor.  This is a base class,
 * typical geometry types are described by subclasses of this class.
 *
 * Note that if you use the <OpenLayers.Geometry.fromWKT> method, you must
 * explicitly include the OpenLayers.Format.WKT in your build.
 */
OpenLayers.Geometry = OpenLayers.Class({

    /**
     * Property: id
     * {String} A unique identifier for this geometry.
     */
    id: null,

    /**
     * Property: parent
     * {<OpenLayers.Geometry>}This is set when a Geometry is added as component
     * of another geometry
     */
    parent: null,

    /**
     * Property: bounds 
     * {<OpenLayers.Bounds>} The bounds of this geometry
     */
    bounds: null,

    /**
     * Constructor: OpenLayers.Geometry
     * Creates a geometry object.  
     */
    initialize: function() {
        this.id = OpenLayers.Util.createUniqueID(this.CLASS_NAME+ "_");
    },
    
    /**
     * Method: destroy
     * Destroy this geometry.
     */
    destroy: function() {
        this.id = null;
        this.bounds = null;
    },
    
    /**
     * APIMethod: clone
     * Create a clone of this geometry.  Does not set any non-standard
     *     properties of the cloned geometry.
     * 
     * Returns:
     * {<OpenLayers.Geometry>} An exact clone of this geometry.
     */
    clone: function() {
        return new OpenLayers.Geometry();
    },
    
    /**
     * Method: setBounds
     * Set the bounds for this Geometry.
     * 
     * Parameters:
     * bounds - {<OpenLayers.Bounds>} 
     */
    setBounds: function(bounds) {
        if (bounds) {
            this.bounds = bounds.clone();
        }
    },
    
    /**
     * Method: clearBounds
     * Nullify this components bounds and that of its parent as well.
     */
    clearBounds: function() {
        this.bounds = null;
        if (this.parent) {
            this.parent.clearBounds();
        }    
    },
    
    /**
     * Method: extendBounds
     * Extend the existing bounds to include the new bounds. 
     * If geometry's bounds is not yet set, then set a new Bounds.
     * 
     * Parameters:
     * newBounds - {<OpenLayers.Bounds>} 
     */
    extendBounds: function(newBounds){
        var bounds = this.getBounds();
        if (!bounds) {
            this.setBounds(newBounds);
        } else {
            this.bounds.extend(newBounds);
        }
    },
    
    /**
     * APIMethod: getBounds
     * Get the bounds for this Geometry. If bounds is not set, it 
     * is calculated again, this makes queries faster.
     * 
     * Returns:
     * {<OpenLayers.Bounds>}
     */
    getBounds: function() {
        if (this.bounds == null) {
            this.calculateBounds();
        }
        return this.bounds;
    },
    
    /** 
     * APIMethod: calculateBounds
     * Recalculate the bounds for the geometry. 
     */
    calculateBounds: function() {
        //
        // This should be overridden by subclasses.
        //
    },
    
    /**
     * APIMethod: distanceTo
     * Calculate the closest distance between two geometries (on the x-y plane).
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>} The target geometry.
     * options - {Object} Optional properties for configuring the distance
     *     calculation.
     *
     * Valid options depend on the specific geometry type.
     * 
     * Returns:
     * {Number | Object} The distance between this geometry and the target.
     *     If details is true, the return will be an object with distance,
     *     x0, y0, x1, and x2 properties.  The x0 and y0 properties represent
     *     the coordinates of the closest point on this geometry. The x1 and y1
     *     properties represent the coordinates of the closest point on the
     *     target geometry.
     */
    distanceTo: function(geometry, options) {
    },
    
    /**
     * APIMethod: getVertices
     * Return a list of all points in this geometry.
     *
     * Parameters:
     * nodes - {Boolean} For lines, only return vertices that are
     *     endpoints.  If false, for lines, only vertices that are not
     *     endpoints will be returned.  If not provided, all vertices will
     *     be returned.
     *
     * Returns:
     * {Array} A list of all vertices in the geometry.
     */
    getVertices: function(nodes) {
    },

    /**
     * Method: atPoint
     * Note - This is only an approximation based on the bounds of the 
     * geometry.
     * 
     * Parameters:
     * lonlat - {<OpenLayers.LonLat>|Object} OpenLayers.LonLat or an
     *     object with a 'lon' and 'lat' properties.
     * toleranceLon - {float} Optional tolerance in Geometric Coords
     * toleranceLat - {float} Optional tolerance in Geographic Coords
     * 
     * Returns:
     * {Boolean} Whether or not the geometry is at the specified location
     */
    atPoint: function(lonlat, toleranceLon, toleranceLat) {
        var atPoint = false;
        var bounds = this.getBounds();
        if ((bounds != null) && (lonlat != null)) {

            var dX = (toleranceLon != null) ? toleranceLon : 0;
            var dY = (toleranceLat != null) ? toleranceLat : 0;
    
            var toleranceBounds = 
                new OpenLayers.Bounds(this.bounds.left - dX,
                                      this.bounds.bottom - dY,
                                      this.bounds.right + dX,
                                      this.bounds.top + dY);

            atPoint = toleranceBounds.containsLonLat(lonlat);
        }
        return atPoint;
    },
    
    /**
     * Method: getLength
     * Calculate the length of this geometry. This method is defined in
     * subclasses.
     * 
     * Returns:
     * {Float} The length of the collection by summing its parts
     */
    getLength: function() {
        //to be overridden by geometries that actually have a length
        //
        return 0.0;
    },

    /**
     * Method: getArea
     * Calculate the area of this geometry. This method is defined in subclasses.
     * 
     * Returns:
     * {Float} The area of the collection by summing its parts
     */
    getArea: function() {
        //to be overridden by geometries that actually have an area
        //
        return 0.0;
    },
    
    /**
     * APIMethod: getCentroid
     * Calculate the centroid of this geometry. This method is defined in subclasses.
     *
     * Returns:
     * {<OpenLayers.Geometry.Point>} The centroid of the collection
     */
    getCentroid: function() {
        return null;
    },

    /**
     * Method: toString
     * Returns a text representation of the geometry.  If the WKT format is
     *     included in a build, this will be the Well-Known Text 
     *     representation.
     *
     * Returns:
     * {String} String representation of this geometry.
     */
    toString: function() {
        var string;
        if (OpenLayers.Format && OpenLayers.Format.WKT) {
            string = OpenLayers.Format.WKT.prototype.write(
                new OpenLayers.Feature.Vector(this)
            );
        } else {
            string = Object.prototype.toString.call(this);
        }
        return string;
    },

    CLASS_NAME: "OpenLayers.Geometry"
});

/**
 * Function: OpenLayers.Geometry.fromWKT
 * Generate a geometry given a Well-Known Text string.  For this method to
 *     work, you must include the OpenLayers.Format.WKT in your build 
 *     explicitly.
 *
 * Parameters:
 * wkt - {String} A string representing the geometry in Well-Known Text.
 *
 * Returns:
 * {<OpenLayers.Geometry>} A geometry of the appropriate class.
 */
OpenLayers.Geometry.fromWKT = function(wkt) {
    var geom;
    if (OpenLayers.Format && OpenLayers.Format.WKT) {
        var format = OpenLayers.Geometry.fromWKT.format;
        if (!format) {
            format = new OpenLayers.Format.WKT();
            OpenLayers.Geometry.fromWKT.format = format;
        }
        var result = format.read(wkt);
        if (result instanceof OpenLayers.Feature.Vector) {
            geom = result.geometry;
        } else if (OpenLayers.Util.isArray(result)) {
            var len = result.length;
            var components = new Array(len);
            for (var i=0; i<len; ++i) {
                components[i] = result[i].geometry;
            }
            geom = new OpenLayers.Geometry.Collection(components);
        }
    }
    return geom;
};
    
/**
 * Method: OpenLayers.Geometry.segmentsIntersect
 * Determine whether two line segments intersect.  Optionally calculates
 *     and returns the intersection point.  This function is optimized for
 *     cases where seg1.x2 >= seg2.x1 || seg2.x2 >= seg1.x1.  In those
 *     obvious cases where there is no intersection, the function should
 *     not be called.
 *
 * Parameters:
 * seg1 - {Object} Object representing a segment with properties x1, y1, x2,
 *     and y2.  The start point is represented by x1 and y1.  The end point
 *     is represented by x2 and y2.  Start and end are ordered so that x1 < x2.
 * seg2 - {Object} Object representing a segment with properties x1, y1, x2,
 *     and y2.  The start point is represented by x1 and y1.  The end point
 *     is represented by x2 and y2.  Start and end are ordered so that x1 < x2.
 * options - {Object} Optional properties for calculating the intersection.
 *
 * Valid options:
 * point - {Boolean} Return the intersection point.  If false, the actual
 *     intersection point will not be calculated.  If true and the segments
 *     intersect, the intersection point will be returned.  If true and
 *     the segments do not intersect, false will be returned.  If true and
 *     the segments are coincident, true will be returned.
 * tolerance - {Number} If a non-null value is provided, if the segments are
 *     within the tolerance distance, this will be considered an intersection.
 *     In addition, if the point option is true and the calculated intersection
 *     is within the tolerance distance of an end point, the endpoint will be
 *     returned instead of the calculated intersection.  Further, if the
 *     intersection is within the tolerance of endpoints on both segments, or
 *     if two segment endpoints are within the tolerance distance of eachother
 *     (but no intersection is otherwise calculated), an endpoint on the
 *     first segment provided will be returned.
 *
 * Returns:
 * {Boolean | <OpenLayers.Geometry.Point>}  The two segments intersect.
 *     If the point argument is true, the return will be the intersection
 *     point or false if none exists.  If point is true and the segments
 *     are coincident, return will be true (and the instersection is equal
 *     to the shorter segment).
 */
OpenLayers.Geometry.segmentsIntersect = function(seg1, seg2, options) {
    var point = options && options.point;
    var tolerance = options && options.tolerance;
    var intersection = false;
    var x11_21 = seg1.x1 - seg2.x1;
    var y11_21 = seg1.y1 - seg2.y1;
    var x12_11 = seg1.x2 - seg1.x1;
    var y12_11 = seg1.y2 - seg1.y1;
    var y22_21 = seg2.y2 - seg2.y1;
    var x22_21 = seg2.x2 - seg2.x1;
    var d = (y22_21 * x12_11) - (x22_21 * y12_11);
    var n1 = (x22_21 * y11_21) - (y22_21 * x11_21);
    var n2 = (x12_11 * y11_21) - (y12_11 * x11_21);
    if(d == 0) {
        // parallel
        if(n1 == 0 && n2 == 0) {
            // coincident
            intersection = true;
        }
    } else {
        var along1 = n1 / d;
        var along2 = n2 / d;
        if(along1 >= 0 && along1 <= 1 && along2 >=0 && along2 <= 1) {
            // intersect
            if(!point) {
                intersection = true;
            } else {
                // calculate the intersection point
                var x = seg1.x1 + (along1 * x12_11);
                var y = seg1.y1 + (along1 * y12_11);
                intersection = new OpenLayers.Geometry.Point(x, y);
            }
        }
    }
    if(tolerance) {
        var dist;
        if(intersection) {
            if(point) {
                var segs = [seg1, seg2];
                var seg, x, y;
                // check segment endpoints for proximity to intersection
                // set intersection to first endpoint within the tolerance
                outer: for(var i=0; i<2; ++i) {
                    seg = segs[i];
                    for(var j=1; j<3; ++j) {
                        x = seg["x" + j];
                        y = seg["y" + j];
                        dist = Math.sqrt(
                            Math.pow(x - intersection.x, 2) +
                            Math.pow(y - intersection.y, 2)
                        );
                        if(dist < tolerance) {
                            intersection.x = x;
                            intersection.y = y;
                            break outer;
                        }
                    }
                }
                
            }
        } else {
            // no calculated intersection, but segments could be within
            // the tolerance of one another
            var segs = [seg1, seg2];
            var source, target, x, y, p, result;
            // check segment endpoints for proximity to intersection
            // set intersection to first endpoint within the tolerance
            outer: for(var i=0; i<2; ++i) {
                source = segs[i];
                target = segs[(i+1)%2];
                for(var j=1; j<3; ++j) {
                    p = {x: source["x"+j], y: source["y"+j]};
                    result = OpenLayers.Geometry.distanceToSegment(p, target);
                    if(result.distance < tolerance) {
                        if(point) {
                            intersection = new OpenLayers.Geometry.Point(p.x, p.y);
                        } else {
                            intersection = true;
                        }
                        break outer;
                    }
                }
            }
        }
    }
    return intersection;
};

/**
 * Function: OpenLayers.Geometry.distanceToSegment
 *
 * Parameters:
 * point - {Object} An object with x and y properties representing the
 *     point coordinates.
 * segment - {Object} An object with x1, y1, x2, and y2 properties
 *     representing endpoint coordinates.
 *
 * Returns:
 * {Object} An object with distance, along, x, and y properties.  The distance
 *     will be the shortest distance between the input point and segment.
 *     The x and y properties represent the coordinates along the segment
 *     where the shortest distance meets the segment. The along attribute
 *     describes how far between the two segment points the given point is.
 */
OpenLayers.Geometry.distanceToSegment = function(point, segment) {
    var result = OpenLayers.Geometry.distanceSquaredToSegment(point, segment);
    result.distance = Math.sqrt(result.distance);
    return result;
};

/**
 * Function: OpenLayers.Geometry.distanceSquaredToSegment
 *
 * Usually the distanceToSegment function should be used. This variant however
 * can be used for comparisons where the exact distance is not important.
 *
 * Parameters:
 * point - {Object} An object with x and y properties representing the
 *     point coordinates.
 * segment - {Object} An object with x1, y1, x2, and y2 properties
 *     representing endpoint coordinates.
 *
 * Returns:
 * {Object} An object with squared distance, along, x, and y properties.
 *     The distance will be the shortest distance between the input point and
 *     segment. The x and y properties represent the coordinates along the
 *     segment where the shortest distance meets the segment. The along
 *     attribute describes how far between the two segment points the given
 *     point is.
 */
OpenLayers.Geometry.distanceSquaredToSegment = function(point, segment) {
    var x0 = point.x;
    var y0 = point.y;
    var x1 = segment.x1;
    var y1 = segment.y1;
    var x2 = segment.x2;
    var y2 = segment.y2;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var along = ((dx * (x0 - x1)) + (dy * (y0 - y1))) /
                (Math.pow(dx, 2) + Math.pow(dy, 2));
    var x, y;
    if(along <= 0.0) {
        x = x1;
        y = y1;
    } else if(along >= 1.0) {
        x = x2;
        y = y2;
    } else {
        x = x1 + along * dx;
        y = y1 + along * dy;
    }
    return {
        distance: Math.pow(x - x0, 2) + Math.pow(y - y0, 2),
        x: x, y: y,
        along: along
    };
};
/* ======================================================================
    OpenLayers/Geometry/Collection.js
   ====================================================================== */

/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Geometry.js
 */

/**
 * Class: OpenLayers.Geometry.Collection
 * A Collection is exactly what it sounds like: A collection of different 
 * Geometries. These are stored in the local parameter <components> (which
 * can be passed as a parameter to the constructor). 
 * 
 * As new geometries are added to the collection, they are NOT cloned. 
 * When removing geometries, they need to be specified by reference (ie you 
 * have to pass in the *exact* geometry to be removed).
 * 
 * The <getArea> and <getLength> functions here merely iterate through
 * the components, summing their respective areas and lengths.
 *
 * Create a new instance with the <OpenLayers.Geometry.Collection> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Geometry> 
 */
OpenLayers.Geometry.Collection = OpenLayers.Class(OpenLayers.Geometry, {

    /**
     * APIProperty: components
     * {Array(<OpenLayers.Geometry>)} The component parts of this geometry
     */
    components: null,
    
    /**
     * Property: componentTypes
     * {Array(String)} An array of class names representing the types of
     * components that the collection can include.  A null value means the
     * component types are not restricted.
     */
    componentTypes: null,

    /**
     * Constructor: OpenLayers.Geometry.Collection
     * Creates a Geometry Collection -- a list of geoms.
     *
     * Parameters: 
     * components - {Array(<OpenLayers.Geometry>)} Optional array of geometries
     *
     */
    initialize: function (components) {
        OpenLayers.Geometry.prototype.initialize.apply(this, arguments);
        this.components = [];
        if (components != null) {
            this.addComponents(components);
        }
    },

    /**
     * APIMethod: destroy
     * Destroy this geometry.
     */
    destroy: function () {
        this.components.length = 0;
        this.components = null;
        OpenLayers.Geometry.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: clone
     * Clone this geometry.
     *
     * Returns:
     * {<OpenLayers.Geometry.Collection>} An exact clone of this collection
     */
    clone: function() {
        var geometry = eval("new " + this.CLASS_NAME + "()");
        for(var i=0, len=this.components.length; i<len; i++) {
            geometry.addComponent(this.components[i].clone());
        }
        
        // catch any randomly tagged-on properties
        OpenLayers.Util.applyDefaults(geometry, this);
        
        return geometry;
    },

    /**
     * Method: getComponentsString
     * Get a string representing the components for this collection
     * 
     * Returns:
     * {String} A string representation of the components of this geometry
     */
    getComponentsString: function(){
        var strings = [];
        for(var i=0, len=this.components.length; i<len; i++) {
            strings.push(this.components[i].toShortString()); 
        }
        return strings.join(",");
    },

    /**
     * APIMethod: calculateBounds
     * Recalculate the bounds by iterating through the components and 
     * calling calling extendBounds() on each item.
     */
    calculateBounds: function() {
        this.bounds = null;
        var bounds = new OpenLayers.Bounds();
        var components = this.components;
        if (components) {
            for (var i=0, len=components.length; i<len; i++) {
                bounds.extend(components[i].getBounds());
            }
        }
        // to preserve old behavior, we only set bounds if non-null
        // in the future, we could add bounds.isEmpty()
        if (bounds.left != null && bounds.bottom != null && 
            bounds.right != null && bounds.top != null) {
            this.setBounds(bounds);
        }
    },

    /**
     * APIMethod: addComponents
     * Add components to this geometry.
     *
     * Parameters:
     * components - {Array(<OpenLayers.Geometry>)} An array of geometries to add
     */
    addComponents: function(components){
        if(!(OpenLayers.Util.isArray(components))) {
            components = [components];
        }
        for(var i=0, len=components.length; i<len; i++) {
            this.addComponent(components[i]);
        }
    },

    /**
     * Method: addComponent
     * Add a new component (geometry) to the collection.  If this.componentTypes
     * is set, then the component class name must be in the componentTypes array.
     *
     * The bounds cache is reset.
     * 
     * Parameters:
     * component - {<OpenLayers.Geometry>} A geometry to add
     * index - {int} Optional index into the array to insert the component
     *
     * Returns:
     * {Boolean} The component geometry was successfully added
     */    
    addComponent: function(component, index) {
        var added = false;
        if(component) {
            if(this.componentTypes == null ||
               (OpenLayers.Util.indexOf(this.componentTypes,
                                        component.CLASS_NAME) > -1)) {

                if(index != null && (index < this.components.length)) {
                    var components1 = this.components.slice(0, index);
                    var components2 = this.components.slice(index, 
                                                           this.components.length);
                    components1.push(component);
                    this.components = components1.concat(components2);
                } else {
                    this.components.push(component);
                }
                component.parent = this;
                this.clearBounds();
                added = true;
            }
        }
        return added;
    },
    
    /**
     * APIMethod: removeComponents
     * Remove components from this geometry.
     *
     * Parameters:
     * components - {Array(<OpenLayers.Geometry>)} The components to be removed
     *
     * Returns: 
     * {Boolean} A component was removed.
     */
    removeComponents: function(components) {
        var removed = false;

        if(!(OpenLayers.Util.isArray(components))) {
            components = [components];
        }
        for(var i=components.length-1; i>=0; --i) {
            removed = this.removeComponent(components[i]) || removed;
        }
        return removed;
    },
    
    /**
     * Method: removeComponent
     * Remove a component from this geometry.
     *
     * Parameters:
     * component - {<OpenLayers.Geometry>} 
     *
     * Returns: 
     * {Boolean} The component was removed.
     */
    removeComponent: function(component) {
        
        OpenLayers.Util.removeItem(this.components, component);
        
        // clearBounds() so that it gets recalculated on the next call
        // to this.getBounds();
        this.clearBounds();
        return true;
    },

    /**
     * APIMethod: getLength
     * Calculate the length of this geometry
     *
     * Returns:
     * {Float} The length of the geometry
     */
    getLength: function() {
        var length = 0.0;
        for (var i=0, len=this.components.length; i<len; i++) {
            length += this.components[i].getLength();
        }
        return length;
    },
    
    /**
     * APIMethod: getArea
     * Calculate the area of this geometry. Note how this function is overridden
     * in <OpenLayers.Geometry.Polygon>.
     *
     * Returns:
     * {Float} The area of the collection by summing its parts
     */
    getArea: function() {
        var area = 0.0;
        for (var i=0, len=this.components.length; i<len; i++) {
            area += this.components[i].getArea();
        }
        return area;
    },

    /** 
     * APIMethod: getGeodesicArea
     * Calculate the approximate area of the polygon were it projected onto
     *     the earth.
     *
     * Parameters:
     * projection - {<OpenLayers.Projection>} The spatial reference system
     *     for the geometry coordinates.  If not provided, Geographic/WGS84 is
     *     assumed.
     * 
     * Reference:
     * Robert. G. Chamberlain and William H. Duquette, "Some Algorithms for
     *     Polygons on a Sphere", JPL Publication 07-03, Jet Propulsion
     *     Laboratory, Pasadena, CA, June 2007 http://trs-new.jpl.nasa.gov/dspace/handle/2014/40409
     *
     * Returns:
     * {float} The approximate geodesic area of the geometry in square meters.
     */
    getGeodesicArea: function(projection) {
        var area = 0.0;
        for(var i=0, len=this.components.length; i<len; i++) {
            area += this.components[i].getGeodesicArea(projection);
        }
        return area;
    },
    
    /**
     * APIMethod: getCentroid
     *
     * Compute the centroid for this geometry collection.
     *
     * Parameters:
     * weighted - {Boolean} Perform the getCentroid computation recursively,
     * returning an area weighted average of all geometries in this collection.
     *
     * Returns:
     * {<OpenLayers.Geometry.Point>} The centroid of the collection
     */
    getCentroid: function(weighted) {
        if (!weighted) {
            return this.components.length && this.components[0].getCentroid();
        }
        var len = this.components.length;
        if (!len) {
            return false;
        }
        
        var areas = [];
        var centroids = [];
        var areaSum = 0;
        var minArea = Number.MAX_VALUE;
        var component;
        for (var i=0; i<len; ++i) {
            component = this.components[i];
            var area = component.getArea();
            var centroid = component.getCentroid(true);
            if (isNaN(area) || isNaN(centroid.x) || isNaN(centroid.y)) {
                continue;
            }
            areas.push(area);
            areaSum += area;
            minArea = (area < minArea && area > 0) ? area : minArea;
            centroids.push(centroid);
        }
        len = areas.length;
        if (areaSum === 0) {
            // all the components in this collection have 0 area
            // probably a collection of points -- weight all the points the same
            for (var i=0; i<len; ++i) {
                areas[i] = 1;
            }
            areaSum = areas.length;
        } else {
            // normalize all the areas where the smallest area will get
            // a value of 1
            for (var i=0; i<len; ++i) {
                areas[i] /= minArea;
            }
            areaSum /= minArea;
        }
        
        var xSum = 0, ySum = 0, centroid, area;
        for (var i=0; i<len; ++i) {
            centroid = centroids[i];
            area = areas[i];
            xSum += centroid.x * area;
            ySum += centroid.y * area;
        }
        
        return new OpenLayers.Geometry.Point(xSum/areaSum, ySum/areaSum);
    },

    /**
     * APIMethod: getGeodesicLength
     * Calculate the approximate length of the geometry were it projected onto
     *     the earth.
     *
     * projection - {<OpenLayers.Projection>} The spatial reference system
     *     for the geometry coordinates.  If not provided, Geographic/WGS84 is
     *     assumed.
     * 
     * Returns:
     * {Float} The appoximate geodesic length of the geometry in meters.
     */
    getGeodesicLength: function(projection) {
        var length = 0.0;
        for(var i=0, len=this.components.length; i<len; i++) {
            length += this.components[i].getGeodesicLength(projection);
        }
        return length;
    },

    /**
     * APIMethod: move
     * Moves a geometry by the given displacement along positive x and y axes.
     *     This modifies the position of the geometry and clears the cached
     *     bounds.
     *
     * Parameters:
     * x - {Float} Distance to move geometry in positive x direction. 
     * y - {Float} Distance to move geometry in positive y direction.
     */
    move: function(x, y) {
        for(var i=0, len=this.components.length; i<len; i++) {
            this.components[i].move(x, y);
        }
    },

    /**
     * APIMethod: rotate
     * Rotate a geometry around some origin
     *
     * Parameters:
     * angle - {Float} Rotation angle in degrees (measured counterclockwise
     *                 from the positive x-axis)
     * origin - {<OpenLayers.Geometry.Point>} Center point for the rotation
     */
    rotate: function(angle, origin) {
        for(var i=0, len=this.components.length; i<len; ++i) {
            this.components[i].rotate(angle, origin);
        }
    },

    /**
     * APIMethod: resize
     * Resize a geometry relative to some origin.  Use this method to apply
     *     a uniform scaling to a geometry.
     *
     * Parameters:
     * scale - {Float} Factor by which to scale the geometry.  A scale of 2
     *                 doubles the size of the geometry in each dimension
     *                 (lines, for example, will be twice as long, and polygons
     *                 will have four times the area).
     * origin - {<OpenLayers.Geometry.Point>} Point of origin for resizing
     * ratio - {Float} Optional x:y ratio for resizing.  Default ratio is 1.
     * 
     * Returns:
     * {<OpenLayers.Geometry>} - The current geometry. 
     */
    resize: function(scale, origin, ratio) {
        for(var i=0; i<this.components.length; ++i) {
            this.components[i].resize(scale, origin, ratio);
        }
        return this;
    },

    /**
     * APIMethod: distanceTo
     * Calculate the closest distance between two geometries (on the x-y plane).
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>} The target geometry.
     * options - {Object} Optional properties for configuring the distance
     *     calculation.
     *
     * Valid options:
     * details - {Boolean} Return details from the distance calculation.
     *     Default is false.
     * edge - {Boolean} Calculate the distance from this geometry to the
     *     nearest edge of the target geometry.  Default is true.  If true,
     *     calling distanceTo from a geometry that is wholly contained within
     *     the target will result in a non-zero distance.  If false, whenever
     *     geometries intersect, calling distanceTo will return 0.  If false,
     *     details cannot be returned.
     *
     * Returns:
     * {Number | Object} The distance between this geometry and the target.
     *     If details is true, the return will be an object with distance,
     *     x0, y0, x1, and y1 properties.  The x0 and y0 properties represent
     *     the coordinates of the closest point on this geometry. The x1 and y1
     *     properties represent the coordinates of the closest point on the
     *     target geometry.
     */
    distanceTo: function(geometry, options) {
        var edge = !(options && options.edge === false);
        var details = edge && options && options.details;
        var result, best, distance;
        var min = Number.POSITIVE_INFINITY;
        for(var i=0, len=this.components.length; i<len; ++i) {
            result = this.components[i].distanceTo(geometry, options);
            distance = details ? result.distance : result;
            if(distance < min) {
                min = distance;
                best = result;
                if(min == 0) {
                    break;
                }
            }
        }
        return best;
    },

    /** 
     * APIMethod: equals
     * Determine whether another geometry is equivalent to this one.  Geometries
     *     are considered equivalent if all components have the same coordinates.
     * 
     * Parameters:
     * geometry - {<OpenLayers.Geometry>} The geometry to test. 
     *
     * Returns:
     * {Boolean} The supplied geometry is equivalent to this geometry.
     */
    equals: function(geometry) {
        var equivalent = true;
        if(!geometry || !geometry.CLASS_NAME ||
           (this.CLASS_NAME != geometry.CLASS_NAME)) {
            equivalent = false;
        } else if(!(OpenLayers.Util.isArray(geometry.components)) ||
                  (geometry.components.length != this.components.length)) {
            equivalent = false;
        } else {
            for(var i=0, len=this.components.length; i<len; ++i) {
                if(!this.components[i].equals(geometry.components[i])) {
                    equivalent = false;
                    break;
                }
            }
        }
        return equivalent;
    },

    /**
     * APIMethod: transform
     * Reproject the components geometry from source to dest.
     * 
     * Parameters:
     * source - {<OpenLayers.Projection>} 
     * dest - {<OpenLayers.Projection>}
     * 
     * Returns:
     * {<OpenLayers.Geometry>} 
     */
    transform: function(source, dest) {
        if (source && dest) {
            for (var i=0, len=this.components.length; i<len; i++) {  
                var component = this.components[i];
                component.transform(source, dest);
            }
            this.bounds = null;
        }
        return this;
    },

    /**
     * APIMethod: intersects
     * Determine if the input geometry intersects this one.
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>} Any type of geometry.
     *
     * Returns:
     * {Boolean} The input geometry intersects this one.
     */
    intersects: function(geometry) {
        var intersect = false;
        for(var i=0, len=this.components.length; i<len; ++ i) {
            intersect = geometry.intersects(this.components[i]);
            if(intersect) {
                break;
            }
        }
        return intersect;
    },

    /**
     * APIMethod: getVertices
     * Return a list of all points in this geometry.
     *
     * Parameters:
     * nodes - {Boolean} For lines, only return vertices that are
     *     endpoints.  If false, for lines, only vertices that are not
     *     endpoints will be returned.  If not provided, all vertices will
     *     be returned.
     *
     * Returns:
     * {Array} A list of all vertices in the geometry.
     */
    getVertices: function(nodes) {
        var vertices = [];
        for(var i=0, len=this.components.length; i<len; ++i) {
            Array.prototype.push.apply(
                vertices, this.components[i].getVertices(nodes)
            );
        }
        return vertices;
    },


    CLASS_NAME: "OpenLayers.Geometry.Collection"
});
/* ======================================================================
    OpenLayers/Geometry/Point.js
   ====================================================================== */

/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Geometry.js
 */

/**
 * Class: OpenLayers.Geometry.Point
 * Point geometry class. 
 * 
 * Inherits from:
 *  - <OpenLayers.Geometry> 
 */
OpenLayers.Geometry.Point = OpenLayers.Class(OpenLayers.Geometry, {

    /** 
     * APIProperty: x 
     * {float} 
     */
    x: null,

    /** 
     * APIProperty: y 
     * {float} 
     */
    y: null,

    /**
     * Constructor: OpenLayers.Geometry.Point
     * Construct a point geometry.
     *
     * Parameters:
     * x - {float} 
     * y - {float}
     * 
     */
    initialize: function(x, y) {
        OpenLayers.Geometry.prototype.initialize.apply(this, arguments);
        
        this.x = parseFloat(x);
        this.y = parseFloat(y);
    },

    /**
     * APIMethod: clone
     * 
     * Returns:
     * {<OpenLayers.Geometry.Point>} An exact clone of this OpenLayers.Geometry.Point
     */
    clone: function(obj) {
        if (obj == null) {
            obj = new OpenLayers.Geometry.Point(this.x, this.y);
        }

        // catch any randomly tagged-on properties
        OpenLayers.Util.applyDefaults(obj, this);

        return obj;
    },

    /** 
     * Method: calculateBounds
     * Create a new Bounds based on the lon/lat
     */
    calculateBounds: function () {
        this.bounds = new OpenLayers.Bounds(this.x, this.y,
                                            this.x, this.y);
    },

    /**
     * APIMethod: distanceTo
     * Calculate the closest distance between two geometries (on the x-y plane).
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>} The target geometry.
     * options - {Object} Optional properties for configuring the distance
     *     calculation.
     *
     * Valid options:
     * details - {Boolean} Return details from the distance calculation.
     *     Default is false.
     * edge - {Boolean} Calculate the distance from this geometry to the
     *     nearest edge of the target geometry.  Default is true.  If true,
     *     calling distanceTo from a geometry that is wholly contained within
     *     the target will result in a non-zero distance.  If false, whenever
     *     geometries intersect, calling distanceTo will return 0.  If false,
     *     details cannot be returned.
     *
     * Returns:
     * {Number | Object} The distance between this geometry and the target.
     *     If details is true, the return will be an object with distance,
     *     x0, y0, x1, and x2 properties.  The x0 and y0 properties represent
     *     the coordinates of the closest point on this geometry. The x1 and y1
     *     properties represent the coordinates of the closest point on the
     *     target geometry.
     */
    distanceTo: function(geometry, options) {
        var edge = !(options && options.edge === false);
        var details = edge && options && options.details;
        var distance, x0, y0, x1, y1, result;
        if(geometry instanceof OpenLayers.Geometry.Point) {
            x0 = this.x;
            y0 = this.y;
            x1 = geometry.x;
            y1 = geometry.y;
            distance = Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
            result = !details ?
                distance : {x0: x0, y0: y0, x1: x1, y1: y1, distance: distance};
        } else {
            result = geometry.distanceTo(this, options);
            if(details) {
                // switch coord order since this geom is target
                result = {
                    x0: result.x1, y0: result.y1,
                    x1: result.x0, y1: result.y0,
                    distance: result.distance
                };
            }
        }
        return result;
    },
    
    /** 
     * APIMethod: equals
     * Determine whether another geometry is equivalent to this one.  Geometries
     *     are considered equivalent if all components have the same coordinates.
     * 
     * Parameters:
     * geom - {<OpenLayers.Geometry.Point>} The geometry to test. 
     *
     * Returns:
     * {Boolean} The supplied geometry is equivalent to this geometry.
     */
    equals: function(geom) {
        var equals = false;
        if (geom != null) {
            equals = ((this.x == geom.x && this.y == geom.y) ||
                      (isNaN(this.x) && isNaN(this.y) && isNaN(geom.x) && isNaN(geom.y)));
        }
        return equals;
    },
    
    /**
     * Method: toShortString
     *
     * Returns:
     * {String} Shortened String representation of Point object. 
     *         (ex. <i>"5, 42"</i>)
     */
    toShortString: function() {
        return (this.x + ", " + this.y);
    },
    
    /**
     * APIMethod: move
     * Moves a geometry by the given displacement along positive x and y axes.
     *     This modifies the position of the geometry and clears the cached
     *     bounds.
     *
     * Parameters:
     * x - {Float} Distance to move geometry in positive x direction. 
     * y - {Float} Distance to move geometry in positive y direction.
     */
    move: function(x, y) {
        this.x = this.x + x;
        this.y = this.y + y;
        this.clearBounds();
    },

    /**
     * APIMethod: rotate
     * Rotate a point around another.
     *
     * Parameters:
     * angle - {Float} Rotation angle in degrees (measured counterclockwise
     *                 from the positive x-axis)
     * origin - {<OpenLayers.Geometry.Point>} Center point for the rotation
     */
    rotate: function(angle, origin) {
        angle *= Math.PI / 180;
        var radius = this.distanceTo(origin);
        var theta = angle + Math.atan2(this.y - origin.y, this.x - origin.x);
        this.x = origin.x + (radius * Math.cos(theta));
        this.y = origin.y + (radius * Math.sin(theta));
        this.clearBounds();
    },
    
    /**
     * APIMethod: getCentroid
     *
     * Returns:
     * {<OpenLayers.Geometry.Point>} The centroid of the collection
     */
    getCentroid: function() {
        return new OpenLayers.Geometry.Point(this.x, this.y);
    },

    /**
     * APIMethod: resize
     * Resize a point relative to some origin.  For points, this has the effect
     *     of scaling a vector (from the origin to the point).  This method is
     *     more useful on geometry collection subclasses.
     *
     * Parameters:
     * scale - {Float} Ratio of the new distance from the origin to the old
     *                 distance from the origin.  A scale of 2 doubles the
     *                 distance between the point and origin.
     * origin - {<OpenLayers.Geometry.Point>} Point of origin for resizing
     * ratio - {Float} Optional x:y ratio for resizing.  Default ratio is 1.
     * 
     * Returns:
     * {<OpenLayers.Geometry>} - The current geometry. 
     */
    resize: function(scale, origin, ratio) {
        ratio = (ratio == undefined) ? 1 : ratio;
        this.x = origin.x + (scale * ratio * (this.x - origin.x));
        this.y = origin.y + (scale * (this.y - origin.y));
        this.clearBounds();
        return this;
    },
    
    /**
     * APIMethod: intersects
     * Determine if the input geometry intersects this one.
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>} Any type of geometry.
     *
     * Returns:
     * {Boolean} The input geometry intersects this one.
     */
    intersects: function(geometry) {
        var intersect = false;
        if(geometry.CLASS_NAME == "OpenLayers.Geometry.Point") {
            intersect = this.equals(geometry);
        } else {
            intersect = geometry.intersects(this);
        }
        return intersect;
    },
    
    /**
     * APIMethod: transform
     * Translate the x,y properties of the point from source to dest.
     * 
     * Parameters:
     * source - {<OpenLayers.Projection>} 
     * dest - {<OpenLayers.Projection>}
     * 
     * Returns:
     * {<OpenLayers.Geometry>} 
     */
    transform: function(source, dest) {
        if ((source && dest)) {
            OpenLayers.Projection.transform(
                this, source, dest); 
            this.bounds = null;
        }       
        return this;
    },

    /**
     * APIMethod: getVertices
     * Return a list of all points in this geometry.
     *
     * Parameters:
     * nodes - {Boolean} For lines, only return vertices that are
     *     endpoints.  If false, for lines, only vertices that are not
     *     endpoints will be returned.  If not provided, all vertices will
     *     be returned.
     *
     * Returns:
     * {Array} A list of all vertices in the geometry.
     */
    getVertices: function(nodes) {
        return [this];
    },

    CLASS_NAME: "OpenLayers.Geometry.Point"
});
/* ======================================================================
    OpenLayers/Geometry/MultiPoint.js
   ====================================================================== */

/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/Point.js
 */

/**
 * Class: OpenLayers.Geometry.MultiPoint
 * MultiPoint is a collection of Points.  Create a new instance with the
 * <OpenLayers.Geometry.MultiPoint> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.Collection>
 *  - <OpenLayers.Geometry>
 */
OpenLayers.Geometry.MultiPoint = OpenLayers.Class(
  OpenLayers.Geometry.Collection, {

    /**
     * Property: componentTypes
     * {Array(String)} An array of class names representing the types of
     * components that the collection can include.  A null value means the
     * component types are not restricted.
     */
    componentTypes: ["OpenLayers.Geometry.Point"],

    /**
     * Constructor: OpenLayers.Geometry.MultiPoint
     * Create a new MultiPoint Geometry
     *
     * Parameters:
     * components - {Array(<OpenLayers.Geometry.Point>)} 
     *
     * Returns:
     * {<OpenLayers.Geometry.MultiPoint>}
     */

    /**
     * APIMethod: addPoint
     * Wrapper for <OpenLayers.Geometry.Collection.addComponent>
     *
     * Parameters:
     * point - {<OpenLayers.Geometry.Point>} Point to be added
     * index - {Integer} Optional index
     */
    addPoint: function(point, index) {
        this.addComponent(point, index);
    },
    
    /**
     * APIMethod: removePoint
     * Wrapper for <OpenLayers.Geometry.Collection.removeComponent>
     *
     * Parameters:
     * point - {<OpenLayers.Geometry.Point>} Point to be removed
     */
    removePoint: function(point){
        this.removeComponent(point);
    },

    CLASS_NAME: "OpenLayers.Geometry.MultiPoint"
});
/* ======================================================================
    OpenLayers/Geometry/Curve.js
   ====================================================================== */

/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Geometry/MultiPoint.js
 */

/**
 * Class: OpenLayers.Geometry.Curve
 * A Curve is a MultiPoint, whose points are assumed to be connected. To 
 * this end, we provide a "getLength()" function, which iterates through 
 * the points, summing the distances between them. 
 * 
 * Inherits: 
 *  - <OpenLayers.Geometry.MultiPoint>
 */
OpenLayers.Geometry.Curve = OpenLayers.Class(OpenLayers.Geometry.MultiPoint, {

    /**
     * Property: componentTypes
     * {Array(String)} An array of class names representing the types of 
     *                 components that the collection can include.  A null 
     *                 value means the component types are not restricted.
     */
    componentTypes: ["OpenLayers.Geometry.Point"],

    /**
     * Constructor: OpenLayers.Geometry.Curve
     * 
     * Parameters:
     * point - {Array(<OpenLayers.Geometry.Point>)}
     */
    
    /**
     * APIMethod: getLength
     * 
     * Returns:
     * {Float} The length of the curve
     */
    getLength: function() {
        var length = 0.0;
        if ( this.components && (this.components.length > 1)) {
            for(var i=1, len=this.components.length; i<len; i++) {
                length += this.components[i-1].distanceTo(this.components[i]);
            }
        }
        return length;
    },

    /**
     * APIMethod: getGeodesicLength
     * Calculate the approximate length of the geometry were it projected onto
     *     the earth.
     *
     * projection - {<OpenLayers.Projection>} The spatial reference system
     *     for the geometry coordinates.  If not provided, Geographic/WGS84 is
     *     assumed.
     * 
     * Returns:
     * {Float} The appoximate geodesic length of the geometry in meters.
     */
    getGeodesicLength: function(projection) {
        var geom = this;  // so we can work with a clone if needed
        if(projection) {
            var gg = new OpenLayers.Projection("EPSG:4326");
            if(!gg.equals(projection)) {
                geom = this.clone().transform(projection, gg);
            }
        }
        var length = 0.0;
        if(geom.components && (geom.components.length > 1)) {
            var p1, p2;
            for(var i=1, len=geom.components.length; i<len; i++) {
                p1 = geom.components[i-1];
                p2 = geom.components[i];
                // this returns km and requires lon/lat properties
                length += OpenLayers.Util.distVincenty(
                    {lon: p1.x, lat: p1.y}, {lon: p2.x, lat: p2.y}
                );
            }
        }
        // convert to m
        return length * 1000;
    },

    CLASS_NAME: "OpenLayers.Geometry.Curve"
});
/* ======================================================================
    OpenLayers/Geometry/LineString.js
   ====================================================================== */

/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Geometry/Curve.js
 */

/**
 * Class: OpenLayers.Geometry.LineString
 * A LineString is a Curve which, once two points have been added to it, can 
 * never be less than two points long.
 * 
 * Inherits from:
 *  - <OpenLayers.Geometry.Curve>
 */
OpenLayers.Geometry.LineString = OpenLayers.Class(OpenLayers.Geometry.Curve, {

    /**
     * Constructor: OpenLayers.Geometry.LineString
     * Create a new LineString geometry
     *
     * Parameters:
     * points - {Array(<OpenLayers.Geometry.Point>)} An array of points used to
     *          generate the linestring
     *
     */

    /**
     * APIMethod: removeComponent
     * Only allows removal of a point if there are three or more points in 
     * the linestring. (otherwise the result would be just a single point)
     *
     * Parameters: 
     * point - {<OpenLayers.Geometry.Point>} The point to be removed
     *
     * Returns: 
     * {Boolean} The component was removed.
     */
    removeComponent: function(point) {
        var removed = this.components && (this.components.length > 2);
        if (removed) {
            OpenLayers.Geometry.Collection.prototype.removeComponent.apply(this, 
                                                                  arguments);
        }
        return removed;
    },
    
    /**
     * APIMethod: intersects
     * Test for instersection between two geometries.  This is a cheapo
     *     implementation of the Bently-Ottmann algorigithm.  It doesn't
     *     really keep track of a sweep line data structure.  It is closer
     *     to the brute force method, except that segments are sorted and
     *     potential intersections are only calculated when bounding boxes
     *     intersect.
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>}
     *
     * Returns:
     * {Boolean} The input geometry intersects this geometry.
     */
    intersects: function(geometry) {
        var intersect = false;
        var type = geometry.CLASS_NAME;
        if(type == "OpenLayers.Geometry.LineString" ||
           type == "OpenLayers.Geometry.LinearRing" ||
           type == "OpenLayers.Geometry.Point") {
            var segs1 = this.getSortedSegments();
            var segs2;
            if(type == "OpenLayers.Geometry.Point") {
                segs2 = [{
                    x1: geometry.x, y1: geometry.y,
                    x2: geometry.x, y2: geometry.y
                }];
            } else {
                segs2 = geometry.getSortedSegments();
            }
            var seg1, seg1x1, seg1x2, seg1y1, seg1y2,
                seg2, seg2y1, seg2y2;
            // sweep right
            outer: for(var i=0, len=segs1.length; i<len; ++i) {
                seg1 = segs1[i];
                seg1x1 = seg1.x1;
                seg1x2 = seg1.x2;
                seg1y1 = seg1.y1;
                seg1y2 = seg1.y2;
                inner: for(var j=0, jlen=segs2.length; j<jlen; ++j) {
                    seg2 = segs2[j];
                    if(seg2.x1 > seg1x2) {
                        // seg1 still left of seg2
                        break;
                    }
                    if(seg2.x2 < seg1x1) {
                        // seg2 still left of seg1
                        continue;
                    }
                    seg2y1 = seg2.y1;
                    seg2y2 = seg2.y2;
                    if(Math.min(seg2y1, seg2y2) > Math.max(seg1y1, seg1y2)) {
                        // seg2 above seg1
                        continue;
                    }
                    if(Math.max(seg2y1, seg2y2) < Math.min(seg1y1, seg1y2)) {
                        // seg2 below seg1
                        continue;
                    }
                    if(OpenLayers.Geometry.segmentsIntersect(seg1, seg2)) {
                        intersect = true;
                        break outer;
                    }
                }
            }
        } else {
            intersect = geometry.intersects(this);
        }
        return intersect;
    },
    
    /**
     * Method: getSortedSegments
     *
     * Returns:
     * {Array} An array of segment objects.  Segment objects have properties
     *     x1, y1, x2, and y2.  The start point is represented by x1 and y1.
     *     The end point is represented by x2 and y2.  Start and end are
     *     ordered so that x1 < x2.
     */
    getSortedSegments: function() {
        var numSeg = this.components.length - 1;
        var segments = new Array(numSeg), point1, point2;
        for(var i=0; i<numSeg; ++i) {
            point1 = this.components[i];
            point2 = this.components[i + 1];
            if(point1.x < point2.x) {
                segments[i] = {
                    x1: point1.x,
                    y1: point1.y,
                    x2: point2.x,
                    y2: point2.y
                };
            } else {
                segments[i] = {
                    x1: point2.x,
                    y1: point2.y,
                    x2: point1.x,
                    y2: point1.y
                };
            }
        }
        // more efficient to define this somewhere static
        function byX1(seg1, seg2) {
            return seg1.x1 - seg2.x1;
        }
        return segments.sort(byX1);
    },
    
    /**
     * Method: splitWithSegment
     * Split this geometry with the given segment.
     *
     * Parameters:
     * seg - {Object} An object with x1, y1, x2, and y2 properties referencing
     *     segment endpoint coordinates.
     * options - {Object} Properties of this object will be used to determine
     *     how the split is conducted.
     *
     * Valid options:
     * edge - {Boolean} Allow splitting when only edges intersect.  Default is
     *     true.  If false, a vertex on the source segment must be within the
     *     tolerance distance of the intersection to be considered a split.
     * tolerance - {Number} If a non-null value is provided, intersections
     *     within the tolerance distance of one of the source segment's
     *     endpoints will be assumed to occur at the endpoint.
     *
     * Returns:
     * {Object} An object with *lines* and *points* properties.  If the given
     *     segment intersects this linestring, the lines array will reference
     *     geometries that result from the split.  The points array will contain
     *     all intersection points.  Intersection points are sorted along the
     *     segment (in order from x1,y1 to x2,y2).
     */
    splitWithSegment: function(seg, options) {
        var edge = !(options && options.edge === false);
        var tolerance = options && options.tolerance;
        var lines = [];
        var verts = this.getVertices();
        var points = [];
        var intersections = [];
        var split = false;
        var vert1, vert2, point;
        var node, vertex, target;
        var interOptions = {point: true, tolerance: tolerance};
        var result = null;
        for(var i=0, stop=verts.length-2; i<=stop; ++i) {
            vert1 = verts[i];
            points.push(vert1.clone());
            vert2 = verts[i+1];
            target = {x1: vert1.x, y1: vert1.y, x2: vert2.x, y2: vert2.y};
            point = OpenLayers.Geometry.segmentsIntersect(
                seg, target, interOptions
            );
            if(point instanceof OpenLayers.Geometry.Point) {
                if((point.x === seg.x1 && point.y === seg.y1) ||
                   (point.x === seg.x2 && point.y === seg.y2) ||
                   point.equals(vert1) || point.equals(vert2)) {
                    vertex = true;
                } else {
                    vertex = false;
                }
                if(vertex || edge) {
                    // push intersections different than the previous
                    if(!point.equals(intersections[intersections.length-1])) {
                        intersections.push(point.clone());
                    }
                    if(i === 0) {
                        if(point.equals(vert1)) {
                            continue;
                        }
                    }
                    if(point.equals(vert2)) {
                        continue;
                    }
                    split = true;
                    if(!point.equals(vert1)) {
                        points.push(point);
                    }
                    lines.push(new OpenLayers.Geometry.LineString(points));
                    points = [point.clone()];
                }
            }
        }
        if(split) {
            points.push(vert2.clone());
            lines.push(new OpenLayers.Geometry.LineString(points));
        }
        if(intersections.length > 0) {
            // sort intersections along segment
            var xDir = seg.x1 < seg.x2 ? 1 : -1;
            var yDir = seg.y1 < seg.y2 ? 1 : -1;
            result = {
                lines: lines,
                points: intersections.sort(function(p1, p2) {
                    return (xDir * p1.x - xDir * p2.x) || (yDir * p1.y - yDir * p2.y);
                })
            };
        }
        return result;
    },

    /**
     * Method: split
     * Use this geometry (the source) to attempt to split a target geometry.
     * 
     * Parameters:
     * target - {<OpenLayers.Geometry>} The target geometry.
     * options - {Object} Properties of this object will be used to determine
     *     how the split is conducted.
     *
     * Valid options:
     * mutual - {Boolean} Split the source geometry in addition to the target
     *     geometry.  Default is false.
     * edge - {Boolean} Allow splitting when only edges intersect.  Default is
     *     true.  If false, a vertex on the source must be within the tolerance
     *     distance of the intersection to be considered a split.
     * tolerance - {Number} If a non-null value is provided, intersections
     *     within the tolerance distance of an existing vertex on the source
     *     will be assumed to occur at the vertex.
     * 
     * Returns:
     * {Array} A list of geometries (of this same type as the target) that
     *     result from splitting the target with the source geometry.  The
     *     source and target geometry will remain unmodified.  If no split
     *     results, null will be returned.  If mutual is true and a split
     *     results, return will be an array of two arrays - the first will be
     *     all geometries that result from splitting the source geometry and
     *     the second will be all geometries that result from splitting the
     *     target geometry.
     */
    split: function(target, options) {
        var results = null;
        var mutual = options && options.mutual;
        var sourceSplit, targetSplit, sourceParts, targetParts;
        if(target instanceof OpenLayers.Geometry.LineString) {
            var verts = this.getVertices();
            var vert1, vert2, seg, splits, lines, point;
            var points = [];
            sourceParts = [];
            for(var i=0, stop=verts.length-2; i<=stop; ++i) {
                vert1 = verts[i];
                vert2 = verts[i+1];
                seg = {
                    x1: vert1.x, y1: vert1.y,
                    x2: vert2.x, y2: vert2.y
                };
                targetParts = targetParts || [target];
                if(mutual) {
                    points.push(vert1.clone());
                }
                for(var j=0; j<targetParts.length; ++j) {
                    splits = targetParts[j].splitWithSegment(seg, options);
                    if(splits) {
                        // splice in new features
                        lines = splits.lines;
                        if(lines.length > 0) {
                            lines.unshift(j, 1);
                            Array.prototype.splice.apply(targetParts, lines);
                            j += lines.length - 2;
                        }
                        if(mutual) {
                            for(var k=0, len=splits.points.length; k<len; ++k) {
                                point = splits.points[k];
                                if(!point.equals(vert1)) {
                                    points.push(point);
                                    sourceParts.push(new OpenLayers.Geometry.LineString(points));
                                    if(point.equals(vert2)) {
                                        points = [];
                                    } else {
                                        points = [point.clone()];
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if(mutual && sourceParts.length > 0 && points.length > 0) {
                points.push(vert2.clone());
                sourceParts.push(new OpenLayers.Geometry.LineString(points));
            }
        } else {
            results = target.splitWith(this, options);
        }
        if(targetParts && targetParts.length > 1) {
            targetSplit = true;
        } else {
            targetParts = [];
        }
        if(sourceParts && sourceParts.length > 1) {
            sourceSplit = true;
        } else {
            sourceParts = [];
        }
        if(targetSplit || sourceSplit) {
            if(mutual) {
                results = [sourceParts, targetParts];
            } else {
                results = targetParts;
            }
        }
        return results;
    },

    /**
     * Method: splitWith
     * Split this geometry (the target) with the given geometry (the source).
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>} A geometry used to split this
     *     geometry (the source).
     * options - {Object} Properties of this object will be used to determine
     *     how the split is conducted.
     *
     * Valid options:
     * mutual - {Boolean} Split the source geometry in addition to the target
     *     geometry.  Default is false.
     * edge - {Boolean} Allow splitting when only edges intersect.  Default is
     *     true.  If false, a vertex on the source must be within the tolerance
     *     distance of the intersection to be considered a split.
     * tolerance - {Number} If a non-null value is provided, intersections
     *     within the tolerance distance of an existing vertex on the source
     *     will be assumed to occur at the vertex.
     * 
     * Returns:
     * {Array} A list of geometries (of this same type as the target) that
     *     result from splitting the target with the source geometry.  The
     *     source and target geometry will remain unmodified.  If no split
     *     results, null will be returned.  If mutual is true and a split
     *     results, return will be an array of two arrays - the first will be
     *     all geometries that result from splitting the source geometry and
     *     the second will be all geometries that result from splitting the
     *     target geometry.
     */
    splitWith: function(geometry, options) {
        return geometry.split(this, options);

    },

    /**
     * APIMethod: getVertices
     * Return a list of all points in this geometry.
     *
     * Parameters:
     * nodes - {Boolean} For lines, only return vertices that are
     *     endpoints.  If false, for lines, only vertices that are not
     *     endpoints will be returned.  If not provided, all vertices will
     *     be returned.
     *
     * Returns:
     * {Array} A list of all vertices in the geometry.
     */
    getVertices: function(nodes) {
        var vertices;
        if(nodes === true) {
            vertices = [
                this.components[0],
                this.components[this.components.length-1]
            ];
        } else if (nodes === false) {
            vertices = this.components.slice(1, this.components.length-1);
        } else {
            vertices = this.components.slice();
        }
        return vertices;
    },

    /**
     * APIMethod: distanceTo
     * Calculate the closest distance between two geometries (on the x-y plane).
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>} The target geometry.
     * options - {Object} Optional properties for configuring the distance
     *     calculation.
     *
     * Valid options:
     * details - {Boolean} Return details from the distance calculation.
     *     Default is false.
     * edge - {Boolean} Calculate the distance from this geometry to the
     *     nearest edge of the target geometry.  Default is true.  If true,
     *     calling distanceTo from a geometry that is wholly contained within
     *     the target will result in a non-zero distance.  If false, whenever
     *     geometries intersect, calling distanceTo will return 0.  If false,
     *     details cannot be returned.
     *
     * Returns:
     * {Number | Object} The distance between this geometry and the target.
     *     If details is true, the return will be an object with distance,
     *     x0, y0, x1, and x2 properties.  The x0 and y0 properties represent
     *     the coordinates of the closest point on this geometry. The x1 and y1
     *     properties represent the coordinates of the closest point on the
     *     target geometry.
     */
    distanceTo: function(geometry, options) {
        var edge = !(options && options.edge === false);
        var details = edge && options && options.details;
        var result, best = {};
        var min = Number.POSITIVE_INFINITY;
        if(geometry instanceof OpenLayers.Geometry.Point) {
            var segs = this.getSortedSegments();
            var x = geometry.x;
            var y = geometry.y;
            var seg;
            for(var i=0, len=segs.length; i<len; ++i) {
                seg = segs[i];
                result = OpenLayers.Geometry.distanceToSegment(geometry, seg);
                if(result.distance < min) {
                    min = result.distance;
                    best = result;
                    if(min === 0) {
                        break;
                    }
                } else {
                    // if distance increases and we cross y0 to the right of x0, no need to keep looking.
                    if(seg.x2 > x && ((y > seg.y1 && y < seg.y2) || (y < seg.y1 && y > seg.y2))) {
                        break;
                    }
                }
            }
            if(details) {
                best = {
                    distance: best.distance,
                    x0: best.x, y0: best.y,
                    x1: x, y1: y
                };
            } else {
                best = best.distance;
            }
        } else if(geometry instanceof OpenLayers.Geometry.LineString) { 
            var segs0 = this.getSortedSegments();
            var segs1 = geometry.getSortedSegments();
            var seg0, seg1, intersection, x0, y0;
            var len1 = segs1.length;
            var interOptions = {point: true};
            outer: for(var i=0, len=segs0.length; i<len; ++i) {
                seg0 = segs0[i];
                x0 = seg0.x1;
                y0 = seg0.y1;
                for(var j=0; j<len1; ++j) {
                    seg1 = segs1[j];
                    intersection = OpenLayers.Geometry.segmentsIntersect(seg0, seg1, interOptions);
                    if(intersection) {
                        min = 0;
                        best = {
                            distance: 0,
                            x0: intersection.x, y0: intersection.y,
                            x1: intersection.x, y1: intersection.y
                        };
                        break outer;
                    } else {
                        result = OpenLayers.Geometry.distanceToSegment({x: x0, y: y0}, seg1);
                        if(result.distance < min) {
                            min = result.distance;
                            best = {
                                distance: min,
                                x0: x0, y0: y0,
                                x1: result.x, y1: result.y
                            };
                        }
                    }
                }
            }
            if(!details) {
                best = best.distance;
            }
            if(min !== 0) {
                // check the final vertex in this line's sorted segments
                if(seg0) {
                    result = geometry.distanceTo(
                        new OpenLayers.Geometry.Point(seg0.x2, seg0.y2),
                        options
                    );
                    var dist = details ? result.distance : result;
                    if(dist < min) {
                        if(details) {
                            best = {
                                distance: min,
                                x0: result.x1, y0: result.y1,
                                x1: result.x0, y1: result.y0
                            };
                        } else {
                            best = dist;
                        }
                    }
                }
            }
        } else {
            best = geometry.distanceTo(this, options);
            // swap since target comes from this line
            if(details) {
                best = {
                    distance: best.distance,
                    x0: best.x1, y0: best.y1,
                    x1: best.x0, y1: best.y0
                };
            }
        }
        return best;
    },
    
    /**
     * APIMethod: simplify
     * This function will return a simplified LineString.
     * Simplification is based on the Douglas-Peucker algorithm.
     *
     *
     * Parameters:
     * tolerance - {number} threshhold for simplification in map units
     *
     * Returns:
     * {OpenLayers.Geometry.LineString} the simplified LineString
     */
    simplify: function(tolerance){
        if (this && this !== null) {
            var points = this.getVertices();
            if (points.length < 3) {
                return this;
            }
    
            var compareNumbers = function(a, b){
                return (a-b);
            };
    
            /**
             * Private function doing the Douglas-Peucker reduction
             */
            var douglasPeuckerReduction = function(points, firstPoint, lastPoint, tolerance){
                var maxDistance = 0;
                var indexFarthest = 0;
    
                for (var index = firstPoint, distance; index < lastPoint; index++) {
                    distance = perpendicularDistance(points[firstPoint], points[lastPoint], points[index]);
                    if (distance > maxDistance) {
                        maxDistance = distance;
                        indexFarthest = index;
                    }
                }
    
                if (maxDistance > tolerance && indexFarthest != firstPoint) {
                    //Add the largest point that exceeds the tolerance
                    pointIndexsToKeep.push(indexFarthest);
                    douglasPeuckerReduction(points, firstPoint, indexFarthest, tolerance);
                    douglasPeuckerReduction(points, indexFarthest, lastPoint, tolerance);
                }
            };
    
            /**
             * Private function calculating the perpendicular distance
             * TODO: check whether OpenLayers.Geometry.LineString::distanceTo() is faster or slower
             */
            var perpendicularDistance = function(point1, point2, point){
                //Area = |(1/2)(x1y2 + x2y3 + x3y1 - x2y1 - x3y2 - x1y3)|   *Area of triangle
                //Base = v((x1-x2)²+(x1-x2)²)                               *Base of Triangle*
                //Area = .5*Base*H                                          *Solve for height
                //Height = Area/.5/Base
    
                var area = Math.abs(0.5 * (point1.x * point2.y + point2.x * point.y + point.x * point1.y - point2.x * point1.y - point.x * point2.y - point1.x * point.y));
                var bottom = Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
                var height = area / bottom * 2;
    
                return height;
            };
    
            var firstPoint = 0;
            var lastPoint = points.length - 1;
            var pointIndexsToKeep = [];
    
            //Add the first and last index to the keepers
            pointIndexsToKeep.push(firstPoint);
            pointIndexsToKeep.push(lastPoint);
    
            //The first and the last point cannot be the same
            while (points[firstPoint].equals(points[lastPoint])) {
                lastPoint--;
                //Addition: the first point not equal to first point in the LineString is kept as well
                pointIndexsToKeep.push(lastPoint);
            }
    
            douglasPeuckerReduction(points, firstPoint, lastPoint, tolerance);
            var returnPoints = [];
            pointIndexsToKeep.sort(compareNumbers);
            for (var index = 0; index < pointIndexsToKeep.length; index++) {
                returnPoints.push(points[pointIndexsToKeep[index]]);
            }
            return new OpenLayers.Geometry.LineString(returnPoints);
    
        }
        else {
            return this;
        }
    },

    CLASS_NAME: "OpenLayers.Geometry.LineString"
});
/* ======================================================================
    OpenLayers/Geometry/LinearRing.js
   ====================================================================== */

/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Geometry/LineString.js
 */

/**
 * Class: OpenLayers.Geometry.LinearRing
 * 
 * A Linear Ring is a special LineString which is closed. It closes itself 
 * automatically on every addPoint/removePoint by adding a copy of the first
 * point as the last point. 
 * 
 * Also, as it is the first in the line family to close itself, a getArea()
 * function is defined to calculate the enclosed area of the linearRing
 * 
 * Inherits:
 *  - <OpenLayers.Geometry.LineString>
 */
OpenLayers.Geometry.LinearRing = OpenLayers.Class(
  OpenLayers.Geometry.LineString, {

    /**
     * Property: componentTypes
     * {Array(String)} An array of class names representing the types of 
     *                 components that the collection can include.  A null 
     *                 value means the component types are not restricted.
     */
    componentTypes: ["OpenLayers.Geometry.Point"],

    /**
     * Constructor: OpenLayers.Geometry.LinearRing
     * Linear rings are constructed with an array of points.  This array
     *     can represent a closed or open ring.  If the ring is open (the last
     *     point does not equal the first point), the constructor will close
     *     the ring.  If the ring is already closed (the last point does equal
     *     the first point), it will be left closed.
     * 
     * Parameters:
     * points - {Array(<OpenLayers.Geometry.Point>)} points
     */

    /**
     * APIMethod: addComponent
     * Adds a point to geometry components.  If the point is to be added to
     *     the end of the components array and it is the same as the last point
     *     already in that array, the duplicate point is not added.  This has 
     *     the effect of closing the ring if it is not already closed, and 
     *     doing the right thing if it is already closed.  This behavior can 
     *     be overridden by calling the method with a non-null index as the 
     *     second argument.
     *
     * Parameters:
     * point - {<OpenLayers.Geometry.Point>}
     * index - {Integer} Index into the array to insert the component
     * 
     * Returns:
     * {Boolean} Was the Point successfully added?
     */
    addComponent: function(point, index) {
        var added = false;

        //remove last point
        var lastPoint = this.components.pop();

        // given an index, add the point
        // without an index only add non-duplicate points
        if(index != null || !point.equals(lastPoint)) {
            added = OpenLayers.Geometry.Collection.prototype.addComponent.apply(this, 
                                                                    arguments);
        }

        //append copy of first point
        var firstPoint = this.components[0];
        OpenLayers.Geometry.Collection.prototype.addComponent.apply(this, 
                                                                [firstPoint]);
        
        return added;
    },
    
    /**
     * APIMethod: removeComponent
     * Removes a point from geometry components.
     *
     * Parameters:
     * point - {<OpenLayers.Geometry.Point>}
     *
     * Returns: 
     * {Boolean} The component was removed.
     */
    removeComponent: function(point) {
        var removed = this.components && (this.components.length > 3);
        if (removed) {
            //remove last point
            this.components.pop();
            
            //remove our point
            OpenLayers.Geometry.Collection.prototype.removeComponent.apply(this, 
                                                                    arguments);
            //append copy of first point
            var firstPoint = this.components[0];
            OpenLayers.Geometry.Collection.prototype.addComponent.apply(this, 
                                                                [firstPoint]);
        }
        return removed;
    },
    
    /**
     * APIMethod: move
     * Moves a geometry by the given displacement along positive x and y axes.
     *     This modifies the position of the geometry and clears the cached
     *     bounds.
     *
     * Parameters:
     * x - {Float} Distance to move geometry in positive x direction. 
     * y - {Float} Distance to move geometry in positive y direction.
     */
    move: function(x, y) {
        for(var i = 0, len=this.components.length; i<len - 1; i++) {
            this.components[i].move(x, y);
        }
    },

    /**
     * APIMethod: rotate
     * Rotate a geometry around some origin
     *
     * Parameters:
     * angle - {Float} Rotation angle in degrees (measured counterclockwise
     *                 from the positive x-axis)
     * origin - {<OpenLayers.Geometry.Point>} Center point for the rotation
     */
    rotate: function(angle, origin) {
        for(var i=0, len=this.components.length; i<len - 1; ++i) {
            this.components[i].rotate(angle, origin);
        }
    },

    /**
     * APIMethod: resize
     * Resize a geometry relative to some origin.  Use this method to apply
     *     a uniform scaling to a geometry.
     *
     * Parameters:
     * scale - {Float} Factor by which to scale the geometry.  A scale of 2
     *                 doubles the size of the geometry in each dimension
     *                 (lines, for example, will be twice as long, and polygons
     *                 will have four times the area).
     * origin - {<OpenLayers.Geometry.Point>} Point of origin for resizing
     * ratio - {Float} Optional x:y ratio for resizing.  Default ratio is 1.
     * 
     * Returns:
     * {<OpenLayers.Geometry>} - The current geometry. 
     */
    resize: function(scale, origin, ratio) {
        for(var i=0, len=this.components.length; i<len - 1; ++i) {
            this.components[i].resize(scale, origin, ratio);
        }
        return this;
    },
    
    /**
     * APIMethod: transform
     * Reproject the components geometry from source to dest.
     *
     * Parameters:
     * source - {<OpenLayers.Projection>}
     * dest - {<OpenLayers.Projection>}
     * 
     * Returns:
     * {<OpenLayers.Geometry>} 
     */
    transform: function(source, dest) {
        if (source && dest) {
            for (var i=0, len=this.components.length; i<len - 1; i++) {
                var component = this.components[i];
                component.transform(source, dest);
            }
            this.bounds = null;
        }
        return this;
    },
    
    /**
     * APIMethod: getCentroid
     *
     * Returns:
     * {<OpenLayers.Geometry.Point>} The centroid of the collection
     */
    getCentroid: function() {
        if (this.components) {
            var len = this.components.length;
            if (len > 0 && len <= 2) {
                return this.components[0].clone();
            } else if (len > 2) {
                var sumX = 0.0;
                var sumY = 0.0;
                var x0 = this.components[0].x;
                var y0 = this.components[0].y;
                var area = -1 * this.getArea();
                if (area != 0) {
                    for (var i = 0; i < len - 1; i++) {
                        var b = this.components[i];
                        var c = this.components[i+1];
                        sumX += (b.x + c.x - 2 * x0) * ((b.x - x0) * (c.y - y0) - (c.x - x0) * (b.y - y0));
                        sumY += (b.y + c.y - 2 * y0) * ((b.x - x0) * (c.y - y0) - (c.x - x0) * (b.y - y0));
                    }
                    var x = x0 + sumX / (6 * area);
                    var y = y0 + sumY / (6 * area);
                } else {
                    for (var i = 0; i < len - 1; i++) {
                        sumX += this.components[i].x;
                        sumY += this.components[i].y;
                    }
                    var x = sumX / (len - 1);
                    var y = sumY / (len - 1);
                }
                return new OpenLayers.Geometry.Point(x, y);
            } else {
                return null;
            }
        }
    },

    /**
     * APIMethod: getArea
     * Note - The area is positive if the ring is oriented CW, otherwise
     *         it will be negative.
     * 
     * Returns:
     * {Float} The signed area for a ring.
     */
    getArea: function() {
        var area = 0.0;
        if ( this.components && (this.components.length > 2)) {
            var sum = 0.0;
            for (var i=0, len=this.components.length; i<len - 1; i++) {
                var b = this.components[i];
                var c = this.components[i+1];
                sum += (b.x + c.x) * (c.y - b.y);
            }
            area = - sum / 2.0;
        }
        return area;
    },
    
    /**
     * APIMethod: getGeodesicArea
     * Calculate the approximate area of the polygon were it projected onto
     *     the earth.  Note that this area will be positive if ring is oriented
     *     clockwise, otherwise it will be negative.
     *
     * Parameters:
     * projection - {<OpenLayers.Projection>} The spatial reference system
     *     for the geometry coordinates.  If not provided, Geographic/WGS84 is
     *     assumed.
     * 
     * Reference:
     * Robert. G. Chamberlain and William H. Duquette, "Some Algorithms for
     *     Polygons on a Sphere", JPL Publication 07-03, Jet Propulsion
     *     Laboratory, Pasadena, CA, June 2007 http://trs-new.jpl.nasa.gov/dspace/handle/2014/40409
     *
     * Returns:
     * {float} The approximate signed geodesic area of the polygon in square
     *     meters.
     */
    getGeodesicArea: function(projection) {
        var ring = this;  // so we can work with a clone if needed
        if(projection) {
            var gg = new OpenLayers.Projection("EPSG:4326");
            if(!gg.equals(projection)) {
                ring = this.clone().transform(projection, gg);
            }
        }
        var area = 0.0;
        var len = ring.components && ring.components.length;
        if(len > 2) {
            var p1, p2;
            for(var i=0; i<len-1; i++) {
                p1 = ring.components[i];
                p2 = ring.components[i+1];
                area += OpenLayers.Util.rad(p2.x - p1.x) *
                        (2 + Math.sin(OpenLayers.Util.rad(p1.y)) +
                        Math.sin(OpenLayers.Util.rad(p2.y)));
            }
            area = area * 6378137.0 * 6378137.0 / 2.0;
        }
        return area;
    },
    
    /**
     * Method: containsPoint
     * Test if a point is inside a linear ring.  For the case where a point
     *     is coincident with a linear ring edge, returns 1.  Otherwise,
     *     returns boolean.
     *
     * Parameters:
     * point - {<OpenLayers.Geometry.Point>}
     *
     * Returns:
     * {Boolean | Number} The point is inside the linear ring.  Returns 1 if
     *     the point is coincident with an edge.  Returns boolean otherwise.
     */
    containsPoint: function(point) {
        var approx = OpenLayers.Number.limitSigDigs;
        var digs = 14;
        var px = approx(point.x, digs);
        var py = approx(point.y, digs);
        function getX(y, x1, y1, x2, y2) {
            return (y - y2) * ((x2 - x1) / (y2 - y1)) + x2;
        }
        var numSeg = this.components.length - 1;
        var start, end, x1, y1, x2, y2, cx, cy;
        var crosses = 0;
        for(var i=0; i<numSeg; ++i) {
            start = this.components[i];
            x1 = approx(start.x, digs);
            y1 = approx(start.y, digs);
            end = this.components[i + 1];
            x2 = approx(end.x, digs);
            y2 = approx(end.y, digs);
            
            /**
             * The following conditions enforce five edge-crossing rules:
             *    1. points coincident with edges are considered contained;
             *    2. an upward edge includes its starting endpoint, and
             *    excludes its final endpoint;
             *    3. a downward edge excludes its starting endpoint, and
             *    includes its final endpoint;
             *    4. horizontal edges are excluded; and
             *    5. the edge-ray intersection point must be strictly right
             *    of the point P.
             */
            if(y1 == y2) {
                // horizontal edge
                if(py == y1) {
                    // point on horizontal line
                    if(x1 <= x2 && (px >= x1 && px <= x2) || // right or vert
                       x1 >= x2 && (px <= x1 && px >= x2)) { // left or vert
                        // point on edge
                        crosses = -1;
                        break;
                    }
                }
                // ignore other horizontal edges
                continue;
            }
            cx = approx(getX(py, x1, y1, x2, y2), digs);
            if(cx == px) {
                // point on line
                if(y1 < y2 && (py >= y1 && py <= y2) || // upward
                   y1 > y2 && (py <= y1 && py >= y2)) { // downward
                    // point on edge
                    crosses = -1;
                    break;
                }
            }
            if(cx <= px) {
                // no crossing to the right
                continue;
            }
            if(x1 != x2 && (cx < Math.min(x1, x2) || cx > Math.max(x1, x2))) {
                // no crossing
                continue;
            }
            if(y1 < y2 && (py >= y1 && py < y2) || // upward
               y1 > y2 && (py < y1 && py >= y2)) { // downward
                ++crosses;
            }
        }
        var contained = (crosses == -1) ?
            // on edge
            1 :
            // even (out) or odd (in)
            !!(crosses & 1);

        return contained;
    },

    /**
     * APIMethod: intersects
     * Determine if the input geometry intersects this one.
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>} Any type of geometry.
     *
     * Returns:
     * {Boolean} The input geometry intersects this one.
     */
    intersects: function(geometry) {
        var intersect = false;
        if(geometry.CLASS_NAME == "OpenLayers.Geometry.Point") {
            intersect = this.containsPoint(geometry);
        } else if(geometry.CLASS_NAME == "OpenLayers.Geometry.LineString") {
            intersect = geometry.intersects(this);
        } else if(geometry.CLASS_NAME == "OpenLayers.Geometry.LinearRing") {
            intersect = OpenLayers.Geometry.LineString.prototype.intersects.apply(
                this, [geometry]
            );
        } else {
            // check for component intersections
            for(var i=0, len=geometry.components.length; i<len; ++ i) {
                intersect = geometry.components[i].intersects(this);
                if(intersect) {
                    break;
                }
            }
        }
        return intersect;
    },

    /**
     * APIMethod: getVertices
     * Return a list of all points in this geometry.
     *
     * Parameters:
     * nodes - {Boolean} For lines, only return vertices that are
     *     endpoints.  If false, for lines, only vertices that are not
     *     endpoints will be returned.  If not provided, all vertices will
     *     be returned.
     *
     * Returns:
     * {Array} A list of all vertices in the geometry.
     */
    getVertices: function(nodes) {
        return (nodes === true) ? [] : this.components.slice(0, this.components.length-1);
    },

    CLASS_NAME: "OpenLayers.Geometry.LinearRing"
});
/* ======================================================================
    OpenLayers/Geometry/Polygon.js
   ====================================================================== */

/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 */

/**
 * Class: OpenLayers.Geometry.Polygon 
 * Polygon is a collection of Geometry.LinearRings. 
 * 
 * Inherits from:
 *  - <OpenLayers.Geometry.Collection> 
 *  - <OpenLayers.Geometry> 
 */
OpenLayers.Geometry.Polygon = OpenLayers.Class(
  OpenLayers.Geometry.Collection, {

    /**
     * Property: componentTypes
     * {Array(String)} An array of class names representing the types of
     * components that the collection can include.  A null value means the
     * component types are not restricted.
     */
    componentTypes: ["OpenLayers.Geometry.LinearRing"],

    /**
     * Constructor: OpenLayers.Geometry.Polygon
     * Constructor for a Polygon geometry. 
     * The first ring (this.component[0])is the outer bounds of the polygon and 
     * all subsequent rings (this.component[1-n]) are internal holes.
     *
     *
     * Parameters:
     * components - {Array(<OpenLayers.Geometry.LinearRing>)} 
     */

    /** 
     * APIMethod: getArea
     * Calculated by subtracting the areas of the internal holes from the 
     *   area of the outer hole.
     * 
     * Returns:
     * {float} The area of the geometry
     */
    getArea: function() {
        var area = 0.0;
        if ( this.components && (this.components.length > 0)) {
            area += Math.abs(this.components[0].getArea());
            for (var i=1, len=this.components.length; i<len; i++) {
                area -= Math.abs(this.components[i].getArea());
            }
        }
        return area;
    },

    /** 
     * APIMethod: getGeodesicArea
     * Calculate the approximate area of the polygon were it projected onto
     *     the earth.
     *
     * Parameters:
     * projection - {<OpenLayers.Projection>} The spatial reference system
     *     for the geometry coordinates.  If not provided, Geographic/WGS84 is
     *     assumed.
     * 
     * Reference:
     * Robert. G. Chamberlain and William H. Duquette, "Some Algorithms for
     *     Polygons on a Sphere", JPL Publication 07-03, Jet Propulsion
     *     Laboratory, Pasadena, CA, June 2007 http://trs-new.jpl.nasa.gov/dspace/handle/2014/40409
     *
     * Returns:
     * {float} The approximate geodesic area of the polygon in square meters.
     */
    getGeodesicArea: function(projection) {
        var area = 0.0;
        if(this.components && (this.components.length > 0)) {
            area += Math.abs(this.components[0].getGeodesicArea(projection));
            for(var i=1, len=this.components.length; i<len; i++) {
                area -= Math.abs(this.components[i].getGeodesicArea(projection));
            }
        }
        return area;
    },

    /**
     * Method: containsPoint
     * Test if a point is inside a polygon.  Points on a polygon edge are
     *     considered inside.
     *
     * Parameters:
     * point - {<OpenLayers.Geometry.Point>}
     *
     * Returns:
     * {Boolean | Number} The point is inside the polygon.  Returns 1 if the
     *     point is on an edge.  Returns boolean otherwise.
     */
    containsPoint: function(point) {
        var numRings = this.components.length;
        var contained = false;
        if(numRings > 0) {
            // check exterior ring - 1 means on edge, boolean otherwise
            contained = this.components[0].containsPoint(point);
            if(contained !== 1) {
                if(contained && numRings > 1) {
                    // check interior rings
                    var hole;
                    for(var i=1; i<numRings; ++i) {
                        hole = this.components[i].containsPoint(point);
                        if(hole) {
                            if(hole === 1) {
                                // on edge
                                contained = 1;
                            } else {
                                // in hole
                                contained = false;
                            }                            
                            break;
                        }
                    }
                }
            }
        }
        return contained;
    },

    /**
     * APIMethod: intersects
     * Determine if the input geometry intersects this one.
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>} Any type of geometry.
     *
     * Returns:
     * {Boolean} The input geometry intersects this one.
     */
    intersects: function(geometry) {
        var intersect = false;
        var i, len;
        if(geometry.CLASS_NAME == "OpenLayers.Geometry.Point") {
            intersect = this.containsPoint(geometry);
        } else if(geometry.CLASS_NAME == "OpenLayers.Geometry.LineString" ||
                  geometry.CLASS_NAME == "OpenLayers.Geometry.LinearRing") {
            // check if rings/linestrings intersect
            for(i=0, len=this.components.length; i<len; ++i) {
                intersect = geometry.intersects(this.components[i]);
                if(intersect) {
                    break;
                }
            }
            if(!intersect) {
                // check if this poly contains points of the ring/linestring
                for(i=0, len=geometry.components.length; i<len; ++i) {
                    intersect = this.containsPoint(geometry.components[i]);
                    if(intersect) {
                        break;
                    }
                }
            }
        } else {
            for(i=0, len=geometry.components.length; i<len; ++ i) {
                intersect = this.intersects(geometry.components[i]);
                if(intersect) {
                    break;
                }
            }
        }
        // check case where this poly is wholly contained by another
        if(!intersect && geometry.CLASS_NAME == "OpenLayers.Geometry.Polygon") {
            // exterior ring points will be contained in the other geometry
            var ring = this.components[0];
            for(i=0, len=ring.components.length; i<len; ++i) {
                intersect = geometry.containsPoint(ring.components[i]);
                if(intersect) {
                    break;
                }
            }
        }
        return intersect;
    },

    /**
     * APIMethod: distanceTo
     * Calculate the closest distance between two geometries (on the x-y plane).
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>} The target geometry.
     * options - {Object} Optional properties for configuring the distance
     *     calculation.
     *
     * Valid options:
     * details - {Boolean} Return details from the distance calculation.
     *     Default is false.
     * edge - {Boolean} Calculate the distance from this geometry to the
     *     nearest edge of the target geometry.  Default is true.  If true,
     *     calling distanceTo from a geometry that is wholly contained within
     *     the target will result in a non-zero distance.  If false, whenever
     *     geometries intersect, calling distanceTo will return 0.  If false,
     *     details cannot be returned.
     *
     * Returns:
     * {Number | Object} The distance between this geometry and the target.
     *     If details is true, the return will be an object with distance,
     *     x0, y0, x1, and y1 properties.  The x0 and y0 properties represent
     *     the coordinates of the closest point on this geometry. The x1 and y1
     *     properties represent the coordinates of the closest point on the
     *     target geometry.
     */
    distanceTo: function(geometry, options) {
        var edge = !(options && options.edge === false);
        var result;
        // this is the case where we might not be looking for distance to edge
        if(!edge && this.intersects(geometry)) {
            result = 0;
        } else {
            result = OpenLayers.Geometry.Collection.prototype.distanceTo.apply(
                this, [geometry, options]
            );
        }
        return result;
    },

    CLASS_NAME: "OpenLayers.Geometry.Polygon"
});

/**
 * APIMethod: createRegularPolygon
 * Create a regular polygon around a radius. Useful for creating circles 
 * and the like.
 *
 * Parameters:
 * origin - {<OpenLayers.Geometry.Point>} center of polygon.
 * radius - {Float} distance to vertex, in map units.
 * sides - {Integer} Number of sides. 20 approximates a circle.
 * rotation - {Float} original angle of rotation, in degrees.
 */
OpenLayers.Geometry.Polygon.createRegularPolygon = function(origin, radius, sides, rotation) {  
    var angle = Math.PI * ((1/sides) - (1/2));
    if(rotation) {
        angle += (rotation / 180) * Math.PI;
    }
    var rotatedAngle, x, y;
    var points = [];
    for(var i=0; i<sides; ++i) {
        rotatedAngle = angle + (i * 2 * Math.PI / sides);
        x = origin.x + (radius * Math.cos(rotatedAngle));
        y = origin.y + (radius * Math.sin(rotatedAngle));
        points.push(new OpenLayers.Geometry.Point(x, y));
    }
    var ring = new OpenLayers.Geometry.LinearRing(points);
    return new OpenLayers.Geometry.Polygon([ring]);
};
