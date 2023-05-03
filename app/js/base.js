const App = {}

App.math_normal = math.create({
	number: "BigNumber",
	precision: 64
})

App.math_fraction = math.create({
	number: "Fraction"
})

App.letters = "abcdefghijklmnopqrstuvwxyz"
App.linevars = {}
App.ls_options = "options_v4"
App.colorlib = ColorLib()
App.templates = {}

App.themes = [
	"lake",
	"leaf",
	"bulb",
	"wine",
	"bubble",
	"vapor",
	"clouds",
	"paper",
	"cobalt",
	"carbon"
]

App.focused = {
	input: null
}

App.init = () => {
	init_msg()
	setup_templates()
	get_local_storage()
	apply_theme(App.options.theme)
	apply_mode()
	App.draw_buttons()
	place_infobar()
	update_infobar()
	App.place_lines_container()
	App.key_detection()
	App.resize_events()
	title_click_events()
	get_site_root()
	App.add_line()
}

App.key_detection = () => {
	document.addEventListener("keyup", function (e) {
		if (e.key === "Escape") {
			if (App.focused.input.value === "") {
				App.remove_line()
			} else {
				App.clear_input(App.focused.input)
			}
		}
	})

	document.addEventListener("keyup", function (e) {
		if (App.msg.is_open()) {
			return
		}

		if (e.key === "Enter") {
			if (e.shiftKey && e.ctrlKey) {
				expand_value(App.focused.input)
			} else if (e.shiftKey) {
				App.press(DOM.dataset(App.focused.input, "variable"))
			} else if (e.ctrlKey) {
				copy_input_down()
			} else {
				App.focus_next_or_add()
			}
		} else if (e.key === "Backspace") {
			if (e.shiftKey) {
				App.clear_input(App.focused.input)
				e.preventDefault()
			}
		} else if (e.key === "Tab") {
			if (e.shiftKey) {
				App.cycle_inputs("up")
			} else {
				App.cycle_inputs("down")
			}

			e.preventDefault()
		} else if (e.key === "ArrowUp") {
			if (e.shiftKey) {
				App.move_line_up()
			} else {
				App.line_up()
			}

			e.preventDefault()
		} else if (e.key === "ArrowDown") {
			if (e.shiftKey) {
				App.move_line_down()
			} else {
				App.line_down()
			}

			e.preventDefault()
		}

		if (!e.ctrlKey) {
			focus_if_isnt(App.focused.input)
		}
	})
}

App.draw_buttons = () => {
	App.place_button(1, "Right Click: 0.1 | Middle Click: 1/1")
	App.place_button(2, "Right Click: 0.2 | Middle Click: 1/2")
	App.place_button(3, "Right Click: 0.3 | Middle Click: 1/3")
	App.place_button(4, "Right Click: 0.4 | Middle Click: 1/4")
	App.place_button(5, "Right Click: 0.5 | Middle Click: 1/5")
	App.place_button(6, "Right Click: 0.6 | Middle Click: 1/6")
	App.place_button(7, "Right Click: 0.7 | Middle Click: 1/7")
	App.place_button(8, "Right Click: 0.8 | Middle Click: 1/8")
	App.place_button(9, "Right Click: 0.9 | Middle Click: 1/9")
	App.place_button(0, "Right Click: 0. | Middle Click: 000")

	App.place_button(".")
	App.place_button(",")

	App.buttons_br()

	App.place_button("+")
	App.place_button("-")
	App.place_button("*")
	App.place_button("/", "Right Click: Toggle Comment")
	App.place_button("(")
	App.place_button(")")
	App.place_button("^", "Right Click: ^2 | Middle Click: ^3")
	App.place_button("sqrt", "Right Click: Cube Root | Middle Click: nth Root")
	App.place_button("sin", "Right Click: asin | Middle Click: asinh")
	App.place_button("cos", "Right Click: acos | Middle Click: acosh")
	App.place_button("tan", "Right Click: atan | Middle Click: atanh")
	App.place_button("pi", "Right Click: phi | Middle Click: e")

	App.buttons_br()

	App.place_button_wider("Up", "Right Click: Move Line Up | Middle Click: Go To First Line")
	App.place_button_wider("Down", "Right Click: Move Line Down | Middle Click: Go To Last Line")
	App.place_button_wider("New Line", "Right Click: Add Line After | Middle Click: Add Line Before")
	App.place_button_wider("Remove Line", "Right Click: Remove Last Line | Middle Click: Remove All Lines")
	App.place_button_wider("Clear", "Right Click: Format Input | Middle Click: Format All Inputs")
	App.place_button_wider("Erase", "")

	for (let btn of DOM.els(".button")) {
		let dblclickers = []

		if (dblclickers.indexOf(btn.textContent) !== -1) {
			btn.addEventListener("mouseup", function (e) {
				if (e.which === 1) {
					if (e.detail % 2 === 0) {
						App.press(this.textContent)
					} else {
						App.focus_input(App.focused.input)
					}
				}
			}, false)
		} else {
			btn.addEventListener("click", function () {
				App.press(this.textContent)
			})
		}

		btn.addEventListener("auxclick", function (e) {
			App.press(this.textContent, e.which)
		})

		disable_context_menu(btn)
	}
}

