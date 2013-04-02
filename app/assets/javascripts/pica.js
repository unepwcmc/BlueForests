/*! pica - v0.1.0 - 2013-03-28
* https://github.com/unepwcmc/pica.js
* Copyright (c) 2013 UNEP-WCMC; */


window.Pica || (window.Pica = {});

Pica.Events = (function() {

  function Events() {}

  Events.prototype.on = function(event, callback) {
    var _base;
    this.events || (this.events = {});
    (_base = this.events)[event] || (_base[event] = []);
    return this.events[event].push(callback);
  };

  Events.prototype.off = function(event, callback) {
    var eventCallback, index, _i, _len, _ref, _results;
    if (this.events == null) {
      return;
    }
    if (event != null) {
      if (this.events[event] != null) {
        if (callback != null) {
          _ref = this.events[event];
          _results = [];
          for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
            eventCallback = _ref[index];
            if (eventCallback === callback) {
              this.events[event].splice(index, 1);
              _results.push(index -= 1);
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        } else {
          return delete this.events[event];
        }
      }
    } else {
      return this.events = [];
    }
  };

  Events.prototype.trigger = function(event, args) {
    var callback, _i, _len, _ref, _results;
    if ((this.events != null) && (this.events[event] != null)) {
      _ref = this.events[event];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        callback = _ref[_i];
        _results.push(callback.apply(this, [].concat(args)));
      }
      return _results;
    }
  };

  return Events;

})();

var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Pica.Model = (function(_super) {

  __extends(Model, _super);

  function Model() {
    this.destroy = __bind(this.destroy, this);

    this.fetch = __bind(this.fetch, this);

    this.save = __bind(this.save, this);
    return Model.__super__.constructor.apply(this, arguments);
  }

  Model.prototype.url = function() {};

  Model.prototype.get = function(attribute) {
    var _ref;
    if ((_ref = this.attributes) == null) {
      this.attributes = {};
    }
    return this.attributes[attribute];
  };

  Model.prototype.set = function(attribute, value) {
    var _ref;
    if ((_ref = this.attributes) == null) {
      this.attributes = {};
    }
    this.attributes[attribute] = value;
    return this.trigger('change');
  };

  Model.prototype.sync = function(options) {
    var callback, data,
      _this = this;
    if (options == null) {
      options = {};
    }
    callback = options.success || function() {};
    options.success = function(data, textStatus, jqXHR) {
      if (data.id != null) {
        _this.parse(data);
        _this.trigger('sync', _this);
      }
      return callback(_this, textStatus, jqXHR);
    };
    if (options.type === 'post' || options.type === 'put') {
      data = this.attributes;
      if (options.type === 'post') {
        data = JSON.stringify(data);
      }
    }
    if (options.type === 'delete') {
      data = null;
    }
    return $.ajax($.extend(options, {
      contentType: "application/json",
      dataType: "json",
      data: data
    }));
  };

  Model.prototype.parse = function(data) {
    var attr, val, _results;
    _results = [];
    for (attr in data) {
      val = data[attr];
      _results.push(this.set(attr, val));
    }
    return _results;
  };

  Model.prototype.save = function(options) {
    if (options == null) {
      options = {};
    }
    if (this.get('id') != null) {
      options.url = this.url().read != null ? this.url().read : this.url();
      options.type = 'put';
    } else {
      options.url = this.url().create != null ? this.url().create : this.url();
      options.type = 'post';
    }
    console.log("saving " + this.constructor.name + " " + (this.get('id')));
    return this.sync(options);
  };

  Model.prototype.fetch = function(options) {
    if (options == null) {
      options = {};
    }
    options.url = this.url().read != null ? this.url().read : this.url();
    console.log("fetching " + this.constructor.name + " " + (this.get('id')));
    return this.sync(options);
  };

  Model.prototype.destroy = function(options) {
    var originalCallback,
      _this = this;
    if (options == null) {
      options = {};
    }
    options.url = this.url().read != null ? this.url().read : this.url();
    options.type = 'delete';
    originalCallback = options.success;
    options.success = function() {
      _this.trigger('delete');
      console.log("deleted " + _this.constructor.name + " " + (_this.get('id')));
      if (originalCallback) {
        originalCallback();
      }
      return _this.off();
    };
    return this.sync(options);
  };

  return Model;

})(Pica.Events);

var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

window.Pica || (window.Pica = {});

Pica.Models = {};

Pica.Views = {};

