class BlueCarbon.Models.Area extends Backbone.Model
  paramRoot: 'area'

  defaults:
    title: null
    coordinates: null

class BlueCarbon.Collections.AreasCollection extends Backbone.Collection
  model: BlueCarbon.Models.Area
  url: '/areas'
