BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.ShowView extends Backbone.View
  template: JST["backbone/templates/validations/show"]

  constructor: (options) ->
    super(options)
    @areas = options.areas

  render: ->
    $(@el).html(@template({validation: @model.toJSON(true), areas: @areas }))
    return this
