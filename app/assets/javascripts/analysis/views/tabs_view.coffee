window.Backbone ||= {}
window.Backbone.Views ||= {}

class Backbone.Views.TabsView extends Backbone.View
  template: JST['tabs']

  events:
    'click .tabs li':     'changeTab'
    'click #add-area':    'addArea'
    'click #delete-area': 'deleteArea'
    'click .tabs li.help': 'showHelp'

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

  showHelp: ->
    helpView = new Backbone.Views.HelpView()
    @render(helpView)

  addArea: (event) ->
    if pica.currentWorkspace.areas.length <= 3
      area = new Pica.Models.Area()
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

    if !view?
      view = new Backbone.Views.AreaView(area: @workspace.currentArea)

    @currentTab.showView(view)
    @$el.find('#area').html(@currentTab.$el)

    return @
