window.ToolSelectionHandler = class ToolSelectionHandler
  constructor: (@$toolButton, @$toolModalContainer, @opts) ->
    @addEventListeners()

  addEventListeners: ->
    @$toolButton.click( (ev) =>
      ev.preventDefault()

      @$toolModalContainer.removeClass('hidden')
        .parent().removeClass('hidden')

      $closeButtonEl = @$toolModalContainer.find('.x-button')
      handleCloseButton($closeButtonEl, @$toolModalContainer)
    )

  handleCloseButton = ($closeButtonEl, $targetEl) ->
    $closeButtonEl.click( (ev) ->
      $targetEl.addClass('hidden').parent().addClass('hidden')
    )