App.place_button = (s, title = "") => {
	let el = document.createElement("button")
	el.title = title
	el.classList.add("button")
	el.textContent = s
	DOM.el("#buttons").appendChild(el)
}

App.place_button_wider = (s, title = "") => {
	let el = document.createElement("button")
	el.title = title
	el.classList.add("button")
	el.classList.add("wider")
	el.textContent = s
	DOM.el("#buttons").appendChild(el)
}

App.buttons_br = () => {
	let el = document.createElement("br")
	DOM.el("#buttons").appendChild(el)
}

App.focus_next_or_add = () => {
	let next_all = DOM.next_all(App.focused.input.parentNode, ".line")
	let found_line = false

	for (let item of next_all) {
		let inp = DOM.el(".input", item)

		if (inp.value === "") {
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
	let num_lines = DOM.els(".line").length
	let letter

	if (num_lines === get_max_line_length()) {
		return
	}

	if (num_lines === 0) {
		letter = "a"
	} else {
		let last_var = DOM.dataset(get_last_input(), "variable")
		letter = App.increase_var(last_var).substring(1)
	}

	if (!value) {
		value = ""
	}

	let el = DOM.div("line")

	el.innerHTML = `
		<button class="button variable">$${letter}</button>
		<input type="text" class="input" id="${letter}" value="${value}">

		<div class="result_container">
			<span class="result"></span>
		</div>`

	DOM.el("#lines").appendChild(el)
	let input = get_last_input()
	App.focused.input = input

	DOM.els(".variable").slice(-1)[0].addEventListener("click", function () {
		App.press("$" + letter)
	})

	input.addEventListener("focus", function () {
		App.focused.input = this
		App.change_borders()
		App.check_line_visibility()
	})

	input.addEventListener("input", function () {
		App.update_results()
	})

	input.addEventListener("keydown", function (e) {
		if (e.key === "ArrowUp" || e.key === "ArrowDown") {
			e.preventDefault()
		}
	})

	DOM.els(".result").slice(-1)[0].addEventListener("click", function () {
		on_result_click(this)
	})

	DOM.els(".result").slice(-1)[0].addEventListener("mousedown", function (e) {
		if (e.detail > 1) {
			e.preventDefault()
		}
	})

	DOM.dataset(input, "variable", "$" + letter)

	App.focus_input(input)
	move_caret_to_end(input)
}

App.add_line_before = () => {
	App.move_lines_down()
}

App.add_line_after = () => {
	let index = DOM.index(App.focused.input.parentNode)

	if (index === DOM.els(".line").length - 1) {
		App.add_line()
	} else {
		App.move_lines_down(true)
	}
}

App.remove_line = () => {
	let index = DOM.index(App.focused.input.parentNode)

	if (DOM.els(".line").length === 1) {
		App.clear_input(App.focused.input)
	} else if (index === DOM.els(".line").length - 1) {
		App.remove_last_line()
	} else {
		App.move_lines_up()
	}
}

App.remove_all_lines = () => {
	undefine_variables()
	DOM.el("#lines").innerHTML = ""
	App.add_line()
}

App.move_lines_up = () => {
	let line_length = DOM.els(".line").length

	if (line_length === 1) {
		return
	}

	let input = App.focused.input
	let line = input.parentNode
	let v = DOM.dataset(input, "variable")
	let index = DOM.index(line)

	if (index === (line_length - 1)) {
		if (input === App.focused.input) {
			DOM.el(".input", line.previousElementSibling).focus()
		}

		line.remove()
		App.update_results()
		return
	}

	for (let i = 0; i < line_length; i++) {
		let ln = DOM.els(".line")[i]
		let inp = DOM.el(".input", ln)
		let val = inp.value

		if (val.trim() === "") {
			continue
		}

		if (val.trim().startsWith("//")) {
			continue
		}

		val = val.replace(/\$[a-z]+/g, function (match) {
			if (match === v) {
				return ""
			}

			let ni = App.get_var_index(match)

			if (ni > index && ni < line_length) {
				return App.decrease_var(match)
			}

			return match
		})

		inp.value = val
	}

	for (let i = index + 1; i < line_length; i++) {
		let inp = DOM.el(".input", DOM.els(".line")[i])
		let ninp = DOM.el(".input", inp.parentNode.previousElementSibling)

		ninp.value = inp.value
		inp.value = ""
	}

	get_last_line().remove()
	App.update_results()
}

App.move_lines_down = (alt = false) => {
	let line_length = DOM.els(".line").length

	if (line_length === get_max_line_length()) {
		return
	}

	if (alt) {
		App.focus_next()
	}

	let input = App.focused.input
	let line = input.parentNode
	let v = DOM.dataset(input, "variable")
	let index = DOM.index(line)

	for (let i = 0; i < line_length; i++) {
		let ln = DOM.els(".line")[i]
		let inp = DOM.el(".input", ln)
		let val = inp.value

		if (val.trim() === "") {
			continue
		}

		if (val.trim().startsWith("//")) {
			continue
		}

		val = val.replace(/\$[a-z]+/g, function (match) {
			if (match === v) {
				return ""
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

	line_length = DOM.els(".line").length

	for (let i = line_length - 1; i > index; i--) {
		let inp = DOM.el(".input", DOM.els(".line")[i])
		let ninp = DOM.el(".input", inp.parentNode.previousElementSibling)
		inp.value = ninp.value
	}

	input.value = ""
	App.focus_input(input)
	App.update_results()
}

App.decrease_var = (v) => {
	let letter = v.substring(1)
	let res = ""
	let decrease_next = true

	for (let i = letter.length - 1; i >= 0; i--) {
		if (decrease_next) {
			if (letter[i] === App.letters[0]) {
				if (i === 0) {
					break
				} else {
					res += App.letters[App.letters.length - 1]
					decrease_next = true
				}
			} else {
				res += App.letters[App.letters.indexOf(letter[i]) - 1]
				decrease_next = false
			}
		} else {
			res += App.letters[App.letters.indexOf(letter[i])]
		}
	}

	return "$" + res.split("").reverse().join("")
}

App.increase_var = (v) => {
	let letter = v.substring(1)
	let res = ""
	let increase_next = true

	for (let i = letter.length - 1; i >= 0; i--) {
		if (increase_next) {
			if (letter[i] === App.letters[App.letters.length - 1]) {
				res += App.letters[0]
				increase_next = true

				if (i == 0) {
					res += "a"
				}
			} else {
				res += App.letters[App.letters.indexOf(letter[i]) + 1]
				increase_next = false
			}
		} else {
			res += App.letters[App.letters.indexOf(letter[i])]
		}
	}

	return "$" + res.split("").reverse().join("")
}

App.get_var_index = (v) => {
	let letter = v.substring(1)
	let n = letter.length - 1
	let index = 0

	for (let i = 0; i < letter.length; i++) {
		let t = App.letters.indexOf(letter[i]) + 1
		let p = Math.pow(App.letters.length, n)

		t *= p

		if (t === 0) {
			t += App.letters.indexOf(letter[i])
		}

		index += t

		n -= 1
	}

	index -= 1
	return index
}

App.remove_last_line = () => {
	if (DOM.els(".line").length === 1) {
		App.clear_input(App.focused.input)
		return
	}

	let line = get_last_line()
	let input = get_last_input()

	if (input === App.focused.input) {
		DOM.el(".input", line.previousElementSibling).focus()
	}

	line.remove()
	App.update_results()
}

App.get_result = (input) => {
	let result = DOM.el(".result", input.parentNode)
	result.innerHTML = ""

	try {
		let val = input.value

		if (val.trim().startsWith("//")) {
			App.show_comment(input)
			return
		}

		if (val.trim().length === 0) {
			return
		}

		if (App.options.fraction) {
			result = App.math_fraction.eval(val + "*1", App.linevars)
		} else {
			result = App.math_normal.eval(val + "*1", App.linevars)
		}

		App.update_variable(input, result)
		App.show_result(input, App.format_result(result))
	}

	catch (err) {
		App.show_error(input)
	}
}

App.show_error = (input) => {
	App.show_result(input, "Error")
}

App.show_comment = (input) => {
	App.show_result(input, "Comment")
}

App.show_result = (input, s) => {
	DOM.el(".result", input.parentNode).innerHTML = s
}

App.update_variable = (input, val) => {
	App.linevars[DOM.dataset(input, "variable")] = val
}

App.improper_to_mixed = (n, d) => {
	i = parseInt(n / d)
	n -= i * d
	return [i, n, d]
}

App.format_result = (n, f = false) => {
	if (App.options.fraction && !f) {
		let split = App.math_fraction.format(n).split("/")

		if (split.length === 2) {
			let sup = split[0]
			let sub = split[1]

			let nsup = parseInt(sup)
			let nsub = parseInt(sub)

			if (App.options.mixed && nsup >= nsub) {
				let mixed = App.improper_to_mixed(nsup, nsub)
				let mwhole = mixed[0]

				if (mixed[1] !== 0 && mixed[2] !== 0) {
					sup = mixed[1]
					sub = mixed[2]
				} else {
					return App.format_result(mwhole, true)
				}

				return `<span class="resolved"><span class="mwhole">${mwhole}</span><span class="fraction"><sup>${sup}</sup><sub>${sub}</sub></span></span>`
			} else {
				return `<span class="resolved"><span class="fraction"><sup>${sup}</sup><sub>${sub}</sub></span></span>`
			}
		} else {
			return App.format_result(n, true)
		}
	} else {
		if (App.options.round) {
			n = App.math_normal.round(n, App.options.round_places)
		}

		let ns = n.toString()
		let whole, decimal

		if (ns.indexOf(".") !== -1) {
			let split = ns.split(".")
			whole = split[0].toString() + "."
			decimal = split[1].toString()
		} else {
			whole = n.toString()
			decimal = ""
		}

		if (App.options.commas) {
			whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		}

		return `<span class="resolved"><span class="whole">${whole}</span><span class="decimal">${decimal}</span></span>`
	}
}

App.press = (s, aux = false) => {
	if (s === "sin") {
		s = "sin("
	} else if (s === "cos") {
		s = "cos("
	} else if (s === "tan") {
		s = "tan("
	} else if (s === "sqrt") {
		s = "sqrt("
	}

	if (aux) {
		s = App.check_aux(s, aux)

		if (!s) {
			App.focus_input(App.focused.input)
			return
		}
	}

	if (s === "Clear") {
		App.clear_input(App.focused.input)
		return
	} else if (s === "Erase") {
		erase_character()
		return
	} else if (s === "New Line") {
		App.focus_next_or_add()
		App.focus_input(App.focused.input)
		return
	} else if (s === "Remove Line") {
		App.remove_line()
		App.focus_input(App.focused.input)
		return
	} else if (s === "Up") {
		App.line_up()
		App.focus_input(App.focused.input)
		return
	} else if (s === "Down") {
		App.line_down()
		App.focus_input(App.focused.input)
		return
	}

	let v = DOM.dataset(App.focused.input, "variable")

	if (s === v) {
		App.focus_next_or_add()
		v = DOM.dataset(App.focused.input, "variable")

		if (s === v) {
			return
		}
	}

	insert_text(App.focused.input, s)
}

App.check_aux = (s, aux) => {
	if (aux) {
		for (let i = 1; i < 10; i++) {
			if (s == i) {
				if (aux === 3) {
					return "0." + i
				} else if (aux === 2) {
					return "1/" + i
				}
			}
		}

		if (s == 0) {
			if (aux === 3) {
				return "0."
			} else if (aux === 2) {
				return "000"
			}
		} else if (s === "cos(") {
			if (aux === 3) {
				return "acos("
			} else if (aux === 2) {
				return "acosh("
			}
		} else if (s === "tan(") {
			if (aux === 3) {
				return "atan("
			} else if (aux === 2) {
				return "atanh("
			}
		} else if (s === "sin(") {
			if (aux === 3) {
				return "asin("
			} else if (aux === 2) {
				return "asinh("
			}
		} else if (s === "^") {
			if (aux === 3) {
				return "^2"
			} else if (aux === 2) {
				return "^3"
			}
		} else if (s === "sqrt(") {
			if (aux === 3) {
				return "cbrt("
			} else if (aux === 2) {
				return "nthRoot("
			}
		} else if (s === "pi") {
			if (aux === 3) {
				return "phi"
			} else if (aux === 2) {
				return "e"
			}
		} else if (s === "/") {
			if (aux === 3) {
				toggle_comment(App.focused.input)
				return false
			}
		} else if (s === "Up") {
			if (aux === 3) {
				App.move_line_up()
				return false
			} else if (aux === 2) {
				go_to_first_input()
				return false
			}
		} else if (s === "Down") {
			if (aux === 3) {
				App.move_line_down()
				return false
			} else if (aux === 2) {
				go_to_last_input()
				return false
			}
		} else if (s === "Remove Line") {
			if (aux === 3) {
				App.remove_last_line()
				return false
			} else if (aux === 2) {
				App.remove_all_lines()
				return false
			}
		} else if (s === "New Line") {
			if (aux === 3) {
				App.add_line_after()
				return false
			} else if (aux === 2) {
				App.add_line_before()
				return false
			}
		} else if (s === "Clear") {
			if (aux === 3) {
				format_input(App.focused.input)
				return false
			} else if (aux === 2) {
				format_all()
				return false
			}
		}
	}

	return false
}

App.clear_input = (input) => {
	if (input.value === "") {
		return
	}

	replace_text(input, "")
}

App.update_results = (function () {
	let timer
	return function () {
		clearTimeout(timer)
		timer = setTimeout(function () {
			App.do_update_results()
		}, 10)
	}
})()

App.do_update_results = () => {
	undefine_variables()
	let variables = {}

	for (let input of DOM.els(".input")) {
		let v = DOM.dataset(input, "variable")
		variables[v] = {}
		let vr = variables[v]
		vr.edges = []
	}

	for (let input of DOM.els(".input")) {
		let v = DOM.dataset(input, "variable")
		let val = input.value

		if (val.trim() === "") {
			if (val.length > 0) {
				input.value = ""
			}

			continue
		}

		if (val.trim().startsWith("//")) {
			continue
		}

		let matches = val.match(/\$[a-z]+/g)

		if (matches !== null) {
			variables[v].edges = matches
		}
	}

	let sorted = []
	let n = 0

	while (Object.keys(variables).length) {
		n += 1

		let acyclic = false
		let vars = Object.assign({}, variables)
		let keys = Object.keys(vars)

		for (let i = 0; i < keys.length; i++) {
			let edges = vars[keys[i]].edges
			let found = false

			for (let el of edges) {
				if (vars[el] !== undefined) {
					found = true
					break
				}
			}

			if (!found) {
				acyclic = true
				delete variables[keys[i]]
				sorted.push(keys[i])
			}
		}

		if (!acyclic) {
			for (let input of DOM.els(".input")) {
				let v = DOM.dataset(input, "variable")
				let letter = v.substring(1)

				if (sorted.indexOf(v) !== -1) {
					App.get_result(DOM.el("#" + letter))
				} else {
					App.show_result(DOM.el("#" + letter), "Not Acyclical")
				}
			}

			return
		}

		if (n > 10000) {
			return
		}
	}

	for (let i = 0; i < sorted.length; i++) {
		let letter = sorted[i].substring(1)
		App.get_result(DOM.el("#" + letter))
	}
}

App.check_line_visibility = () => {
	let it = App.focused.input.parentNode.getBoundingClientRect().top
	let ct = DOM.el("#lines_container").getBoundingClientRect().top

	if (it < ct) {
		DOM.el("#lines_container").scrollTop = DOM.el("#lines_container").scrollTop - (ct - it)
	}

	let ib = it + App.focused.input.parentNode.offsetHeight
	let cb = ct + DOM.el("#lines_container").offsetHeight

	if (ib > cb) {
		DOM.el("#lines_container").scrollTop = DOM.el("#lines_container").scrollTop + (ib - cb)
	}
}

App.focus_input = (input) => {
	input.focus()
}

App.focus_next = () => {
	let line = App.focused.input.parentNode.nextElementSibling

	if (line) {
		DOM.el(".input", line).focus()
	}
}

App.focus_prev = () => {
	let line = App.focused.input.parentNode.previousElementSibling

	if (line) {
		DOM.el(".input", line).focus()
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
	let ninp = DOM.el(".input", inp.parentNode.previousElementSibling)

	let val = inp.value
	let nval = ninp.value

	let v = DOM.dataset(inp, "variable")
	let nv = DOM.dataset(ninp, "variable")

	let cv = "$@!#" + v.substring(1)
	let cnv = "$@!#" + nv.substring(1)

	let re = new RegExp("\\$" + v.substring(1), "g")
	let re2 = new RegExp("\\$" + nv.substring(1), "g")

	for (let input of DOM.els(".input")) {
		let vl = input.value.replace(re, cnv)
		vl = vl.replace(re2, cv)
		input.value = vl.replace(/@!#/g, "")
	}

	val = inp.value
	nval = ninp.value

	inp.value = nval
	ninp.value = val

	focus_if_isnt(ninp)
	App.update_results()
}

App.move_line_down = () => {
	let index = DOM.index(App.focused.input.parentNode)

	if (index === (DOM.els(".line").length - 1)) {
		return
	}

	let inp = App.focused.input
	let ninp = DOM.el(".input", inp.parentNode.nextElementSibling)

	let val = inp.value
	let nval = ninp.value

	let v = DOM.dataset(inp, "variable")
	let nv = DOM.dataset(ninp, "variable")

	let cv = "$@!#" + v.substring(1)
	let cnv = "$@!#" + nv.substring(1)

	let re = new RegExp("\\$" + v.substring(1), "g")
	let re2 = new RegExp("\\$" + nv.substring(1), "g")

	for (let input of DOM.els(".input")) {
		let vl = input.value.replace(re, cnv)
		vl = vl.replace(re2, cv)
		input.value = vl.replace(/@!#/g, "")
	}

	val = inp.value
	nval = ninp.value

	inp.value = nval
	ninp.value = val

	focus_if_isnt(ninp)
	App.update_results()
}

App.cycle_inputs = (direction) => {
	if (DOM.els(".input").length === 1) {
		return
	}

	let index = DOM.index(App.focused.input.parentNode)

	if (direction === "down") {
		if (index === (DOM.els(".input").length - 1)) {
			go_to_first_input()
		} else {
			App.focus_next()
		}
	} else {
		if (index === 0) {
			go_to_last_input()
		} else {
			App.focus_prev()
		}
	}
}

App.change_borders = () => {
	for (let input of DOM.els(".input")) {
		input.classList.remove("input_focus")
	}

	App.focused.input.classList.add("input_focus")
}

App.place_lines_container = () => {
	let h = window.innerHeight - DOM.el("#app_top").offsetHeight
	DOM.el("#lines_container").style.height = `${h}px`
}

App.resize_events = () => {
	window.addEventListener("resize", function () {
		App.resize_timer()
	})
}

App.resize_timer = (function () {
	let timer
	return function () {
		clearTimeout(timer)
		timer = setTimeout(function () {
			place_infobar()
			App.place_lines_container()
		}, 350)
	}
})()

App.new_sheet = () => {
	App.remove_all_lines()
}

function title_click_events() {
	DOM.el("#lnk_new").addEventListener("click", function () {
		App.new_sheet()
	})

	DOM.el("#lnk_options").addEventListener("click", function () {
		show_options()
	})

	DOM.el("#lnk_about").addEventListener("click", function () {
		show_about()
	})
}

function copy_to_clipboard(s) {
	navigator.clipboard.writeText(s)
}

function make_uparams(s) {
	if (App.options.fraction) {
		s += "?"
		s += "frac"
	}

	return s
}

function get_url_param(param) {
	return new URLSearchParams(window.location.search).get(param)
}

function stringify_sheet() {
	let s = ""

	for (let input of DOM.els(".input")) {
		s += input.value
		s += "@!#"
	}

	s = s.substring(0, s.length - 3)
	s = s.replace(/\\/g, "\\\\")

	return s
}

function show_about() {
	show_modal("About", App.templates["template_about"]({
		version: App.version
	}))
}

function check_params() {
	if (get_url_param("frac") === null) {
		if (App.options.fraction) {
			toggle_fraction()
		}
	} else {
		if (!App.options.fraction) {
			toggle_fraction()
		}
	}
}

function get_site_root() {
	App.site_root = window.location.href.match(/^.*\//)[0]
}

function add_ans(next = false) {
	let variable

	if (next) {
		let line = App.focused.input.parentNode.nextElementSibling
		if (!line) { return }
		let input = DOM.el(".input", line)
		variable = DOM.dataset(input, "variable")
	} else {
		let line = App.focused.input.parentNode.previousElementSibling
		if (!line) { return }
		let input = DOM.el(".input", line)
		variable = DOM.dataset(input, "variable")
	}

	if (variable !== undefined) {
		App.press(variable)
	}
}

function add_result(next = false) {
	let result

	if (next) {
		result = DOM.el(".result", App.focused.input.parentNode.nextElementSibling)
	} else {
		result = DOM.el(".result", App.focused.input.parentNode.previousElementSibling)
	}

	if (result !== undefined) {
		App.press(get_result_text(result))
	}
}

function add_input(next = false) {
	let value

	if (next) {
		value = DOM.el(App.focused.input.parentNode.nextElementSibling, ".input").value
	} else {
		value = DOM.el(App.focused.input.parentNode.previousElementSibling, ".input").value
	}

	if (value !== undefined && value !== "") {
		App.press(value)
	}
}

function show_options() {
	let places = []

	for (let i=0; i<=30; i++) {
		places.push(i)
	}

	let themelist = []

	for (let theme of App.themes) {
		let obj = {}
		obj.lowercase = theme
		obj.capitalized = capitalize_string(theme)
		themelist.push(obj)
	}

	show_modal("Options", App.templates["template_options"]({
		commas: App.options.commas,
		mixed: App.options.mixed,
		round: App.options.round,
		sound: App.options.sound,
		places: places,
		themes: themelist
	}))

	let els = DOM.els("option", DOM.el("#sel_round_places"))

	for (let el of els) {
		if (el.value == App.options.round_places) {
			el.selected = true
		}
	}

	els = DOM.els("option", DOM.el("#sel_theme"))

	for (let el of els) {
		if (el.value == App.options.theme) {
			el.selected = true
		}
	}

	DOM.el("#chk_commas").addEventListener("change", function () {
		App.options.commas = this.checked
		App.update_results()
		update_options()
	})

	DOM.el("#chk_round").addEventListener("change", function () {
		App.options.round = this.checked
		App.update_results()
		update_options()
	})

	DOM.el("#sel_round_places").addEventListener("change", function () {
		App.options.round_places = parseInt(this.value)
		App.update_results()
		update_options()
	})

	DOM.el("#chk_mixed").addEventListener("change", function () {
		App.options.mixed = this.checked
		App.update_results()
		update_options()
	})

	DOM.el("#chk_sound").addEventListener("change", function () {
		App.options.sound = this.checked
		update_options()
	})

	DOM.el("#sel_theme").addEventListener("change", function () {
		App.options.theme = this.value
		apply_theme(App.options.theme)
		update_options()
	})
}

function get_local_storage() {
	get_options()
}

function update_options() {
	localStorage.setItem(App.ls_options, JSON.stringify(App.options))
}

function get_options() {
	App.options = JSON.parse(localStorage.getItem(App.ls_options))
	let mod = false

	if (App.options === null) {
		App.options = {}
		mod = true
	}

	if (App.options.version === undefined) {
		options.version = App.ls_options
		mod = true
	}

	if (options.sound === undefined) {
		App.options.sound = true
		mod = true
	}

	if (App.options.commas === undefined) {
		App.options.commas = true
		mod = true
	}

	if (App.options.round === undefined) {
		App.options.round = true
		mod = true
	}

	if (App.options.round_places === undefined) {
		App.options.round_places = 10
		mod = true
	}

	if (App.options.fraction === undefined) {
		App.options.fraction = false
		mod = true
	}

	if (App.options.mixed === undefined) {
		App.options.mixed = false
		mod = true
	}

	if (App.options.theme === undefined) {
		App.options.theme = "carbon"
		mod = true
	} else {
		if (App.themes.indexOf(App.options.theme) === -1) {
			App.options.theme = "carbon"
			mod = true
		}
	}

	if (mod) {
		update_options()
	}
}

function reset_object(ls_name, data = false) {
	if (ls_name === App.ls_options) {
		reset_options(data)
	}
}

function reset_options(data = false) {
	if (data) {
		localStorage.setItem(App.ls_options, data)
	} else {
		localStorage.removeItem(App.ls_options)
	}

	get_options()
	App.update_results()
	update_infobar()
	apply_theme(App.options.theme)
	apply_mode()
}

function fill_sheet(x = false) {
	let n

	if (x) {
		n = x
	} else {
		n = get_max_line_length() - DOM.els(".line").length
	}

	for (let i = 0; i < n; i++) {
		App.add_line()
	}
}

function disable_context_menu(el) {
	el.addEventListener("contextmenu", event => event.preventDefault())
}

function focus_if_isnt(input) {
	if (input !== document.activeElement) {
		App.focus_input(input)
	}
}

function get_max_line_length() {
	return App.get_var_index("$zz") + 1
}

function undefine_variables() {
	for (let varName in App.linevars) {
		App.linevars[varName] = undefined
	}
}

function get_result_text(el) {
	let s = ""

	if (DOM.els("sup").length > 0) {
		if (DOM.els(".mwhole", el).length > 0) {
			s += DOM.el(".mwhole", el).textContent + " "
		}

		s += DOM.el("sup", el).textContent
		s += "/"
		s += DOM.el("sub", el).textContent
	} else {
		s += el.textContent.replace(/,/g, "")
	}

	return s
}

function on_result_click(el) {
	copy_to_clipboard(get_result_text(el))
}

function toggle_fraction() {
	App.options.fraction = !App.options.fraction
	App.update_results()
	apply_mode()
	update_infobar()
	update_options()
}

function copy_input_down() {
	let og_var = DOM.dataset(App.focused.input, "variable")
	let og_val = App.focused.input.value

	App.focus_next_or_add()

	if (og_var !== DOM.dataset(App.focused.input, "variable")) {
		replace_text(App.focused.input, og_val)
	}
}

function copy_result_down() {
	let og_var = DOM.dataset(App.focused.input, "variable")
	let og_result = get_result_text(DOM.el(".result", App.focused.input.parentNode))
	App.focus_next_or_add()

	if (og_var !== DOM.dataset(App.focused.input, "variable")) {
		replace_text(App.focused.input, og_result)
	}
}

function expand_value(input) {
	let val = input.value

	if (val.trim() === "") {
		return
	}

	if (val.trim().startsWith("//")) {
		return
	}

	if (val.indexOf("$") === -1) {
		return
	}

	let vr = DOM.dataset(input, "variable")
	let n = 0

	while (true) {
		let og_val = val

		val = val.replace(/\$[a-z]+/g, function (match) {
			if (match === vr) {
				return match
			}

			let v = DOM.el("#" + match.substring(1)).value

			if (v !== undefined && v.trim() !== "") {
				return `(${v})`
			} else {
				return match
			}

		})

		if (og_val === val) {
			break
		}

		n += 1

		if (n > 10000) {
			break
		}
	}

	if (val.indexOf("$") !== -1) {
		return
	}

	try {
		val = App.math_normal.parse(val).toString({ parenthesis: "auto", implicit: "show" })
	}

	catch (err) {
		return
	}

	replace_text(input, val)
}

function format_input(input) {
	let val = input.value

	if (val.trim() === "") {
		return
	}

	if (val.trim().startsWith("//")) {
		return
	}

	try {
		val = App.math_normal.parse(val).toString({ parenthesis: "auto", implicit: "show" })
	}

	catch (err) {
		return
	}

	replace_text(input, val)
}

function format_all() {
	for (let input of DOM.els(".input")) {
		format_input(input)
	}
}

function insert_text(input, s) {
	let ss = input.selectionStart
	let se = input.selectionEnd
	let value = input.value
	let new_value = value.substring(0, ss) + s + value.substring(se, value.length)
	App.focused.input.value = new_value
	App.focused.input.selectionStart = ss + s.length
	App.focused.input.selectionEnd = ss + s.length
	focus_if_isnt(input)
	App.update_results()
}

function replace_text(input, s) {
	input.value = s
	focus_if_isnt(input)
	App.update_results()
}

function erase_character() {
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
		focus_if_isnt(App.focused.input)
		App.update_results()
	}
}

function remove_ranges() {
	let ss = App.focused.input.selectionEnd
	App.focused.input.setSelectionRange(ss, ss)
}

function place_infobar() {
	let w = DOM.el("#buttons").offsetWidth
	DOM.el("#infobar").style.width = `${w}px`
}

function update_infobar() {
	let s = ""

	s += "<span id='ib_fraction_toggle' class='ib_item'>"

	if (App.options.fraction) {
		s += "Fraction Mode"
	} else {
		s += "Normal Mode"
	}

	s += "</span>"

	DOM.el("#infobar").innerHTML = s

	DOM.el("#ib_fraction_toggle").addEventListener("click", function () {
		toggle_fraction()
	})
}

function apply_theme(theme) {
	let stylesheet = document.createElement("link")
	stylesheet.onload = function () { set_modal_theme() }
	stylesheet.rel = "stylesheet"
	stylesheet.href = "themes/" + theme + ".css?v=" + App.version
	DOM.el("head").appendChild(stylesheet)
}

function apply_mode() {
	let mode

	if (App.options.fraction) {
		mode = "fraction"
	} else {
		mode = "normal"
	}

	let stylesheet = document.createElement("link")
	stylesheet.rel = "stylesheet"
	stylesheet.href = "modes/" + mode + ".css?v=" + App.version
	DOM.el("head").appendChild(stylesheet)
}

function capitalize_string(text) {
	return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

function move_caret_to_end(input) {
	input.setSelectionRange(input.value.length, input.value.length)
}

function move_caret_to_start(input) {
	input.setSelectionRange(0, 0)
}

function get_first_line() {
	return DOM.els(".line")[0]
}

function get_last_line() {
	return DOM.els(".line").slice(-1)[0]
}

function get_first_input() {
	return DOM.els(".input")[0]
}

function get_last_input() {
	return DOM.els(".input").slice(-1)[0]
}

function go_to_first_input() {
	App.focus_input(get_first_input())
}

function go_to_last_input() {
	App.focus_input(get_last_input())
}

function comment(input) {
	if (!input.value.trim().startsWith("//")) {
		replace_text(input, "// " + input.value.trim())
	}
}

function comment_all() {
	for (let input of DOM.els(".input")) {
		comment(input)
	}
}

function uncomment(input) {
	if (input.value.trim().startsWith("//")) {
		replace_text(input, input.value.replace("//", "").trim())
	}
}

function uncomment_all() {
	for (let input of DOM.els(".input")) {
		uncomment(input)
	}
}

function toggle_comment(input) {
	if (!input.value.trim().startsWith("//")) {
		replace_text(input, "// " + input.value.trim())
	} else {
		replace_text(input, input.value.replace("//", "").trim())
	}
}

function rename_key(obj, old_name, new_name) {
	if (obj.hasOwnProperty(old_name)) {
		obj[new_name] = obj[old_name]
		delete obj[old_name]
	}
}

function move_in_array(array, old_index, new_index) {
	while (old_index < 0) {
		old_index += array.length
	}

	while (new_index < 0) {
		new_index += array.length
	}

	if (new_index >= array.length) {
		let k = new_index - array.length

		while ((k--) + 1) {
			array.push(undefined)
		}
	}

	array.splice(new_index, 0, array.splice(old_index, 1)[0])
}

function on_object_modified(item) {
	try {
		let parsed = JSON.parse(item.value)

		if (parsed.version !== item.ls_name) {
			alert("You're attempting to save an incompatible version.")
			return
		}

		reset_object(item.ls_name, item.value)
	}

	catch (err) {
		alert("There was an error parsing the JSON.\n\n" + err)
	}
}

function init_msg() {
	App.msg = Msg.factory({
		id: "default",
		lock: false,
		clear_editables: true,
		window_x: "inner_right",
		close_effect: "none",
		show_effect: "none",
		enable_titlebar: true,
		center_titlebar: true,
		titlebar_class: "!custom_titlebar !unselectable",
		window_inner_x_class: "!titlebar_inner_x"
	})

	App.msg.create()
}

function show_modal(title, html, callback = function () { }) {
	App.msg.show([title, html], callback)
}

function set_modal_theme(a = true) {
	let background_color = window.getComputedStyle(document.body, null).getPropertyValue("background-color")
	let background_color_2 = App.colorlib.get_lighter_or_darker(background_color, 0.07)
	let font_color = App.colorlib.get_lighter_or_darker(background_color, 0.8)
	let overlay_color = App.colorlib.rgb_to_rgba(font_color, 0.8)

	let el = document.createElement("style")
	el.classList.add("appended_style")

	el.innerHTML = `
	.Msg-overlay {
		background-color: ${overlay_color} !important;
		color: ${background_color} !important;
	}

	.Msg-window {
		background-color: ${background_color} !important;
		color: ${font_color} !important;
	}

	.Msg-window-inner-x:hover {
		background-color: ${background_color_2} !important;
	}

	.custom_titlebar {
		background-color: ${background_color_2} !important;
		color: ${font_color} !important;
	}

	.titlebar_inner_x {
		background-color: ${background_color_2} !important;
	}

	.titlebar_inner_x:hover {
		background-color: ${background_color} !important;
	}

	.custom_popup {
		border: 1px solid ${font_color} !important;
	}

	.linky, .linky2, .linky3, a:visited, a:hover, a:link {
		color: ${font_color} !important;
	}

	</style>
	`

	for (let item of DOM.els(".appended_style")) {
		item.remove()
	}

	DOM.el("head").append(el)
}

setup_templates = function () {
	Handlebars.registerHelper("eq", (a, b) => a == b)

  DOM.els(".template").forEach(it => {
    App.templates[it.id] = Handlebars.compile(DOM.el(`#${it.id}`).innerHTML)
  })
}