Pica.Application = (function(_super) {

  __extends(Application, _super);

  function Application(config) {
    this.config = config;
    this.parse = __bind(this.parse, this);

    Pica.config = this.config;
    $.support.cors = true;
    $.ajaxSetup({
      headers: {
        'X-Magpie-ProjectId': Pica.config.projectId
      }
    });
    this.layers = [];
    this.fetch();
  }

  Application.prototype.newWorkspace = function() {
    return this.currentWorkspace = new Pica.Models.Workspace();
  };

  Application.prototype.showTileLayers = function() {
    return new Pica.Views.ShowLayersView({
      app: this
    });
  };

  Application.prototype.fetch = function() {
    return $.ajax({
      url: "" + Pica.config.magpieUrl + "/projects/" + Pica.config.projectId + ".json",
      type: 'get',
      success: this.parse
    });
  };

  Application.prototype.parse = function(data) {
    var attr, val;
    for (attr in data) {
      val = data[attr];
      this[attr] = val;
    }
    return this.trigger('sync');
  };

  return Application;

})(Pica.Events);

var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Pica.Models.Area = (function(_super) {

  __extends(Area, _super);

  function Area(options) {
    this.save = __bind(this.save, this);

    this.getAreaId = __bind(this.getAreaId, this);
    this.polygons = [];
    this.set('name', 'My Lovely Area');
  }

  Area.prototype.setName = function(name) {
    return this.set('name', name);
  };

  Area.prototype.addPolygon = function(polygon) {
    var _this = this;
    polygon.on('requestAreaId', this.getAreaId);
    polygon.on('sync', function() {
      return _this.fetch();
    });
    polygon.on('delete', function() {
      return _this.fetch();
    });
    this.polygons.push(polygon);
    return this.trigger('addedPolygon', polygon);
  };

  Area.prototype.getAreaId = function(options) {
    if (this.get('id') != null) {
      return options.success(this);
    } else {
      return this.save(options);
    }
  };

  Area.prototype.drawNewPolygonView = function(callbacks) {
    this.currentPolygon = new Pica.Models.Polygon();
    this.addPolygon(this.currentPolygon);
    return new Pica.Views.NewPolygonView({
      callbacks: callbacks,
      polygon: this.currentPolygon
    });
  };

  Area.prototype.drawNewCircleView = function(callbacks) {
    this.currentPolygon = new Pica.Models.Polygon();
    this.addPolygon(this.currentPolygon);
    return new Pica.Views.NewCircleView({
      callbacks: callbacks,
      polygon: this.currentPolygon
    });
  };

  Area.prototype.newUploadFileView = function(callbacks) {
    return new Pica.Views.UploadFileView({
      callbacks: callbacks,
      area: this
    });
  };

  Area.prototype.newShowAreaPolygonsView = function() {
    return new Pica.Views.ShowAreaPolygonsView({
      area: this
    });
  };

  Area.prototype.url = function() {
    return {
      create: "" + Pica.config.magpieUrl + "/workspaces/" + (this.get('workspace_id')) + "/areas_of_interest.json",
      read: "" + Pica.config.magpieUrl + "/areas_of_interest/" + (this.get('id')) + ".json"
    };
  };

  Area.prototype.parse = function(data) {
    var index, polygon, polygonAttributes, unPersistedPolygons, _i, _j, _len, _len1, _ref, _ref1;
    if (data.polygons != null) {
      this.polygons = [];
      _ref = data.polygons;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        polygonAttributes = _ref[_i];
        polygon = new Pica.Models.Polygon({
          attributes: polygonAttributes
        });
        this.addPolygon(polygon);
      }
      delete data.polygons;
    } else {
      unPersistedPolygons = [];
      _ref1 = this.polygons;
      for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
        polygon = _ref1[index];
        if (polygon.get('id') == null) {
          unPersistedPolygons.push(polygon);
        }
      }
      this.polygons = unPersistedPolygons;
    }
    return Area.__super__.parse.apply(this, arguments);
  };

  Area.prototype.save = function(options) {
    var _this = this;
    options || (options = {});
    if (this.get('workspace_id') != null) {
      return Area.__super__.save.call(this, options);
    } else {
      return this.trigger('requestWorkspaceId', {
        success: function(workspace, textStatus, jqXHR) {
          _this.set('workspace_id', workspace.get('id'));
          if (_this.get('workspace_id')) {
            return _this.save(options);
          } else {
            return options.error(_this, {
              error: "Could not save workspace, so cannot save area"
            }, jqXHR);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log("Unable to save area:");
          console.log(arguments);
          console.log(jqXHR.status);
          console.log(jqXHR.statusText);
          console.log(jqXHR.responseText);
          if (options.error != null) {
            return options.error(jqXHR, textStatus, {
              error: "Unable to obtain workspaceId, cannot save area",
              parentError: errorThrown
            });
          }
        }
      });
    }
  };

  return Area;

})(Pica.Model);

