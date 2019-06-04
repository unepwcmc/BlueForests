window.Backbone ||= {}
window.Backbone.Views ||= {}

class Backbone.Views.TabsView extends Backbone.View
  template: JST['tabs']

  events:
    'click #add-area':               'addArea'
    'click .tabs [data-area-id]':    'changeTab'
    'click .tabs #field-sites-tab':  'changeTab'
    'click #delete-area':            'deleteArea'

  initialize: (options = {}) ->
    @currentTab = new Backbone.Diorama.ManagedRegion()
    @workspace = window.pica.currentWorkspace

    if options.areaId?
      @setAreaById(options.areaId)
    else
      @workspace.selecting_site = true
      @workspace.setCurrentArea(null)

    @workspace.areas[0].setName(polyglot.t("analysis.area_1"))


  changeTab: (event) ->
    $target = $(event.target)

    if($target.attr("id") == "field-sites-tab")
      @workspace.selecting_site = true
      @workspace.setCurrentArea(null)
    else
      @workspace.selecting_site = false
      area_index = $target.data("area-id")
      area = @workspace.areas[area_index]

      @workspace.setCurrentArea(area)

    @render()

  addArea: ->
    if @workspace.areas.length <= 3
      area = @workspace.addArea()
      area.setName(
        polyglot.t("analysis.area_#{pica.currentWorkspace.areas.length}")
      )
      @workspace.setCurrentArea(area)
      @render()

  setAreaById: (id) ->
    area = new Pica.Models.Area(window.pica)
    area.set('id', id)

    area.fetch(
      success: (area) =>
        @workspace.areas[0] = area
        @workspace.setCurrentArea(area)
        @render()
    )

  deleteArea: (event) ->
    area = @workspace.currentArea
    @workspace.removeArea(area)

    @addArea() if @workspace.areas.length == 0

    lastArea = @workspace.areas[@workspace.areas.length - 1]
    @workspace.setCurrentArea(lastArea)

    @render()

  render: (view = null) ->
    @$el.html(@template(workspace: @workspace))

    if not view?
      if @workspace.selecting_site
        view = new Backbone.Views.FieldSitesView()
        view.on("selected", =>
          @workspace.selecting_site = false
          @workspace.setCurrentArea(@workspace.areas[0])
          @render()
        )
      else
        view = new Backbone.Views.AreaView(area: @workspace.currentArea)

    @currentTab.showView(view)
    @$el.find('#area').html(@currentTab.$el)

    this

  onClose: ->
    @currentTab.currentView.close()
