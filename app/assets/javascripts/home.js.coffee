$(document).ready ( ->
  addLoginHandler()
  addToolSelectionHandler()
  addToggle()
)

addLoginHandler = ->
  $loginButton = $('.login-button')
  $loginModalContainer = $('.login-modal-container')

  if $loginButton.length > 0 and $loginModalContainer.length > 0
    new LoginHandler(
      $loginButton, $loginModalContainer,
      {loginPath: $loginButton.data('login-path')}
    )

addToolSelectionHandler = ->
  $toolButton = $('.tool-button')
  $toolModalContainer = $('.tool-modal-container')

  if $toolButton.length > 0 and $toolModalContainer.length > 0
    new ToolSelectionHandler(
      $toolButton, $toolModalContainer
    )

addToggle = ->
  $("[data-toggle-trigger]").each((_i, el) ->
    new Toggle(el)
  )