var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Pica.Models.Polygon = (function(_super) {

  __extends(Polygon, _super);

  function Polygon(options) {
    var _base;
    if (options == null) {
      options = {};
    }
    this.save = __bind(this.save, this);

    this.attributes = options.attributes != null ? options.attributes : {};
    (_base = this.attributes)['geometry'] || (_base['geometry'] = {
      type: 'Polygon'
    });
  }

  Polygon.prototype.isComplete = function() {
    return this.get('geometry').coordinates != null;
  };

  Polygon.prototype.setGeomFromPoints = function(points) {
    var point;
    points = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = points.length; _i < _len; _i++) {
        point = points[_i];
        _results.push([point.lng, point.lat]);
      }
      return _results;
    })();
    points.push(points[0]);
    return this.set('geometry', {
      type: 'Polygon',
      coordinates: [points]
    });
  };

  Polygon.prototype.setGeomFromCircle = function(latLng, radius) {
    return this.set('geometry', {
      type: 'Circle',
      coordinates: [latLng.lng, latLng.lat],
      radius: radius
    });
  };

  Polygon.prototype.asLeafletArguments = function() {
    var args, latLngs, point, _i, _len, _ref;
    args = [];
    if (this.get('geometry').type === 'Polygon') {
      latLngs = [];
      if (this.isComplete()) {
        _ref = this.get('geometry').coordinates[0];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          point = _ref[_i];
          latLngs.push(new L.LatLng(point[1], point[0]));
        }
      }
      args.push(latLngs);
    } else {
      if (this.isComplete()) {
        point = this.get('geometry').coordinates;
        args = [new L.LatLng(point[1], point[0]), this.get('geometry').radius];
      } else {
        args = [[], 0];
      }
    }
    return args;
  };

  Polygon.prototype.url = function() {
    return {
      read: "" + Pica.config.magpieUrl + "/polygons/" + (this.get('id')) + ".json",
      create: "" + Pica.config.magpieUrl + "/areas_of_interest/" + (this.get('area_id')) + "/polygons.json"
    };
  };

  Polygon.prototype.save = function(options) {
    var _this = this;
    options || (options = {});
    if (this.get('area_id') != null) {
      return Polygon.__super__.save.call(this, options);
    } else {
      return this.trigger('requestAreaId', {
        success: function(area, textStatus, jqXHR) {
          _this.set('area_id', area.get('id'));
          if (_this.get('area_id')) {
            return _this.save(options);
          } else {
            if (options.error != null) {
              return options.error(_this, {
                error: "Unable to get area id, so cannot save polygon"
              }, jqXHR);
            }
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log("Unable to save polygon:");
          console.log(arguments);
          console.log(jqXHR.status);
          console.log(jqXHR.statusText);
          console.log(jqXHR.responseText);
          if (options.error != null) {
            return options.error(jqXHR, textStatus, {
              error: "Unable to obtain areaId, cannot save polygon",
              parentError: errorThrown
            });
          }
        }
      });
    }
  };

  return Polygon;

})(Pica.Model);

