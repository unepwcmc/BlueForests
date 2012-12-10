BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.NewView extends Backbone.View
  template: JST["backbone/templates/validations/new"]

  events:
    "click #save": "save"
    "click #type label": "actionChange"

  constructor: (options) ->
    super(options)

    @model.bind("change:errors", () =>
      this.render()
    )

  actionChange: (e) ->
    @polygonDraw.disable()  if @polygonDraw?
    BlueCarbon.Map.removeLayer @polygon  if @polygon?

    $target = $(e.target)

    @polygonDraw = new L.Polygon.Draw(BlueCarbon.Map, {})
    @polygonDraw.enable()

    @model.set('action', $target.text().toLowerCase())

  save: (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.unset('radio-group')
    @model.unset("errors")

    @collection.create(@model.toJSON(),
      success: (validation) =>
        @model = validation
        window.location.hash = "/"

      error: (validation, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    )

  render: ->
    $(@el).html(@template(@model.toJSON()))
    $(@el).find('#form').html(window.JST['backbone/templates/validations/_form']())

    this.$("form").backboneLink(@model)

    return this
