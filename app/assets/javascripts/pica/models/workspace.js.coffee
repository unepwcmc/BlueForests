window.Pica ||= {}
Pica.Models ||= {}
Pica.Views ||= {}

class Pica.Models.Workspace extends Pica.Model
  constructor: (@app, @areasDefaults) ->
    @throwIfNoApp()
    @attributes = {}
    @areas = []

    @currentArea = new Pica.Models.Area(@app, @areasDefaults)
    @addArea(@currentArea)

  url: () ->
    "#{Pica.config.magpieUrl}/workspaces.json"

  addArea: (area) ->
    unless area?
      area = new Pica.Models.Area(@app, @areasDefaults)
    area.on('requestWorkspaceId', (options) =>
      if @get('id')?
        options.success(@)
      else
        @save(options)
    )
    @areas.push(area)

    area

  removeArea: (theArea) ->
    id = @areas.indexOf(theArea)
    area = @areas.splice(id, 1)[0]
    if area.get('id')?
      area.destroy()

  setCurrentArea: (theArea) ->
    @currentArea = null

    for area in @areas
      debugger
      if area.attributes.name == theArea?.attributes?.name
        @currentArea = area

  setCurrentAreaById: (areaId) ->
    for area in @areas
      if area.get('id') == areaId
        @currentArea = area

  save: (options) =>
    super options


