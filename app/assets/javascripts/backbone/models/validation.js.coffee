class BlueCarbon.Models.Validation extends Backbone.Model
  paramRoot: 'validation'

  initialize: ->
    if @isNew()
      now = new Date()
    else
      now = new Date(@get('recorded_at'))
      @set('photo_ids', _.map(@get('photos'), (photo) -> return photo.id))

    @set
      "recorded_at(1i)": "#{now.getFullYear()}"
      "recorded_at(2i)": "#{now.getMonth() + 1}"
      "recorded_at(3i)": "#{now.getDate()}"
      "recorded_at(4i)": "#{now.getUTCHours()}"
      "recorded_at(5i)": "#{now.getUTCMinutes()}"
      "recorded_at": @recorded_at_formatted()

  defaults:
    coordinates: null
    action: null
    habitat: null
    area_id: null
    knowledge: "browser"
    condition: "1"
    density: null
    age: null
    species: null
    "recorded_at(1i)": null
    "recorded_at(2i)": null
    "recorded_at(3i)": null
    notes: null
    photo_ids: []
    photos: []

  recorded_at_formatted: ->
    d = new Date(@get('recorded_at'))
    "#{(d.getDate()<10 && '0' || '')}#{d.getDate()}-#{((d.getMonth()+1)<10 && '0' || '')}#{d.getMonth() + 1}-#{d.getFullYear()} #{(d.getUTCHours()<10 && '0' || '')}#{d.getUTCHours()}:#{(d.getUTCMinutes()<10 && '0' || '')}#{d.getUTCMinutes()}"

  # Can't update record; Can't mass-assign protected attributes: id
  # (https://github.com/codebrew/backbone-rails/issues/38)

  secureAttributes: ['id', 'photos', 'admin', 'admin_id', 'created_at', 'updated_at']

  toJSON: (all = false) ->
    return @attributes if all

    model_json = @_cloneAttributes()

    if /Z$/.test(model_json.recorded_at)
      model_json.recorded_at = @recorded_at_formatted()

    switch @get('habitat')
      when 'mangrove'
        delete model_json.species
      when 'seagrass'
        delete model_json.condition
        delete model_json.age
      when 'sabkha'
        delete model_json.density
        delete model_json.condition
        delete model_json.age
        delete model_json.species
      when 'saltmarsh'
        delete model_json.condition
        delete model_json.age
        delete model_json.species

    return model_json

  _cloneAttributes: ->
    attributes = _.clone(@attributes)
    for sa in @secureAttributes
      delete attributes[sa]
    _.clone(attributes)

class BlueCarbon.Collections.ValidationsCollection extends Backbone.Collection
  model: BlueCarbon.Models.Validation
  url: '/validations'
