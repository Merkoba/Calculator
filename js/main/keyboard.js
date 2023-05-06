App.key_detection = () => {
  DOM.ev(document, `keydown`, (e) => {
  })

	DOM.ev(document, `keydown`, (e) => {
    let modal_open = App.msg.any_open()

		if (e.key === `Escape`) {
      if (modal_open) {
        App.msg.close_all()
      }
      else {
        App.clear_input()
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
			else {
				App.focus_next_or_add()
        e.preventDefault()
        return
			}
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
		else if (e.key === `ArrowUp`) {
			if (e.shiftKey) {
				App.move_line_up()
			}
			else {
				App.line_up()
			}

			e.preventDefault()
      return
		}
		else if (e.key === `ArrowDown`) {
			if (e.shiftKey) {
				App.move_line_down()
			}
			else {
				App.line_down()
			}

			e.preventDefault()
      return
		}
	})
}