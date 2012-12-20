class BlueCarbon.Models.Validation extends Backbone.Model
  paramRoot: 'validation'

  defaults:
    coordinates: null
    action: null
    habitat: null
    area_id: null
    knowledge: null
    density: null
    condition: null
    age: null
    species: null
    "recorded_at(1i)": null
    "recorded_at(2i)": null
    "recorded_at(3i)": null
    notes: null

  # Can't update record; Can't mass-assign protected attributes: id
  # (https://github.com/codebrew/backbone-rails/issues/38)

  secureAttributes: ['admin_id', 'created_at', 'updated_at']

  toJSON: ->
    @_cloneAttributes()

  _cloneAttributes: ->
    attributes = _.clone(@attributes)
    for sa in @secureAttributes
      delete attributes[sa]
    _.clone(attributes)

class BlueCarbon.Collections.ValidationsCollection extends Backbone.Collection
  model: BlueCarbon.Models.Validation
  url: '/validations'
