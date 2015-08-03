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
        .removeClass('hidden').parent().removeClass('hidden')

      @addFormEventListeners()
    )

  addFormEventListeners: ->
    $formEl = @$loginModalContainer.find('form')
    $rememberMeEl = @$loginModalContainer.find('.remember-me')
    $rememberMeCheckboxEl = @$loginModalContainer.find('.remember-me-checkbox')
    $closeButtonEl = @$loginModalContainer.find('.x-button')

    handleRememberMeCheckbox($rememberMeEl, $rememberMeCheckboxEl)
    handleCloseButton($closeButtonEl, @$loginModalContainer)

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

  handleRememberMeCheckbox = ($visibleEl, $hiddenCheckboxEl) ->
    $visibleEl.click( (ev) ->
      $visibleEl.toggleClass('checked')
      $hiddenCheckboxEl.attr('checked', !$hiddenCheckboxEl.attr('checked'))
    )

  handleCloseButton = ($closeButtonEl, $targetEl) ->
    $closeButtonEl.click( (ev) ->
      $targetEl.empty().addClass('hidden').parent().addClass('hidden')
    )
