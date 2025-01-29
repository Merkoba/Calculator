App.key_detection = () => {
  DOM.ev(document, `keydown`, (e) => {
    if (NeedContext.open) {
      return
    }

    let modal_open = App.msg.any_open()

    if (e.key === `Escape`) {
      if (modal_open) {
        App.msg.close_all()
      }
      else {
        App.check_clear()
      }
    }

    if (modal_open) {
      if (App.msg_confirm.is_open()) {
        if (e.key === `Enter`) {
          App.on_confirm()
          e.preventDefault()
          return
        }
      }

      return
    }

    if (e.key === `Enter`) {
      if (e.shiftKey && e.ctrlKey) {
        App.expand_value(App.get_input())
        e.preventDefault()
        return
      }
      else if (e.shiftKey) {
        App.press(App.get_var())
        e.preventDefault()
        return
      }
      else if (e.ctrlKey) {
        App.copy_input_down()
        e.preventDefault()
        return
      }

      App.focus_next_or_add()
      e.preventDefault()
      return
    }
    else if (e.key === `ArrowUp`) {
      if (e.shiftKey) {
        App.move_line_up()
      }
      else {
        App.cycle(`up`)
      }

      e.preventDefault()
      return
    }
    else if (e.key === `ArrowDown`) {
      if (e.shiftKey) {
        App.move_line_down()
      }
      else {
        App.cycle(`down`)
      }

      e.preventDefault()
      return
    }
    else if (e.key === `Tab`) {
      if (e.shiftKey) {
        App.cycle(`up`)
      }
      else {
        App.cycle(`down`)
      }

      e.preventDefault()
      return
    }
    else if (e.key === `Home`) {
      if (e.ctrlKey) {
        App.focus_first()
        e.preventDefault()
      }
    }
    else if (e.key === `End`) {
      if (e.ctrlKey) {
        App.focus_last()
        e.preventDefault()
      }
    }
  })
}