class BlueCarbon.Models.Area extends Backbone.Model
  paramRoot: 'area'

class BlueCarbon.Collections.AreasCollection extends Backbone.Collection
  model: BlueCarbon.Models.Area
  url: '/areas.json'
