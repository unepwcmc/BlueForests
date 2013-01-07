BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.ShowView extends Backbone.View
  template: JST["backbone/templates/validations/show"]

  events:
    "click .destroy" : "destroy"

  destroy: () ->
    if confirm("Are you sure?")
      @model.destroy()
    else
      return false

  constructor: (options) ->
    super(options)
    @areas = options.areas

  render: ->
    validation_json = @model.toJSON()
    validation_json['photos'] = @model.get('photos')

    $(@el).html(@template({validation: validation_json, areas: @areas }))
    return this
