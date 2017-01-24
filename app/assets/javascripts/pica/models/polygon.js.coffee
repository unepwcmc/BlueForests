window.Pica ||= {}
Pica.Models ||= {}
Pica.Views ||= {}

class Pica.Models.Polygon extends Pica.Model
  constructor: (@app, options = {}) ->
    @throwIfNoApp()
    @attributes = if options.attributes? then options.attributes else {}
    @attributes['geometry'] ||= {type: 'Polygon'}

  isComplete: () ->
    return @get('geometry').coordinates?

  setGeomFromPoints: (points) ->
    points = for point in points
      [point.lng, point.lat]

    points.push points[0]

    @set('geometry',
      type: 'Polygon'
      coordinates: [points]
    )

  setGeomFromCircle: (latLng, radius) ->
    @set('geometry',
      type: 'Circle'
      coordinates: [latLng.lng, latLng.lat]
      radius: radius
    )

  asLeafletArguments: () ->
    args = []

    if (@get('geometry').type == 'Polygon')
      latLngs = []
      if @isComplete()
        for point in @get('geometry').coordinates[0]
          latLngs.push(new L.LatLng(point[1], point[0]))
      args.push latLngs
    else
      if @isComplete()
        point = @get('geometry').coordinates
        args = [new L.LatLng(point[1], point[0]), @get('geometry').radius]
      else
        args = [[], 0]

    return args

  url: () ->
    url = Pica.config.magpieUrl
    read: "#{url}/polygons/#{@get('id')}.json"
    create: "#{url}/areas_of_interest/#{@get('area_id')}/polygons.json"

  save: (options) =>
    options ||= {}

    if @get('area_id')?
      super options
    else
      @trigger('requestAreaId',
        success: (area, textStatus, jqXHR) =>
          @set('area_id', area.get('id'))
          if @get('area_id')
            @save options
          else
            options.error(
              @,
              {error: "Unable to get area id, so cannot save polygon"},
              jqXHR
            ) if options.error?
        error: (jqXHR, textStatus, errorThrown) =>
          console.log "Unable to save polygon:"
          console.log arguments
          console.log jqXHR.status
          console.log jqXHR.statusText
          console.log jqXHR.responseText
          options.error(
            jqXHR,
            textStatus,
            {
              error: "Unable to obtain areaId, cannot save polygon",
              parentError: errorThrown
            }
          ) if options.error?
      )

