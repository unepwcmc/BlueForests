$(document).ready ( ->
  $loginButton = $('.login-button')
  $loginModalContainer = $('.login-modal-container')

  if $loginButton.length > 0 and $loginModalContainer.length > 0
    new LoginHandler(
      $loginButton, $loginModalContainer,
      {loginPath: $loginButton.data('login-path')}
    )
)
