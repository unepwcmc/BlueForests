$(document).ready( ->
  $newValidation = $('#new-validation')
  $showValidation = $('#show-validation')
  $editValidation = $('#edit-validation-page')

  if $newValidation.length > 0
    window.router = new BlueCarbon.Routers.ValidationsRouter(
      countryIso: $newValidation.data('country-iso')
      countryBounds: $newValidation.data('country-bounds')
    )

    Backbone.history.start()
    router.navigate('new', {trigger: true})

  if $showValidation.length > 0
    validation = $showValidation.data('validation')
    window.router = new BlueCarbon.Routers.ValidationsRouter(
      countryIso: $showValidation.data('country-iso')
      countryBounds: $showValidation.data('country-bounds')
      validations: [validation]
    )

    validationIdStr = validation.id.toString()
    
    Backbone.history.start()
    router.navigate(validationIdStr, {trigger: true})

  if $editValidation.length > 0
    validation = $editValidation.data('validation')
    window.router = new BlueCarbon.Routers.ValidationsRouter(
      countryIso: $editValidation.data('country-iso')
      countryBounds: $editValidation.data('country-bounds')
      validations: [validation]
    )
    validationId = validation.id

    Backbone.history.start()
    router.navigate(validationId + '/edit', {trigger: true})
)
