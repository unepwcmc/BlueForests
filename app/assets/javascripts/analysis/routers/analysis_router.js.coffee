window.Backbone ||= {}
window.Backbone.Routers ||= {}

class Backbone.Routers.AnalysisRouter extends Backbone.Router
  routes:
    ".*"           : "index"
    "analysis/:id" : "show"

  initialize: () ->
    @tabsView = new Backbone.Diorama.ManagedRegion()

  index: ->
    @tabsView.showView(new Backbone.Views.TabsView())
    $('#sidebar-content').html(@tabsView.$el)

  show: (id) ->
    @tabsView.showView(new Backbone.Views.TabsView(areaId: id))
    $('#sidebar-content').html(@tabsView.$el)
