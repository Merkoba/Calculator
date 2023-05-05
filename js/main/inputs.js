App.focused = {
	input: null
}

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

App.set_input = (input, value) => {
  App.save_backup(input, value)
  input.value = value
}

App.save_backup = (input, value) => {
  DOM.dataset(input, `backup`, input.value || value)
}

App.get_backup = (input = App.focused.input) => {
  return DOM.dataset(input, `backup`)
}

App.undo = (input = App.focused.input) => {
  let backup = App.get_backup(input)

  if (backup) {
    input.value = backup
    App.calc()
  }

  App.focus_if_isnt(input)
}

App.insert_text = (input, text) => {
	let ss = input.selectionStart
	let se = input.selectionEnd
	let value = input.value
	let new_value = value.substring(0, ss) + text + value.substring(se, value.length)
  App.set_input(input, new_value)
	input.selectionStart = ss + text.length
	input.selectionEnd = ss + text.length
	App.focus_if_isnt(input)
	App.calc()
}

App.replace_text = (input, s, focus = true) => {
  App.set_input(input, s)

  if (focus) {
    App.focus_if_isnt(input)
  }

	App.calc()
}

App.erase = () => {
  let input = App.focused.input
	let ss = input.selectionStart
	let se = input.selectionEnd
	let value = input.value

	if (ss === se) {
		if (ss === 0) {
			App.focus_input()
			return
		}

		let new_value = value.substring(0, ss - 1) + value.substring(se, value.length)
    App.set_input(input, new_value)
	}
  else {
    let bt = input.value.slice(0, input.selectionStart)
    let at = input.value.slice(input.selectionEnd)
    App.set_input(input, bt + `` + at)
  }

  App.focus_if_isnt(input)
  input.selectionStart = ss
  input.selectionEnd = ss
  App.calc()
}

App.copy_input_down = () => {
	let og_var = App.get_var()
	let og_val = App.focused.input.value

	App.focus_next_or_add()

	if (og_var !== App.get_var()) {
		App.replace_text(App.focused.input, og_val)
	}
}

App.clear_input = (input = App.focused.input) => {
	if (input.value === ``) {
		return
	}

	App.replace_text(input, ``)
}

App.focus_if_isnt = (input = App.focused.input) => {
	if (input !== document.activeElement) {
		App.focus_input(input)
	}
}

App.get_input = (vr) => {
  let letter = App.get_letter(vr)
  return DOM.el(`#${letter}`)
}