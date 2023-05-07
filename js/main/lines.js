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
	let inp1 = DOM.el(`.input`, line)
	let inp2 = DOM.el(`.input`, line.previousElementSibling)
	let cmt1 = DOM.el(`.comment`, line)
	let cmt2 = DOM.el(`.comment`, line.previousElementSibling)

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

	if (index === (DOM.els(`.line`).length - 1)) {
		return
	}

	let line = App.get_line(App.get_input())
	let inp1 = DOM.el(`.input`, line)
	let inp2 = DOM.el(`.input`, line.nextElementSibling)
	let cmt1 = DOM.el(`.comment`, line)
	let cmt2 = DOM.el(`.comment`, line.nextElementSibling)

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
	return DOM.els(`.line`).slice(-1)[0]
}

App.remove_last_line = () => {
	if (DOM.els(`.line`).length === 1) {
		App.clear_input()
		return
	}

	let line = App.get_last_line()
	let input = App.get_last_input()

	if (input === App.get_input()) {
		DOM.el(`.input`, line.previousElementSibling).focus()
	}

	line.remove()
	App.calc()
}

App.focus_next_or_add = () => {
	let next_all = DOM.next_all(App.get_line(), `.line`)
	let found_line = false

	for (let item of next_all) {
		let inp = DOM.el(`.input`, item)

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
	let num_lines = DOM.els(`.line`).length
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
	let input = DOM.el(`.input`, line)
	let comment = DOM.el(`.comment`, line)
	let variable = DOM.el(`.variable`, line)
	App.line = line

	DOM.ev(DOM.el(`.menu`, line), `click`, (e) => {
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
		App.save_state()
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

	if (index === DOM.els(`.line`).length - 1) {
		App.add_line()
	}
	else {
		App.move_lines_down(true)
	}
}

App.remove_line = () => {
	let index = DOM.index(App.get_line())

	if (DOM.els(`.line`).length === 1) {
		App.clear_input()
	}
	else if (index === DOM.els(`.line`).length - 1) {
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
	let line_length = DOM.els(`.line`).length

	if (line_length === 1) {
		return
	}

	let input = App.get_input()
	let line = App.get_line(input)
	let vr = App.get_var(input)
	let index = DOM.index(line)

	if (index === (line_length - 1)) {
		if (input === App.get_input()) {
			DOM.el(`.input`, line.previousElementSibling).focus()
		}

		line.remove()
		App.calc()
		return
	}

	let lines = DOM.els(`.line`)

	for (let i=0; i<line_length; i++) {
		let ln = lines[i]
		let inp = DOM.el(`.input`, ln)
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
		let line = DOM.els(`.line`)[i]

		let inp1 = DOM.el(`.input`, line)
		let inp2 = DOM.el(`.input`, App.get_line(inp1).previousElementSibling)
		App.set_input(inp2, inp1.value)
		App.set_input(inp1, ``)

		let cmt1 = DOM.el(`.comment`, line)
		let cmt2 = DOM.el(`.comment`, App.get_line(cmt1).previousElementSibling)
		App.set_input(cmt2, cmt1.value)
		App.set_comment(cmt1, ``)
	}

	App.get_last_line().remove()
	App.calc()
}

App.move_lines_down = (alt = false) => {
	let line_length = DOM.els(`.line`).length

	if (line_length === App.max_line_length) {
		return
	}

	if (alt) {
		App.focus_next()
	}

	let input = App.get_input()
	let line = App.get_line(input)
	let comment = DOM.el(`.comment`, line)
	let index = DOM.index(line)
	let lines = DOM.els(`.line`)

	for (let i=0; i<line_length; i++) {
		let ln = lines[i]
		let inp = DOM.el(`.input`, ln)
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
	line_length = DOM.els(`.line`).length

	for (let i=line_length-1; i>index; i--) {
		let inp1 = DOM.el(`.input`, DOM.els(`.line`)[i])
		let inp2 = DOM.el(`.input`, App.get_line(inp1).previousElementSibling)
		App.set_input(inp1, inp2.value)

		let cmt1 = DOM.el(`.comment`, DOM.els(`.line`)[i])
		let cmt2 = DOM.el(`.comment`, App.get_line(cmt1).previousElementSibling)
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
		App.add_line()
		App.calc()
	})
}

App.get_result_el = (line = App.line) => {
  return DOM.el(`.result`, line)
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
		DOM.el(`.input`, line).focus()
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
  line.scrollIntoView({block: `center`, behavior: `smooth`})
}

App.cycle = (direction) => {
  let line = App.get_line()
	let index = DOM.index(line)
  let is_input = document.activeElement.classList.contains(`input`)
  let is_comment = document.activeElement.classList.contains(`comment`)

	if (direction === `down`) {
    if (is_comment) {
      DOM.el(`.input`, line).focus()
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
      DOM.el(`.comment`, line).focus()
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