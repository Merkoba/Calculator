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
	let index = DOM.index(App.get_line_el())

	if (index === 0) {
		return
	}

	let inp = App.focused.input
	let ninp = DOM.el(`.input`, App.get_line(inp).previousElementSibling)

	let val = inp.value
	let nval = ninp.value

	let v = App.get_var(inp)
	let nv = App.get_var(ninp)

	let cv = `$@!#` + v.substring(1)
	let cnv = `$@!#` + nv.substring(1)

	let re = new RegExp(`\\$` + v.substring(1), `g`)
	let re2 = new RegExp(`\\$` + nv.substring(1), `g`)

	for (let input of DOM.els(`.input`)) {
		let vl = input.value.replace(re, cnv)
		vl = vl.replace(re2, cv)
		App.set_input(input, vl.replace(/@!#/g, ``))
	}

	val = inp.value
	nval = ninp.value

	App.set_input(inp, nval)
	App.set_input(ninp, val)

	App.focus_if_isnt(ninp)
	App.calc()
}

App.move_line_down = () => {
	let index = DOM.index(App.get_line_el())

	if (index === (DOM.els(`.line`).length - 1)) {
		return
	}

	let inp = App.focused.input
	let ninp = DOM.el(`.input`, App.get_line_el(inp).nextElementSibling)

	let val = inp.value
	let nval = ninp.value

	let v = App.get_var(inp)
	let nv = App.get_var(ninp)

	let cv = `$@!#` + v.substring(1)
	let cnv = `$@!#` + nv.substring(1)

	let re = new RegExp(`\\$` + v.substring(1), `g`)
	let re2 = new RegExp(`\\$` + nv.substring(1), `g`)

	for (let input of DOM.els(`.input`)) {
		let vl = input.value.replace(re, cnv)
		vl = vl.replace(re2, cv)
		App.set_input(input, vl.replace(/@!#/g, ``))
	}

	val = inp.value
	nval = ninp.value

	App.set_input(inp, nval)
	App.set_input(ninp, val)

	App.focus_if_isnt(ninp)
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

	if (input === App.focused.input) {
		DOM.el(`.input`, line.previousElementSibling).focus()
	}

	line.remove()
	App.calc()
}

App.focus_next_or_add = () => {
	let next_all = DOM.next_all(App.get_line_el(), `.line`)
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
		letter = App.increase_var(last_var).substring(1)
	}

	if (!value) {
		value = ``
	}

	let el = DOM.create(`div`, `line`)
  let vr = `$` + letter

  el.innerHTML = App.templates[`template_line`]({
    letter: letter,
    value: value,
  })

	DOM.el(`#lines`).appendChild(el)
	let input = App.get_last_input()
	App.focused.input = input

	DOM.ev(DOM.el(`.variable`, el), `click`, () => {
		App.press(vr)
	})

	DOM.ev(DOM.el(`.menu`, el), `click`, (e) => {
		App.show_menu(e.target, input)
	})

	DOM.ev(input, `focus`, (e) => {
		App.focused.input = e.target
		App.change_borders()
    App.focus_line()
	})

	DOM.ev(input, `input`, () => {
		App.calc()
	})

	DOM.ev(input, `keydown`, (e) => {
		if (e.key === `ArrowUp` || e.key === `ArrowDown`) {
			e.preventDefault()
		}
	})

	DOM.dataset(input, `variable`, vr)
	App.move_caret_to_end(input)
  App.show_result(input, `Empty`)
	App.focus_input(input)
  return vr
}

App.add_line_before = () => {
	App.move_lines_down()
}

App.add_line_after = () => {
	let index = DOM.index(App.get_line_el())

	if (index === DOM.els(`.line`).length - 1) {
		App.add_line()
	}
	else {
		App.move_lines_down(true)
	}
}

App.remove_line = () => {
	let index = DOM.index(App.get_line_el())

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
	App.add_line()
}

App.move_lines_up = () => {
	let line_length = DOM.els(`.line`).length

	if (line_length === 1) {
		return
	}

	let input = App.focused.input
	let line = App.get_line_el(input)
	let v = App.get_var(input)
	let index = DOM.index(line)

	if (index === (line_length - 1)) {
		if (input === App.focused.input) {
			DOM.el(`.input`, line.previousElementSibling).focus()
		}

		line.remove()
		App.calc()
		return
	}

	for (let i=0; i<line_length; i++) {
		let ln = DOM.els(`.line`)[i]
		let inp = DOM.el(`.input`, ln)
		let val = inp.value

		if (val.trim() === ``) {
			continue
		}

		val = val.replace(/\$[a-z]+/g, (match) => {
			if (match === v) {
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

	for (let i=index+1; i<line_length; i++) {
		let inp = DOM.el(`.input`, DOM.els(`.line`)[i])
		let ninp = DOM.el(`.input`, App.get_line_el(inp).previousElementSibling)

		App.set_input(ninp, inp.value)
		App.set_input(inp, ``)
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

	let input = App.focused.input
	let line = App.get_line_el(input)
	let v = App.get_var(input)
	let index = DOM.index(line)

	for (let i=0; i<line_length; i++) {
		let ln = DOM.els(`.line`)[i]
		let inp = DOM.el(`.input`, ln)
		let val = inp.value

		if (val.trim() === ``) {
			continue
		}

		val = val.replace(/\$[a-z]+/g, (match) => {
			if (match === v) {
				return ``
			}

			let ni = App.get_var_index(match)

			if (ni > index && ni < line_length) {
				return App.increase_var(match)
			}

			return match
		})

		App.set_input(inp, val)
	}

	App.add_line()

	line_length = DOM.els(`.line`).length

	for (let i=line_length-1; i>index; i--) {
		let inp = DOM.el(`.input`, DOM.els(`.line`)[i])
		let ninp = DOM.el(`.input`, App.get_line_el(inp).previousElementSibling)
		App.set_input(inp, ninp.value)
	}

	App.set_input(input, ``)
	App.focus_input(input)
	App.calc()
}

App.get_max_line_length = () => {
	App.max_line_length = App.get_var_index(`$zz`) + 1
}

App.show_error = (input) => {
	App.show_result(input, `Error`)
}

App.new_sheet = () => {
	if (confirm("Start again?")) {
		App.remove_all_lines()
		App.calc()
	}
}

App.get_result_el = (input = App.focused.input) => {
  return DOM.el(`.result`, input.closest(`.line`))
}

App.get_line_el = (input = App.focused.input) => {
  return input.closest(`.line`)
}

App.focus_next = () => {
	let line = App.get_line_el().nextElementSibling

	if (line) {
		DOM.el(`.input`, line).focus()
	}
}

App.focus_prev = () => {
	let line = App.get_line_el().previousElementSibling

	if (line) {
		DOM.el(`.input`, line).focus()
	}
}

App.view_result = (input) => {
  let value = input.value.trim()

  if (!value) {
    return
  }

  let v = App.get_var(input)
  let result = App.get_result_string(v)

  if (value && result) {
    let form = App.format_input(input)
    let exp_res = App.expand_value(input, false, false)
    let exp_full = App.expand_value(input, false, true)
    let vr = App.get_vars_results(input)
    let items = []

    if (vr.length > 0) {
      items.push(vr.join("<br>"))
    }

    if (form) {
      items.push(App.make_html_safe(`${form} = ${result}`))
    }

    if (exp_res) {
      items.push(App.make_html_safe(`${exp_res} = ${result}`))
    }

    if (exp_full) {
      items.push(App.make_html_safe(`${exp_full} = ${result}`))
    }

    let c = DOM.create(`div`, `view_result`)
    c.innerHTML = items.join("<hr>")
    App.show_modal(`View Result`, c)
  }
}

App.show_menu = (button, input) => {
  let items = []

  items.push({
    text: `Expand`,
    action: () => {
			if (confirm("Expand variables?")) {
				App.expand_value(input)
			}
			else {
				App.focus_if_isnt(input)
			}
    }
  })

	items.push({
    text: `Remove`,
    action: () => {
			if (App.is_empty() || confirm("Remove line?")) {
				App.remove_line()
			}
			else {
				App.focus_if_isnt(input)
			}
    }
  })

  items.push({
    text: `View`,
    action: () => {
      App.view_result(input)
    }
  })

  App.focus_input(input)
  NeedContext.show_on_element(button, items)
}

App.focus_line = (input = App.focused.input) => {
  let line = App.get_line_el(input)
  line.scrollIntoView({block: `center`, behavior: `smooth`})
}