var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Pica.Models.Workspace = (function(_super) {

  __extends(Workspace, _super);

  function Workspace() {
    this.save = __bind(this.save, this);
    this.attributes = {};
    this.areas = [];
    this.currentArea = new Pica.Models.Area();
    this.addArea(this.currentArea);
  }

  Workspace.prototype.url = function() {
    return "" + Pica.config.magpieUrl + "/workspaces.json";
  };

  Workspace.prototype.addArea = function(area) {
    var _this = this;
    area.on('requestWorkspaceId', function(options) {
      if (_this.get('id') != null) {
        return options.success(_this);
      } else {
        return _this.save(options);
      }
    });
    return this.areas.push(area);
  };

  Workspace.prototype.removeArea = function(theArea) {
    var area, id;
    id = this.areas.indexOf(theArea);
    area = this.areas.splice(id, 1)[0];
    if (area.get('id') != null) {
      return area.destroy();
    }
  };

  Workspace.prototype.setCurrentArea = function(theArea) {
    var area, _i, _len, _ref, _results;
    _ref = this.areas;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      area = _ref[_i];
      if (area === theArea) {
        _results.push(this.currentArea = area);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Workspace.prototype.setCurrentAreaById = function(areaId) {
    var area, _i, _len, _ref, _results;
    _ref = this.areas;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      area = _ref[_i];
      if (area.get('id') === areaId) {
        _results.push(this.currentArea = area);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Workspace.prototype.save = function(options) {
    return Workspace.__super__.save.call(this, options);
  };

  return Workspace;

})(Pica.Model);


Pica.Views.NewCircleView = (function() {

  function NewCircleView(options) {
    var _this = this;
    if (options.callbacks != null) {
      this.successCallback = options.callbacks.success;
      this.errorCallback = options.callbacks.error;
    }
    this.polygon = options.polygon;
    this.polygon.set('geometry', {
      type: 'Circle'
    });
    this.polygonDraw = new L.Circle.Draw(Pica.config.map, {});
    this.polygonDraw.enable();
    Pica.config.map.on('draw:circle-created', function(e) {
      return _this.createPolygon(e.circ);
    });
  }

  NewCircleView.prototype.createPolygon = function(mapCircle) {
    var _this = this;
    this.polygon.setGeomFromCircle(mapCircle.getLatLng(), mapCircle.getRadius());
    return this.polygon.save({
      success: function() {
        _this.close();
        if (_this.successCallback != null) {
          return _this.successCallback();
        }
      },
      error: function(xhr, textStatus, errorThrown) {
        _this.close();
        if (_this.errorCallback != null) {
          return _this.errorCallback.apply(_this, arguments);
        }
      }
    });
  };

  NewCircleView.prototype.close = function() {
    this.polygonDraw.disable();
    return Pica.config.map.off('draw:circle-created');
  };

  return NewCircleView;

})();


Pica.Views.NewPolygonView = (function() {

  function NewPolygonView(options) {
    var _this = this;
    if (options.callbacks != null) {
      this.successCallback = options.callbacks.success;
      this.errorCallback = options.callbacks.error;
    }
    this.polygon = options.polygon;
    this.polygonDraw = new L.Polygon.Draw(Pica.config.map, {});
    this.polygonDraw.enable();
    Pica.config.map.on('draw:poly-created', function(e) {
      var mapPolygon;
      mapPolygon = e.poly;
      return _this.createPolygon(mapPolygon);
    });
  }

  NewPolygonView.prototype.createPolygon = function(mapPolygon) {
    var _this = this;
    this.polygon.setGeomFromPoints(mapPolygon.getLatLngs());
    return this.polygon.save({
      success: function() {
        _this.close();
        if (_this.successCallback != null) {
          return _this.successCallback();
        }
      },
      error: function(xhr, textStatus, errorThrown) {
        _this.close();
        if (_this.errorCallback != null) {
          return _this.errorCallback.apply(_this, arguments);
        }
      }
    });
  };

  NewPolygonView.prototype.close = function() {
    this.polygonDraw.disable();
    return Pica.config.map.off('draw:poly-created');
  };

  return NewPolygonView;

})();

var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Pica.Views.ShowAreaPolygonsView = (function(_super) {

  __extends(ShowAreaPolygonsView, _super);

  function ShowAreaPolygonsView(options) {
    this.triggerPolyClick = __bind(this.triggerPolyClick, this);

    this.addPolygon = __bind(this.addPolygon, this);

    this.render = __bind(this.render, this);
    this.area = options.area;
    this.polysObserved = [];
    this.mapPolygons = [];
    this.area.on('sync', this.render);
    this.area.on('addedPolygon', this.addPolygon);
    this.render();
  }

  ShowAreaPolygonsView.prototype.render = function() {
    var mapPolygon, newObject, polygon, _i, _len, _ref, _results,
      _this = this;
    this.removeAllPolygonsAndBindings();
    _ref = this.area.polygons;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      polygon = _ref[_i];
      if (!polygon.isComplete()) {
        continue;
      }
      newObject = function(theConstructor, args) {
        var Wrapper;
        Wrapper = function(args) {
          return theConstructor.apply(this, args);
        };
        Wrapper.prototype = theConstructor.prototype;
        return new Wrapper(args);
      };
      mapPolygon = newObject(L[polygon.get('geometry').type], polygon.asLeafletArguments()).addTo(Pica.config.map);
      polygon.on('delete', (function() {
        var thatMapPolygon;
        thatMapPolygon = mapPolygon;
        return function() {
          return _this.removeMapPolygonAndBindings(thatMapPolygon);
        };
      })());
      mapPolygon.on('click', (function() {
        var thatMapPolygon, thatPolygon;
        thatPolygon = polygon;
        thatMapPolygon = mapPolygon;
        return function(event) {
          return _this.triggerPolyClick(thatPolygon, event, thatMapPolygon);
        };
      })());
      _results.push(this.mapPolygons.push(mapPolygon));
    }
    return _results;
  };

  ShowAreaPolygonsView.prototype.addPolygon = function(polygon) {
    polygon.on('change', this.render);
    return this.polysObserved.push(polygon);
  };

  ShowAreaPolygonsView.prototype.close = function() {
    var polygon, _i, _len, _ref, _results;
    this.removeAllPolygonsAndBindings();
    this.area.off('sync', this.render);
    this.area.off('addedPolygon', this.addPolygon);
    _ref = this.polysObserved;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      polygon = _ref[_i];
      _results.push(polygon.off('change', this.render));
    }
    return _results;
  };

  ShowAreaPolygonsView.prototype.removeAllPolygonsAndBindings = function() {
    var mapPolygon, _results;
    _results = [];
    while (mapPolygon = this.mapPolygons.shift()) {
      _results.push(this.removeMapPolygonAndBindings(mapPolygon));
    }
    return _results;
  };

  ShowAreaPolygonsView.prototype.removeMapPolygonAndBindings = function(mapPolygon) {
    mapPolygon.off('click', this.triggerPolyClicked);
    return Pica.config.map.removeLayer(mapPolygon);
  };

  ShowAreaPolygonsView.prototype.triggerPolyClick = function(polygon, event, mapPolygon) {
    return this.trigger('polygonClick', [polygon, event, mapPolygon]);
  };

  return ShowAreaPolygonsView;

})(Pica.Events);

var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Pica.Views.ShowLayersView = (function() {

  function ShowLayersView(options) {
    this.removeTileLayers = __bind(this.removeTileLayers, this);

    this.render = __bind(this.render, this);
    this.app = options.app;
    this.app.on('sync', this.render);
    this.tileLayers = [];
    this.render();
  }

  ShowLayersView.prototype.render = function() {
    var layer, tileLayer, _i, _len, _ref, _results;
    this.removeTileLayers();
    _ref = this.app.layers;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      layer = _ref[_i];
      tileLayer = new L.TileLayer(layer.tile_url);
      this.tileLayers.push(tileLayer);
      _results.push(tileLayer.addTo(this.app.config.map));
    }
    return _results;
  };

  ShowLayersView.prototype.removeTileLayers = function() {
    var tileLayer, _i, _len, _ref, _results;
    _ref = this.tileLayers;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tileLayer = _ref[_i];
      _results.push(this.app.map.removeLayer(tileLayer));
    }
    return _results;
  };

  ShowLayersView.prototype.close = function() {
    this.removeTileLayers();
    return this.app.off('sync', this.render);
  };

  return ShowLayersView;

})();

