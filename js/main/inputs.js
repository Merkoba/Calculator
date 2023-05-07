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

App.focus_input = (input = App.get_input()) => {
  if (document.activeElement === input) {
    App.focus_line(App.get_line_parent(input))
  }
  else {
    input.focus()
  }
}

App.set_input = (input, value) => {
  input.value = value
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
  let input = App.get_input()
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
	let og_val = App.get_input().value

	App.focus_next_or_add()

	if (og_var !== App.get_var()) {
		App.replace_text(App.get_input(), og_val)
	}
}

App.clear_input = (input = App.get_input()) => {
	if (input.value === ``) {
		return
	}

	App.replace_text(input, ``)
}

App.focus_if_isnt = (input = App.get_input()) => {
	if (input !== document.activeElement) {
		App.focus_input(input)
	}
}