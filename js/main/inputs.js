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

	let index = DOM.index(App.focused.input.parentNode)

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

App.focus_next = () => {
	let line = App.focused.input.parentNode.nextElementSibling

	if (line) {
		DOM.el(`.input`, line).focus()
	}
}

App.focus_prev = () => {
	let line = App.focused.input.parentNode.previousElementSibling

	if (line) {
		DOM.el(`.input`, line).focus()
	}
}

App.focus_input = (input) => {
	input.focus()
}

App.change_borders = () => {
	for (let input of DOM.els(`.input`)) {
		input.classList.remove(`input_focus`)
	}

	App.focused.input.classList.add(`input_focus`)
}

App.insert_text = (input, s) => {
	let ss = input.selectionStart
	let se = input.selectionEnd
	let value = input.value
	let new_value = value.substring(0, ss) + s + value.substring(se, value.length)
	App.focused.input.value = new_value
	App.focused.input.selectionStart = ss + s.length
	App.focused.input.selectionEnd = ss + s.length
	App.focus_if_isnt(input)
	App.update_results()
}

App.replace_text = (input, s) => {
	input.value = s
	App.focus_if_isnt(input)
	App.update_results()
}

App.erase_character = () => {
	let ss = App.focused.input.selectionStart
	let se = App.focused.input.selectionEnd
	let value = App.focused.input.value

	if (ss === se) {
		if (ss === 0) {
			App.focus_input(App.focused.input)
			return
		}

		let new_value = value.substring(0, ss - 1) + value.substring(se, value.length)
		App.focused.input.value = new_value
		App.focused.input.selectionStart = ss - 1
		App.focused.input.selectionEnd = ss - 1
		App.focus_if_isnt(App.focused.input)
		App.update_results()
	}
}

App.format_input = (input) => {
	let val = input.value

	if (val.trim() === ``) {
		return
	}

	if (val.trim().startsWith(`//`)) {
		return
	}

	try {
		val = App.math_normal.parse(val).toString({ parenthesis: `auto`, implicit: `show` })
	}
	catch (err) {
		return
	}

	App.replace_text(input, val)
}

App.format_all = () => {
	for (let input of DOM.els(`.input`)) {
		App.format_input(input)
	}
}

App.copy_input_down = () => {
	let og_var = DOM.dataset(App.focused.input, `variable`)
	let og_val = App.focused.input.value

	App.focus_next_or_add()

	if (og_var !== DOM.dataset(App.focused.input, `variable`)) {
		App.replace_text(App.focused.input, og_val)
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

App.focus_if_isnt = (input) => {
	if (input !== document.activeElement) {
		App.focus_input(input)
	}
}