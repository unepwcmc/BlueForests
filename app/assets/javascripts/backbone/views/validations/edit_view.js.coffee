BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.EditView extends Backbone.View
  template: JST["backbone/templates/validations/edit"]

  initialize: (options) ->
    @form = new Backbone.Form(
      model: @model
    ).render()

    @form.on('action:change', (form, element) =>
      @actionChange(form, element)
    )

  actionChange: (form, element) ->
    @polygonDraw.disable()  if @polygonDraw?
    BlueCarbon.Map.removeLayer @polygon  if @polygon?

    $target = $(element.el)

    @polygonDraw = new L.Polygon.Draw(BlueCarbon.Map, {})
    @polygonDraw.enable()

    text = $target.find('input:checked').siblings().text()

    @model.set('action', text.toLowerCase())

  events:
    "click #update" : "update"

  update: (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.save(null,
      success : (validation) =>
        @model = validation
        window.location.hash = "/#{@model.id}"
    )

  render: ->
    $(@el).html(@template(@model.toJSON()))
    $(@el).find('#form').html(@form.el)

    this.$("form").backboneLink(@model)

    return this
