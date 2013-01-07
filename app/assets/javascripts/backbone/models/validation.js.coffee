class BlueCarbon.Models.Validation extends Backbone.Model
  paramRoot: 'validation'

  initialize: ->
    now = new Date()
    @set({"recorded_at(1i)": "#{now.getFullYear()}", "recorded_at(2i)": "#{now.getMonth() + 1}", "recorded_at(3i)": "#{now.getDate()}"})

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

  # Can't update record; Can't mass-assign protected attributes: id
  # (https://github.com/codebrew/backbone-rails/issues/38)

  secureAttributes: ['admin_id', 'created_at', 'updated_at']

  toJSON: ->
    model_json = @_cloneAttributes()

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
      when 'salt_marsh'
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
