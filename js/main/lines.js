App.check_line_visibility = () => {
	let it = App.focused.input.parentNode.getBoundingClientRect().top
	let ct = DOM.el(`#lines`).getBoundingClientRect().top

	if (it < ct) {
		DOM.el(`#lines`).scrollTop = DOM.el(`#lines`).scrollTop - (ct - it)
	}

	let ib = it + App.focused.input.parentNode.offsetHeight
	let cb = ct + DOM.el(`#lines`).offsetHeight

	if (ib > cb) {
		DOM.el(`#lines`).scrollTop = DOM.el(`#lines`).scrollTop + (ib - cb)
	}
}

App.line_up = () => {
	App.focus_prev()
}

App.line_down = () => {
	App.focus_next()
}

App.move_line_up = () => {
	let index = DOM.index(App.focused.input.parentNode)

	if (index === 0) {
		return
	}

	let inp = App.focused.input
	let ninp = DOM.el(`.input`, inp.parentNode.previousElementSibling)

	let val = inp.value
	let nval = ninp.value

	let v = DOM.dataset(inp, `variable`)
	let nv = DOM.dataset(ninp, `variable`)

	let cv = `$@!#` + v.substring(1)
	let cnv = `$@!#` + nv.substring(1)

	let re = new RegExp(`\\$` + v.substring(1), `g`)
	let re2 = new RegExp(`\\$` + nv.substring(1), `g`)

	for (let input of DOM.els(`.input`)) {
		let vl = input.value.replace(re, cnv)
		vl = vl.replace(re2, cv)
		input.value = vl.replace(/@!#/g, ``)
	}

	val = inp.value
	nval = ninp.value

	inp.value = nval
	ninp.value = val

	App.focus_if_isnt(ninp)
	App.update_results()
}

App.move_line_down = () => {
	let index = DOM.index(App.focused.input.parentNode)

	if (index === (DOM.els(`.line`).length - 1)) {
		return
	}

	let inp = App.focused.input
	let ninp = DOM.el(`.input`, inp.parentNode.nextElementSibling)

	let val = inp.value
	let nval = ninp.value

	let v = DOM.dataset(inp, `variable`)
	let nv = DOM.dataset(ninp, `variable`)

	let cv = `$@!#` + v.substring(1)
	let cnv = `$@!#` + nv.substring(1)

	let re = new RegExp(`\\$` + v.substring(1), `g`)
	let re2 = new RegExp(`\\$` + nv.substring(1), `g`)

	for (let input of DOM.els(`.input`)) {
		let vl = input.value.replace(re, cnv)
		vl = vl.replace(re2, cv)
		input.value = vl.replace(/@!#/g, ``)
	}

	val = inp.value
	nval = ninp.value

	inp.value = nval
	ninp.value = val

	App.focus_if_isnt(ninp)
	App.update_results()
}

App.get_last_line = () => {
	return DOM.els(`.line`).slice(-1)[0]
}

App.remove_last_line = () => {
	if (DOM.els(`.line`).length === 1) {
		App.clear_input(App.focused.input)
		return
	}

	let line = App.get_last_line()
	let input = App.get_last_input()

	if (input === App.focused.input) {
		DOM.el(`.input`, line.previousElementSibling).focus()
	}

	line.remove()
	App.update_results()
}

App.focus_next_or_add = () => {
	let next_all = DOM.next_all(App.focused.input.parentNode, `.line`)
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

	if (num_lines === App.get_max_line_length()) {
		return
	}

	if (num_lines === 0) {
		letter = `a`
	}
	else {
		let last_var = DOM.dataset(App.get_last_input(), `variable`)
		letter = App.increase_var(last_var).substring(1)
	}

	if (!value) {
		value = ``
	}

	let el = DOM.create(`div`, `line`)

	el.innerHTML = `
		<button class="button variable">$${letter}</button>
		<input type="text" class="input" id="${letter}" value="${value}">

		<div class="result_container">
			<span class="result"></span>
		</div>`

	DOM.el(`#lines`).appendChild(el)
	let input = App.get_last_input()
	App.focused.input = input

	DOM.ev(DOM.els(`.variable`).slice(-1)[0], `click`, () => {
		App.press(`$` + letter)
	})

	DOM.ev(input, `focus`, (e) => {
		App.focused.input = e.target
		App.change_borders()
		App.check_line_visibility()
	})

	DOM.ev(input, `input`, () => {
		App.update_results()
	})

	DOM.ev(input, `keydown`, (e) => {
		if (e.key === `ArrowUp` || e.key === `ArrowDown`) {
			e.preventDefault()
		}
	})

	DOM.ev(DOM.els(`.result`).slice(-1)[0], `click`, (e) => {
		App.on_result_click(e.target)
	})

	DOM.ev(DOM.els(`.result`).slice(-1)[0], `mousedown`, (e) => {
		if (e.detail > 1) {
			e.preventDefault()
		}
	})

	DOM.dataset(input, `variable`, `$` + letter)

	App.focus_input(input)
	App.move_caret_to_end(input)
}

App.add_line_before = () => {
	App.move_lines_down()
}

App.add_line_after = () => {
	let index = DOM.index(App.focused.input.parentNode)

	if (index === DOM.els(`.line`).length - 1) {
		App.add_line()
	}
	else {
		App.move_lines_down(true)
	}
}

App.remove_line = () => {
	let index = DOM.index(App.focused.input.parentNode)

	if (DOM.els(`.line`).length === 1) {
		App.clear_input(App.focused.input)
	}
	else if (index === DOM.els(`.line`).length - 1) {
		App.remove_last_line()
	}
	else {
		App.move_lines_up()
	}
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
	let line = input.parentNode
	let v = DOM.dataset(input, `variable`)
	let index = DOM.index(line)

	if (index === (line_length - 1)) {
		if (input === App.focused.input) {
			DOM.el(`.input`, line.previousElementSibling).focus()
		}

		line.remove()
		App.update_results()
		return
	}

	for (let i=0; i<line_length; i++) {
		let ln = DOM.els(`.line`)[i]
		let inp = DOM.el(`.input`, ln)
		let val = inp.value

		if (val.trim() === ``) {
			continue
		}

		if (val.trim().startsWith(`//`)) {
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

		inp.value = val
	}

	for (let i=index+1; i<line_length; i++) {
		let inp = DOM.el(`.input`, DOM.els(`.line`)[i])
		let ninp = DOM.el(`.input`, inp.parentNode.previousElementSibling)

		ninp.value = inp.value
		inp.value = ``
	}

	App.get_last_line().remove()
	App.update_results()
}

App.move_lines_down = (alt = false) => {
	let line_length = DOM.els(`.line`).length

	if (line_length === App.get_max_line_length()) {
		return
	}

	if (alt) {
		App.focus_next()
	}

	let input = App.focused.input
	let line = input.parentNode
	let v = DOM.dataset(input, `variable`)
	let index = DOM.index(line)

	for (let i=0; i<line_length; i++) {
		let ln = DOM.els(`.line`)[i]
		let inp = DOM.el(`.input`, ln)
		let val = inp.value

		if (val.trim() === ``) {
			continue
		}

		if (val.trim().startsWith(`//`)) {
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

		inp.value = val
	}

	App.add_line()

	line_length = DOM.els(`.line`).length

	for (let i=line_length-1; i>index; i--) {
		let inp = DOM.el(`.input`, DOM.els(`.line`)[i])
		let ninp = DOM.el(`.input`, inp.parentNode.previousElementSibling)
		inp.value = ninp.value
	}

	input.value = ``
	App.focus_input(input)
	App.update_results()
}

App.get_max_line_length = () => {
	return App.get_var_index(`$zz`) + 1
}

App.on_result_click = (el) => {
	App.copy_to_clipboard(App.get_result_text(el))
}

App.show_error = (input) => {
	App.show_result(input, `Error`)
}

App.show_comment = (input) => {
	App.show_result(input, `Comment`)
}

App.new_sheet = () => {
	App.remove_all_lines()
}