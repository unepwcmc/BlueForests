window.Backbone ||= {}
window.Backbone.Views ||= {}

class Backbone.Views.FieldSitesView extends Backbone.View
  template: JST['field_sites']

  events:
    'click .field-site': 'fitBounds'
    'mouseenter .field-site': 'highlight'
    'mouseleave .field-site': 'hide'

  render: =>
    iso = $(Pica.config.map.getContainer()).data("country-iso")
    base = "https://carbon-tool.carto.com/api/v2/sql"
    query = "SELECT * FROM blueforests_field_sites_staging WHERE country_id = '#{iso}'"

    $.getJSON("#{base}?format=GeoJSON&q=#{query}", (data) =>
      @$el.html(@template(field_sites: data.features))
    )

    this

  fitBounds: (event) =>
    event.preventDefault()

    if @currentSite
      @hide()

    $target = $(event.target)

    coordinates = _.map($target.data("site-bounds"), (coords) ->
      [coords[1], coords[0]]
    )

    poly = L.polyline(coordinates)
    Pica.config.map.fitBounds(poly.getBounds())
    @trigger("selected")

  highlight: (event) ->
    $target = $(event.target)

    coordinates = _.map($target.data("site-bounds"), (coords) ->
      [coords[1], coords[0]]
    )

    poly = L.polygon(coordinates,
      stroke: true,
      weight: 2,
      fill: true,
      fillColor: '#fb0303',
      fillOpacity: 0.5
    )

    poly.addTo(Pica.config.map)
    @currentSite = poly

  hide: (event) ->
    @currentSite.remove()
    delete @currentSite

