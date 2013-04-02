window.Backbone ||= {}
window.Backbone.Views ||= {}

class Backbone.Views.TabsView extends Backbone.View
  template: JST['tabs']

  events:
    'click .tabs': 'changeTab'
    'click .add-area': 'addArea'
    'click .delete-area': 'deleteArea'

  initialize: (options) ->
    @currentTab = new Backbone.Diorama.ManagedRegion()
    @workspace = window.pica.currentWorkspace

    @workspace.areas[0].setName('Area #1')

    @render()

  changeTab: (event) ->
    area_index = $(event.target).data('area-id')
    area = @workspace.areas[area_index]

    @workspace.setCurrentArea(area)
    @render()

  addArea: (event) ->
    if pica.currentWorkspace.areas.length <= 3
      area = new Pica.Models.Area()
      area.setName("Area ##{pica.currentWorkspace.areas.length + 1}")

      @workspace.addArea(area)
      @workspace.setCurrentArea(area)
      @render()

  deleteArea: (event) ->
    area = @workspace.currentArea
    @workspace.removeArea(area)

    @addArea() if @workspace.areas.length == 0

    @render()

  render: ->
    @$el.html(@template(workspace: @workspace))

    areaView = new Backbone.Views.AreaView(area: @workspace.currentArea)
    @currentTab.showView(areaView)
    @$el.find('#stats').html(@currentTab.$el)

    return @
