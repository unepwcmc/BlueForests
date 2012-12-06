BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.NewView extends Backbone.View
  template: JST["backbone/templates/validations/form"]

  events:
    "click #update-validation": "save"
    "click #type" : "type_change"

  constructor: (options) ->
    super(options)
    @model = new @collection.model()

    @model.bind("change:errors", () =>
      this.render()
    )

  type_change: (e) ->
    e.stopPropagation()
    e.preventDefault()

    @polygonDraw.disable()  if @polygonDraw?
    BlueCarbon.Map.removeLayer @polygon  if @polygon?

    $target = $(e.target)

    if $target.hasClass('active')
      $target.removeClass('active')
      return
    else
      $target.addClass('active')
      $target.siblings().removeClass('active')

    @polygonDraw = new L.Polygon.Draw(BlueCarbon.Map, {})
    @polygonDraw.enable()

    BlueCarbon.Map.on 'draw:poly-created', (e) =>
      @model.setCoordsFromPoints(e.poly.getLatLngs())
      @polygon = e.poly
      @polygon.addTo(BlueCarbon.Map)

    @model.set('action', $target.text().toLowerCase())

  save: (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.unset("errors")

    @collection.create(@model.toJSON(),
      success: (validation) =>
        @model = validation
        window.location.hash = "/#{@model.id}"

      error: (validation, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    )

  render: ->
    $(@el).html(@template(@model.toJSON() ))

    this.$("form").backboneLink(@model)

    return this
