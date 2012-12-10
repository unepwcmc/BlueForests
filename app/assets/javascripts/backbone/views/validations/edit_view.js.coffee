BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.EditView extends Backbone.View
  template: JST["backbone/templates/validations/edit"]

  events:
    "click #save" : "update"
    "click #type label": "actionChange"

  actionChange: (e) ->
    @polygonDraw.disable()  if @polygonDraw?
    BlueCarbon.Map.removeLayer @polygon  if @polygon?

    $target = $(e.target)

    @polygonDraw = new L.Polygon.Draw(BlueCarbon.Map, {})
    @polygonDraw.enable()

    @model.set('action', $target.text().toLowerCase())

  update: (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.unset('radio-group')

    @model.save(null,
      success : (validation) =>
        @model = validation
        window.location.hash = "/"
    )

  render: ->
    $(@el).html(@template(@model.toJSON()))
    $(@el).find('#form').html(window.JST['backbone/templates/validations/_form'](@model.toJSON()))

    this.$("form").backboneLink(@model)

    return this
