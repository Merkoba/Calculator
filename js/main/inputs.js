App.get_first_input = () => {
	return DOM.els(`.input`)[0]
}

App.get_last_input = () => {
	return DOM.els(`.input`).slice(-1)[0]
}

App.go_to_first_input = () => {
	App.focus_input(App.get_first_input())
}

App.go_to_last_input = () => {
	App.focus_input(App.get_last_input())
}

App.move_caret_to_end = (input) => {
	input.setSelectionRange(input.value.length, input.value.length)
}

App.cycle_inputs = (direction) => {
	if (DOM.els(`.input`).length === 1) {
		return
	}

	let index = DOM.index(App.get_line_el())

	if (direction === `down`) {
		if (index === (DOM.els(`.input`).length - 1)) {
			App.go_to_first_input()
		}
		else {
			App.focus_next()
		}
	}
	else {
		if (index === 0) {
			App.go_to_last_input()
		}
		else {
			App.focus_prev()
		}
	}
}

App.focus_input = (input = App.focused.input) => {
  if (document.activeElement === input) {
    App.focus_line(input)
  }
  else {
    input.focus()
  }
}

App.change_borders = () => {
	for (let input of DOM.els(`.input`)) {
		input.classList.remove(`input_focus`)
	}

	App.focused.input.classList.add(`input_focus`)
}

App.insert_text = (input, text) => {
	let ss = input.selectionStart
	let se = input.selectionEnd
	let value = input.value
	let new_value = value.substring(0, ss) + text + value.substring(se, value.length)
	input.value = new_value
	input.selectionStart = ss + text.length
	input.selectionEnd = ss + text.length
	App.focus_if_isnt(input)
	App.calc()
}

App.replace_text = (input, s, focus = true) => {
	input.value = s

  if (focus) {
    App.focus_if_isnt(input)
  }

	App.calc()
}

App.erase_character = () => {
	let ss = App.focused.input.selectionStart
	let se = App.focused.input.selectionEnd
	let value = App.focused.input.value

	if (ss === se) {
		if (ss === 0) {
			App.focus_input()
			return
		}

		let new_value = value.substring(0, ss - 1) + value.substring(se, value.length)
		App.focused.input.value = new_value
		App.focused.input.selectionStart = ss - 1
		App.focused.input.selectionEnd = ss - 1
		App.focus_if_isnt(App.focused.input)
		App.calc()
	}
}

App.format_input = (input, replace = true) => {
	let val = input.value

	if (val.trim() === ``) {
		return
	}

	if (val.trim().startsWith(`//`)) {
		return
	}

	try {
		val = App.format_calc(val)
	}
	catch (err) {
		return
	}

  if (replace) {
    App.replace_text(input, val, false)
    App.focus_if_isnt()
  }
  else {
    return val
  }
}

App.format_all = () => {
	for (let input of DOM.els(`.input`)) {
		App.format_input(input)
	}
}

App.copy_input_down = () => {
	let og_var = App.get_var()
	let og_val = App.focused.input.value

	App.focus_next_or_add()

	if (og_var !== App.get_var()) {
		App.replace_text(App.focused.input, og_val)
	}
}

App.check_clear = () => {
  if (App.focused.input.value === ``) {
    App.remove_line()
  }
  else {
    App.clear_input(App.focused.input)
  }
}

App.clear_input = (input) => {
	if (input.value === ``) {
		return
	}

	App.replace_text(input, ``)
}

App.toggle_comment = (input) => {
	if (!input.value.trim().startsWith(`//`)) {
		App.replace_text(input, `// ` + input.value.trim())
	}
	else {
		App.replace_text(input, input.value.replace(`//`, ``).trim())
	}
}

App.focus_if_isnt = (input = App.focused.input) => {
	if (input !== document.activeElement) {
		App.focus_input(input)
	}
}