var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Pica.Views.UploadFileView = (function(_super) {

  __extends(UploadFileView, _super);

  function UploadFileView(options) {
    this.onUploadComplete = __bind(this.onUploadComplete, this);

    this.render = __bind(this.render, this);
    if (options.callbacks != null) {
      this.successCallback = options.callbacks.success;
      this.errorCallback = options.callbacks.error;
    }
    this.area = options.area;
    this.el = document.createElement("div");
    this.area.getAreaId({
      success: this.render
    });
  }

  UploadFileView.prototype.render = function() {
    var formFrame;
    formFrame = document.createElement('iframe');
    formFrame.src = "" + Pica.config.magpieUrl + "/areas_of_interest/" + (this.area.get('id')) + "/polygons/new_upload_form/";
    formFrame.className = "pica-upload-form";
    this.el.appendChild(formFrame);
    return window.addEventListener("message", this.onUploadComplete, false);
  };

  UploadFileView.prototype.onUploadComplete = function(event) {
    if (event.origin === Pica.config.magpieUrl && (event.data.polygonImportStatus != null)) {
      if (event.data.polygonImportStatus === 'Successful import' && (this.successCallback != null)) {
        this.successCallback(event.data.polygonImportStatus, event.data.importMessages);
      } else if (this.errorCallback != null) {
        this.errorCallback(event.data.polygonImportStatus, event.data.importMessages);
      }
      return this.close();
    }
  };

  UploadFileView.prototype.close = function() {
    window.removeEventListener("message", this.onUploadComplete);
    return $(this.el).remove();
  };

  return UploadFileView;

})(Pica.Events);
