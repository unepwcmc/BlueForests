BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.ValidationView extends Backbone.View
  template: JST["backbone/templates/validations/validation"]

  tagName: "tr"

  #initialize: -> 
  #  @model.on "destroy", =>
  #    console.log 'xxxxxxxxxxx'
  #    @render()

  render: ->
    @$el.html @template( @model.toJSON(true) )
    return this
