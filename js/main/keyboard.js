App.key_detection = () => {
	DOM.ev(document, `keydown`, (e) => {
		if (e.key === `Escape`) {
      if (App.msg.is_open()) {
        App.msg.close()
        App.focus_if_isnt()
      }
      else {
        App.clear_input()
      }
		}
		else if (e.key === `Enter`) {
			if (e.shiftKey && e.ctrlKey) {
				App.expand_value(App.focused.input)
			}
			else if (e.shiftKey) {
				App.press(App.get_var())
			}
			else if (e.ctrlKey) {
				App.copy_input_down()
			}
			else {
				App.focus_next_or_add()
			}
		}
		else if (e.key === `Tab`) {
			if (e.shiftKey) {
				App.cycle_inputs(`up`)
			}
			else {
				App.cycle_inputs(`down`)
			}

			e.preventDefault()
		}
		else if (e.key === `ArrowUp`) {
			if (e.shiftKey) {
				App.move_line_up()
			}
			else {
				App.line_up()
			}

			e.preventDefault()
		}
		else if (e.key === `ArrowDown`) {
			if (e.shiftKey) {
				App.move_line_down()
			}
			else {
				App.line_down()
			}

			e.preventDefault()
		}
	})
}