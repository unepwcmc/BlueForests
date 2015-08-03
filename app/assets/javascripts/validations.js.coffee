$(document).ready( ->
  $newValidation = $('#new-validation')

  if $newValidation.length > 0
    window.router = new BlueCarbon.Routers.ValidationsRouter(
      countryIso: $newValidation.data('country-iso')
      countryBounds: $newValidation.data('country-bounds')
    )

    Backbone.history.start()
    router.navigate('new', {trigger: true})
)
