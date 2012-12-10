class BlueCarbon.Models.Validation extends Backbone.Model
  paramRoot: 'validation'

  ###
    This schema is used by backbone-forms to determine how to
    display the new/edit form for this model
  ###
  schema:
    action: { type: 'Radio', options: ['Validate', 'Add', 'Delete'] }
    knowledge: { type: 'Select', options: ['Local Knowledge', 'Local Data'] }
    habitat: { type: 'Select', options: ['Mangroves', 'Seagrass', 'Sabkha', 'Saltmarshes'] }
    density: { type: 'Select', options: ['1 - thin', '2 - not as thin', '3 - even less thin'] }
    age: { type: 'Select', options: ['1 year', '2 years'] }
    recorded_at: { type: 'Date' }
    name: 'Text',

  defaults:
    coordinates: null
    action: null
    recorded_at: null
    area_id: null
    name: null
    knowledge: null
    habitat: 'Mangroves'
    density: null
    age: null

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
