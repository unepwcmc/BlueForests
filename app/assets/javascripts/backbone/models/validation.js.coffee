class BlueCarbon.Models.Validation extends Backbone.Model
  paramRoot: 'validation'

  defaults:
    coodinates: null
    action: null
    recorded_at: null
    area_id: null
    integer: null

class BlueCarbon.Collections.ValidationsCollection extends Backbone.Collection
  model: BlueCarbon.Models.Validation
  url: '/validations'
