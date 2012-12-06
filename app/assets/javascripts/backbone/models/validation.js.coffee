class BlueCarbon.Models.Validation extends Backbone.Model
  paramRoot: 'validation'

  defaults:
    coordinates: null
    action: null
    recorded_at: null
    area_id: null

  setCoordsFromPoints: (points) ->
    points = _.map(points, (p) ->
      [p.lng, p.lat]
    )
    points.push points[0]

    @set(coordinates: JSON.stringify([[points]]))

  coordsAsLatLngArray: () ->
    latLngs = []

    for point in JSON.parse(@get('coordinates'))[0][0]
      latLngs.push(new L.LatLng(point[1], point[0]))

    return latLngs

  parse: (resp, xhr) ->
    # Remove attributes returned from the server that are not in the
    # default attributes list
    for attr, val of resp
      if @defaults[attr] == undefined
        delete resp[attr]

    return resp

class BlueCarbon.Collections.ValidationsCollection extends Backbone.Collection
  model: BlueCarbon.Models.Validation
  url: '/validations'
