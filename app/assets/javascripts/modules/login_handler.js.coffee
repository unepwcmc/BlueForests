window.LoginHandler = class LoginHandler
  constructor: (@$loginButton, @$loginModalContainer, @opts) ->
    @addEventListeners()

  addEventListeners: ->
    @$loginButton.click( (ev) =>
      ev.preventDefault()
      @loadLoginModal()
    )

  loadLoginModal: ->
    $.get(@opts.loginPath, (html) =>
      @$loginModalContainer.html(html)
        .parent().removeClass('hidden')
    )

