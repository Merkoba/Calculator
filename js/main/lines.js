App.setup_lines = () => {
  App.get_max_line_length()
}

App.line_up = () => {
	App.focus_prev()
}

App.line_down = () => {
	App.focus_next()
}

App.move_line_up = () => {
	let index = DOM.index(App.get_line())

	if (index === 0) {
		return
	}

	let line = App.get_line(App.get_input())
	let inp1 = App.get_input(line)
	let inp2 = App.get_input(line.previousElementSibling)
	let cmt1 = App.get_comment(line)
	let cmt2 = App.get_comment(line.previousElementSibling)

	let vr1 = App.get_var(inp1)
	let vr2 = App.get_var(inp2)

	let cv = `$@!#` + App.get_letter(vr1)
	let cnv = `$@!#` + App.get_letter(vr2)

	let re = new RegExp(`\\$` + App.get_letter(vr1), `g`)
	let re2 = new RegExp(`\\$` + App.get_letter(vr2), `g`)

	for (let input of DOM.els(`.input`)) {
		let vl = input.value.replace(re, cnv)
		vl = vl.replace(re2, cv)
		App.set_input(input, vl.replace(/@!#/g, ``))
	}

	let val = inp1.value
	let nval = inp2.value

	App.set_input(inp1, nval)
	App.set_input(inp2, val)

	val = cmt1.value
	nval = cmt2.value

	App.set_comment(cmt1, nval)
	App.set_comment(cmt2, val)

	App.focus_if_isnt(inp2)
	App.calc()
}

App.move_line_down = () => {
	let index = DOM.index(App.get_line())

	if (index === (App.get_lines().length - 1)) {
		return
	}

	let line = App.get_line(App.get_input())
	let inp1 = App.get_input(line)
	let inp2 = App.get_input(line.nextElementSibling)
	let cmt1 = App.get_comment(line)
	let cmt2 = App.get_comment(line.nextElementSibling)

	let vr1 = App.get_var(inp1)
	let vr2 = App.get_var(inp2)

	let cv = `$@!#` + App.get_letter(vr1)
	let cnv = `$@!#` + App.get_letter(vr2)

	let re = new RegExp(`\\$` + App.get_letter(vr1), `g`)
	let re2 = new RegExp(`\\$` + App.get_letter(vr2), `g`)

	for (let input of DOM.els(`.input`)) {
		let vl = input.value.replace(re, cnv)
		vl = vl.replace(re2, cv)
		App.set_input(input, vl.replace(/@!#/g, ``))
	}

	let val = inp1.value
	let nval = inp2.value

	App.set_input(inp1, nval)
	App.set_input(inp2, val)

	val = cmt1.value
	nval = cmt2.value

	App.set_comment(cmt1, nval)
	App.set_comment(cmt2, val)

	App.focus_if_isnt(inp2)
	App.calc()
}

App.get_last_line = () => {
	return App.get_lines().slice(-1)[0]
}

App.remove_last_line = () => {
	if (App.get_lines().length === 1) {
		App.clear_input()
		return
	}

	let line = App.get_last_line()
	let input = App.get_last_input()

	if (input === App.get_input()) {
		App.get_input(line.previousElementSibling).focus()
	}

	line.remove()
	App.calc()
}

App.focus_next_or_add = () => {
	let next_all = DOM.next_all(App.get_line(), `.line`)
	let found_line = false

	for (let item of next_all) {
		let inp = App.get_input(item)

		if (inp.value === ``) {
			App.focus_input(inp)
			found_line = true
			return false
		}
	}

	if (!found_line) {
		App.add_line()
	}
}

App.add_line = (value = false) => {
	let num_lines = App.get_lines().length
	let letter

	if (num_lines === App.max_line_length) {
		return
	}

	if (num_lines === 0) {
		letter = `a`
	}
	else {
		let last_var = App.get_var(App.get_last_input())
		letter = App.get_letter(App.increase_var(last_var))
	}

	if (!value) {
		value = ``
	}

  let vr = `$` + letter
	let line = DOM.create(`div`, `line`, `line_${letter}`)

  line.innerHTML = App.template_line({
    letter: letter,
    value: value,
  })

	DOM.el(`#lines`).appendChild(line)
	let input = App.get_input(line)
	let comment = App.get_comment(line)
	let variable = App.get_variable(line)
	App.line = line

	DOM.ev(App.get_menu(line), `click`, (e) => {
		App.show_menu(e.target, input)
	})

	DOM.ev(input, `focus`, (e) => {
		App.line = line
		App.change_borders(input)
    App.focus_line()
	})

	DOM.ev(comment, `focus`, (e) => {
		App.line = line
		App.change_borders(comment)
    App.focus_line()
	})

	DOM.ev(input, `input`, () => {
		App.calc()
	})

	DOM.ev(comment, `input`, () => {
		App.snapshot
		()
	})

	DOM.ev(variable, `click`, () => {
		App.press(vr)
	})

	DOM.ev(variable, `contextmenu`, (e) => {
		App.show_var_menu(variable)
		e.preventDefault()
	})

	DOM.ev(input, `keydown`, (e) => {
		if (e.key === `ArrowUp` || e.key === `ArrowDown`) {
			e.preventDefault()
		}
	})

	DOM.dataset(line, `variable`, vr)
	App.move_caret_to_end(input)
  App.show_result(line, `Empty`)
	App.focus_input(input)

  return line
}

App.add_line_before = () => {
	App.move_lines_down()
}

App.add_line_after = () => {
	let index = DOM.index(App.get_line())

	if (index === App.get_lines().length - 1) {
		App.add_line()
	}
	else {
		App.move_lines_down(true)
	}
}

App.remove_line = () => {
	let index = DOM.index(App.get_line())

	if (App.get_lines().length === 1) {
		App.clear_input()
	}
	else if (index === App.get_lines().length - 1) {
		App.remove_last_line()
	}
	else {
		App.move_lines_up()
	}

	App.focus_if_isnt()
}

App.remove_all_lines = () => {
	App.undefine_variables()
	DOM.el(`#lines`).innerHTML = ``
}

App.move_lines_up = () => {
	let line_length = App.get_lines().length

	if (line_length === 1) {
		return
	}

	let input = App.get_input()
	let line = App.get_line(input)
	let vr = App.get_var(input)
	let index = DOM.index(line)

	if (index === (line_length - 1)) {
		if (input === App.get_input()) {
			App.get_input(line.previousElementSibling).focus()
		}

		line.remove()
		App.calc()
		return
	}

	let lines = App.get_lines()

	for (let i=0; i<line_length; i++) {
		let ln = lines[i]
		let inp = App.get_input(ln)
		let val = inp.value

		if (val.trim()) {
			val = val.replace(/\$[a-z]+/g, (match) => {
				if (match === vr) {
					return ``
				}

				let ni = App.get_var_index(match)

				if (ni > index && ni < line_length) {
					return App.decrease_var(match)
				}

				return match
			})

			App.set_input(inp, val)
		}
	}

	for (let i=index+1; i<line_length; i++) {
		let line = App.get_lines()[i]

		let inp1 = App.get_input(line)
		let inp2 = App.get_input(App.get_line(inp1).previousElementSibling)
		App.set_input(inp2, inp1.value)
		App.set_input(inp1, ``)

		let cmt1 = App.get_comment(line)
		let cmt2 = App.get_comment(App.get_line(cmt1).previousElementSibling)
		App.set_input(cmt2, cmt1.value)
		App.set_comment(cmt1, ``)
	}

	App.get_last_line().remove()
	App.calc()
}

App.move_lines_down = (alt = false) => {
	let line_length = App.get_lines().length

	if (line_length === App.max_line_length) {
		return
	}

	if (alt) {
		App.focus_next()
	}

	let input = App.get_input()
	let line = App.get_line(input)
	let comment = App.get_comment(line)
	let index = DOM.index(line)
	let lines = App.get_lines()

	for (let i=0; i<line_length; i++) {
		let ln = lines[i]
		let inp = App.get_input(ln)
		let val = inp.value

		if (val.trim() === ``) {
			continue
		}

		val = val.replace(/\$[a-z]+/g, (match) => {
			let ni = App.get_var_index(match)

			if (ni >= index && ni < line_length) {
				return App.increase_var(match)
			}

			return match
		})

		App.set_input(inp, val)
	}

	App.add_line()
	line_length = App.get_lines().length

	for (let i=line_length-1; i>index; i--) {
		let inp1 = App.get_input(App.get_lines()[i])
		let inp2 = App.get_input(App.get_line(inp1).previousElementSibling)
		App.set_input(inp1, inp2.value)

		let cmt1 = App.get_comment(App.get_lines()[i])
		let cmt2 = App.get_comment(App.get_line(cmt1).previousElementSibling)
		App.set_comment(cmt1, cmt2.value)
	}

	App.set_input(input, ``)
	App.set_comment(comment, ``)
	App.focus_input(input)
	App.calc()
}

App.get_max_line_length = () => {
	App.max_line_length = App.get_var_index(`$zz`) + 1
}

App.new_sheet = () => {
	App.confirm(`Start again?`, () => {
		App.remove_all_lines()
		App.clear_snapshots()
		App.add_line()
		App.calc()
	})
}

App.get_line = (el = App.line) => {
  return el.closest(`.line`)
}

App.focus_next = (cls = `.input`) => {
	let line = App.get_line().nextElementSibling

	if (line) {
		DOM.el(cls, line).focus()
	}
}

App.focus_prev = () => {
	let line = App.get_line().previousElementSibling

	if (line) {
		App.focus_input(App.get_input(line))
	}
}

App.show_menu = (button, input) => {
  let items = []

  items.push({
    text: `Expand Results`,
    action: () => {
			App.confirm(`Expand variables (Results)?`, () => {
				App.expand_value(input, true, false)
			})
    }
  })

	items.push({
    text: `Expand Full`,
    action: () => {
			App.confirm(`Expand variables (Full)?`, () => {
				App.expand_value(input, true, true)
			})
    }
  })

	items.push({
		separator: true
	})

	items.push({
    text: `Move Line Up`,
    action: () => {
      App.move_line_up()
    }
  })

	items.push({
    text: `Move Line Down`,
    action: () => {
      App.move_line_down()
    }
  })

	items.push({
		separator: true
	})

	items.push({
    text: `Add Line Up`,
    action: () => {
			App.add_line_before()
    }
  })

	items.push({
    text: `Add Line Down`,
    action: () => {
			App.add_line_after()
    }
  })

	items.push({
		separator: true
	})

	items.push({
    text: `Remove Line`,
    action: () => {
			App.confirm(`Remove the line?`, () => {
				App.remove_line()
			})
    }
  })

	items.push({
		separator: true
	})

  items.push({
    text: `View Result`,
    action: () => {
      App.view_result(input)
    }
  })

  App.focus_input(input)
  NeedContext.show_on_element(button, items)
}

App.focus_line = (line = App.line) => {
  line.scrollIntoView({block: `center`, behavior: `instant`})
}

App.cycle = (direction) => {
  let line = App.get_line()
	let index = DOM.index(line)
  let is_input = document.activeElement.classList.contains(`input`)
  let is_comment = document.activeElement.classList.contains(`comment`)

	if (direction === `down`) {
    if (is_comment) {
      App.focus_input(App.get_input(line))
    }
    else {
      if (index === (DOM.els(`.input`).length - 1)) {
        App.go_to_first_comment()
      }
      else {
        App.focus_next(`.comment`)
      }
    }
	}
	else {
    if (is_input) {
      App.get_comment(line).focus()
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
}

App.go_to_first_comment = () => {
	App.get_first_comment().focus()
}

App.get_first_comment = () => {
	return DOM.els(`.comment`)[0]
}

App.change_borders = (el) => {
	for (let focused of DOM.els(`.input_focus`)) {
		focused.classList.remove(`input_focus`)
	}

	el.classList.add(`input_focus`)
}

App.set_comment = (comment, value) => {
	comment.value = value
}

App.get_var = (el = App.line) => {
	return DOM.dataset(el.closest(`.line`), `variable`)
}

App.show_var_menu = (button) => {
	if (App.get_line(button) === App.get_line(App.get_input())) {
		return
	}

	let vr = App.get_var(button)
	let items = []

	items.push({
    text: `+ (Add)`,
    action: () => {
			App.press(`+${vr}`)
    }
  })

	items.push({
    text: `- (Subtract)`,
    action: () => {
			App.press(`-${vr}`)
    }
  })

	items.push({
    text: `* (Multiply)`,
    action: () => {
			App.press(`*${vr}`)
    }
  })

	items.push({
    text: `/ (Divide)`,
    action: () => {
			App.press(`/${vr}`)
    }
  })

	NeedContext.show_on_element(button, items)
}

App.get_line_by_var = (vr) => {
	return DOM.el(`#line_${App.get_letter(vr)}`)
}

App.get_line_parent = (el) => {
	return el.closest(`.line`)
}

// Getters

App.get_input = (line = App.line) => {
  return DOM.el(`.input`, line)
}

App.get_comment = (line = App.line) => {
  return DOM.el(`.comment`, line)
}

App.get_variable = (line = App.line) => {
  return DOM.el(`.variable`, line)
}

App.get_menu = (line = App.line) => {
  return DOM.el(`.menu`, line)
}

App.get_result = (line = App.line) => {
  return DOM.el(`.result`, line)
}

App.get_lines = () => {
	return DOM.els(`.line`)
}

//

App.trim_lines = () => {
	let lines = App.get_lines()

	if (lines.length > 1) {
		let last_with_content

		for (let line of lines) {
			if (App.get_comment(line).value.trim() || App.get_input(line).value.trim()) {
				last_with_content = line
			}
		}

		if (!last_with_content) {
			return
		}

		let reached = false

		for (let line of lines) {
			if (line === last_with_content) {
				reached = true
				continue
			}

			if (reached) {
				line.remove()
			}
		}
	}
}

// Focus

App.focus_comment = (comment = App.get_comment()) => {
	comment.focus()
}

App.focus_input = (input = App.get_input()) => {
  input.focus()
}

//