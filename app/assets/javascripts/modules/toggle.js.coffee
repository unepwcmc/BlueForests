window.Toggle = class Toggle
  constructor: (el) ->
    $el = $(el)
    elClosedText = $el.data("toggle-text-closed")

    toggleId  = $el.data("toggle-trigger")
    $targetEl = $("[data-toggle-target='#{toggleId}']")
    $targetAltEl = $("[data-toggle-target-alt='#{toggleId}']")
    $switchEl = $("[data-toggle-switch='#{toggleId}']")

    $el.click((ev) ->
      ev.preventDefault()

      $el.toggleClass("toggle--active")
      $targetEl.toggleClass("u-hide")
      $targetAltEl.toggleClass("u-hide")

      if($switchEl.length > 0)
        $switchEl.toggleClass("fa-chevron-down fa-chevron-up")

      if(elClosedText)
        if($switchEl.hasClass("fa-chevron-down"))
          $el.find("span").html(elClosedText)
        else
          $el.find("span").html("")
    )
