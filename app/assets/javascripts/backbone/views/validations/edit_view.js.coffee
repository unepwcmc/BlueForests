BlueCarbon.Views.Validations ||= {}

###
  A view not bound to a model to hold logic shared between the new and edit views
###
class BlueCarbon.Views.Validations.FormView extends Backbone.View
  constructor: (options) ->
    super(options)

    @map = BlueCarbon.Map
    @areas = options.areas
    @area = @areas.get(@model.get('area_id'))

    @model.bind("change:errors", () =>
      this.render()
    )

  actionChange: (e) ->
    @polygonDraw.disable()  if @polygonDraw?
    BlueCarbon.Map.removeLayer @polygon  if @polygon?

    $target = $(e.target)

    @polygonDraw = new L.Polygon.Draw(BlueCarbon.Map, {})
    @polygonDraw.enable()

    @map.on 'draw:poly-created', (e) =>
      @model.setCoordsFromPoints(e.poly.getLatLngs())
      @polygon = L.polygon(@model.coordsAsLatLngArray())
      @polygon.addTo(@map)

    @model.set('action', $target.text().toLowerCase())

  render: ->
    $(@el).html(@template(@model.toJSON()))
    $(@el).find('#form').html(window.JST['backbone/templates/validations/_form'](@model.toJSON()))

    # Build list of areas
    area_list_tpl = window.JST['backbone/templates/validations/_area_list'](@areas.toJSON())
    $(@el).find('#form').find('#areas').html(area_list_tpl)

    this.$("form").backboneLink(@model)

    return this

class BlueCarbon.Views.Validations.EditView extends BlueCarbon.Views.Validations.FormView
  template: JST["backbone/templates/validations/edit"]

  events:
    "click #save" : "save"
    "click #type label": "actionChange"

  save: (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.unset('radio-group')
    @model.unset("errors")

    @model.save(null,
      success : (validation) =>
        @model = validation
        window.location.hash = "/"

      error: (validation, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    )
