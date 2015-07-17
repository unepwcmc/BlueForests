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

      @addFormEventListeners()
    )

  addFormEventListeners: ->
    $formEl = @$loginModalContainer.find('form')

    $formEl.submit( (ev) ->
      ev.preventDefault()
      $.ajax({
        type: 'POST'
        url: $formEl.attr('action')
        data: $formEl.serialize()
        complete: handleCompletedLoginWith($formEl)
      })
    )

  handleCompletedLoginWith = ($formEl) ->
    (xhr, status) ->
      if status == 'error'
        $formEl.find('.login-error').removeClass('hidden')
      else
        document.location.replace(xhr.getResponseHeader('Location'))
