App.insert_text = (input, text) => {
	let ss = input.selectionStart
	let se = input.selectionEnd
	let value = input.value
	let new_value = value.substring(0, ss) + text + value.substring(se, value.length)
  App.set_input(input, new_value)
	input.selectionStart = ss + text.length
	input.selectionEnd = ss + text.length
	App.focus_input(input)
	App.calc()
}

App.erase = () => {
  let input = App.get_input()
	let ss = input.selectionStart
	let se = input.selectionEnd
	let value = input.value
	let highlighted

	if (ss === se) {
		if (ss === 0) {
			App.focus_input()
			return
		}

		let new_value = value.substring(0, ss - 1) + value.substring(se, value.length)
    App.set_input(input, new_value)
		highlighted = false
	}
  else {
    let bt = input.value.slice(0, input.selectionStart)
    let at = input.value.slice(input.selectionEnd)
    App.set_input(input, bt + `` + at)
		highlighted = true
  }

  App.focus_input(input)

	if (highlighted) {
		input.selectionStart = ss
		input.selectionEnd = ss
	}
	else {
		input.selectionStart = ss - 1
		input.selectionEnd = ss - 1
	}

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

App.format_all = () => {
	for (let input of App.get_inputs()) {
		let inp = input.value.trim()

		if (inp) {
			let value = App.format_input_string(inp)
			input.value = value
		}
	}
}

App.format_input_string = (value) => {
	try {
		return App.math_normal.parse(value).toString({parenthesis: `auto`, implicit: `show`, notation: `fixed`})
	}
	catch (err) {
		return value
	}
}