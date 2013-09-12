window.Backbone ||= {}
window.Backbone.Views ||= {}

class Backbone.Views.TabsView extends Backbone.View
  template: JST['tabs']

  events:
    'click .tabs li':     'changeTab'
    'click #add-area':    'addArea'
    'click #delete-area': 'deleteArea'

  initialize: (options = {}) ->
    @currentTab = new Backbone.Diorama.ManagedRegion()
    @workspace = window.pica.currentWorkspace

    @setAreaById(options.areaId) if options.areaId?
    @workspace.areas[0].setName('Area #1')


  changeTab: (event) ->
    area_index = $(event.target).data('area-id')
    area = @workspace.areas[area_index]

    @workspace.setCurrentArea(area)
    @render()

  addArea: ->
    if pica.currentWorkspace.areas.length <= 3
      app = window.pica
      area = new Pica.Models.Area(window.pica)
      area.setName("Area ##{pica.currentWorkspace.areas.length + 1}")

      @workspace.addArea(area)
      @workspace.setCurrentArea(area)
      @render()

  setAreaById: (id) ->
    area = new Pica.Models.Area()
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

    unless view?
      view = new Backbone.Views.AreaView(area: @workspace.currentArea)

    @currentTab.showView(view)
    @$el.find('#area').html(@currentTab.$el)

    this

  onClose: ->
    @currentTab.currentView.close()
