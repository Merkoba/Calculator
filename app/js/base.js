let math_normal = math.create({
	number: "BigNumber",
	precision: 64
})

let math_fraction = math.create({
	number: "Fraction"
})

let letters = "abcdefghijklmnopqrstuvwxyz"
let linevars = {}
let about
let site_root
let options
let programs
let ls_options = "options_v4"
let ls_programs = "programs_v4"
let msg
let colorlib = ColorLib()

let themes = [
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

let commands = [
	"insert x",
	"clear",
	"erase",
	"add line",
	"add line before",
	"add line after",
	"go to next empty line",
	"go to first line",
	"go to last line",
	"remove line",
	"remove last line",
	"remove all lines",
	"prev variable",
	"prev input",
	"next variable",
	"next input",
	"go up",
	"go down",
	"move line up",
	"move line down",
	"format",
	"format all",
	"expand",
	"move caret to end",
	"move caret to start",
	"comment",
	"comment all",
	"uncomment",
	"uncomment all",
	"toggle comment",
	"play done",
	"play pup",
	"play nope"
]

let focused = {
	input: null
}

function init() {
	init_msg()
	get_local_storage()
	apply_theme(options.theme)
	apply_mode()
	draw_buttons()
	draw_prog_buttons()
	place_infobar()
	update_infobar()
	place_lines_container()
	key_detection()
	resize_events()
	title_click_events()
	get_site_root()
	adjust_volumes()
	add_line()
}

function key_detection() {
	document.addEventListener("keyup", function (e) {
		if (e.key === "Escape") {
			if (focused.input.value === "") {
				remove_line()
			} else {
				clear_input(focused.input)
			}
		}
	})

	document.addEventListener("keyup", function (e) {
		if (msg.is_open()) {
			return
		}

		if (e.key === "Enter") {
			if (e.shiftKey && e.ctrlKey) {
				expand_value(focused.input)
			} else if (e.shiftKey) {
				press(DOM.dataset(focused.input, "variable"))
			} else if (e.ctrlKey) {
				copy_input_down()
			} else {
				focus_next_or_add()
			}
		} else if (e.key === "Backspace") {
			if (e.shiftKey) {
				clear_input(focused.input)
				e.preventDefault()
			}
		} else if (e.key === "Tab") {
			if (e.shiftKey) {
				cycle_inputs("up")
			} else {
				cycle_inputs("down")
			}

			e.preventDefault()
		}

		else if (e.key === "ArrowUp") {
			if (e.shiftKey) {
				move_line_up()
			} else {
				line_up()
			}

			e.preventDefault()
		} else if (e.key === "ArrowDown") {
			if (e.shiftKey) {
				move_line_down()
			} else {
				line_down()
			}

			e.preventDefault()
		} else if (e.key === " ") {
			if (e.shiftKey && e.ctrlKey) {
				format_input(focused.input)
			} else if (e.shiftKey) {
				add_ans()
				e.preventDefault()
			} else if (e.ctrlKey) {
				add_input()
				e.preventDefault()
			}
		} else if (e.key === "/") {
			if (e.shiftKey && e.ctrlKey) {
				toggle_comment(focused.input)
			}
		}

		if (!e.ctrlKey) {
			focus_if_isnt(focused.input)
		}
	})
}

function draw_buttons() {
	place_button(1, "Right Click: 0.1 | Middle Click: 1/1")
	place_button(2, "Right Click: 0.2 | Middle Click: 1/2")
	place_button(3, "Right Click: 0.3 | Middle Click: 1/3")
	place_button(4, "Right Click: 0.4 | Middle Click: 1/4")
	place_button(5, "Right Click: 0.5 | Middle Click: 1/5")
	place_button(6, "Right Click: 0.6 | Middle Click: 1/6")
	place_button(7, "Right Click: 0.7 | Middle Click: 1/7")
	place_button(8, "Right Click: 0.8 | Middle Click: 1/8")
	place_button(9, "Right Click: 0.9 | Middle Click: 1/9")
	place_button(0, "Right Click: 0. | Middle Click: 000")

	place_button(".")
	place_button(",")

	buttons_br()

	place_button("+")
	place_button("-")
	place_button("*")
	place_button("/", "Right Click: Toggle Comment")
	place_button("(")
	place_button(")")
	place_button("^", "Right Click: ^2 | Middle Click: ^3")
	place_button("sqrt", "Right Click: Cube Root | Middle Click: nth Root")
	place_button("sin", "Right Click: asin | Middle Click: asinh")
	place_button("cos", "Right Click: acos | Middle Click: acosh")
	place_button("tan", "Right Click: atan | Middle Click: atanh")
	place_button("pi", "Right Click: phi | Middle Click: e")

	buttons_br()

	place_prog_buttons_area()

	buttons_br()

	place_button_wider("Up", "Right Click: Move Line Up | Middle Click: Go To First Line")
	place_button_wider("Down", "Right Click: Move Line Down | Middle Click: Go To Last Line")
	place_button_wider("New Line", "Right Click: Add Line After | Middle Click: Add Line Before")
	place_button_wider("Remove Line", "Requires Double Click | Right Click: Remove Last Line | Middle Click: Remove All Lines")
	place_button_wider("Clear", "Requires Double Click | Right Click: Format Input | Middle Click: Format All Inputs")
	place_button_wider("Erase", "")

	for (let btn of DOM.els(".button")) {
		if (btn.classList.contains("programmable")) {
			continue
		}

		let dblclickers = ["Remove Line", "Clear"]

		if (dblclickers.indexOf(btn.textContent) !== -1) {
			btn.addEventListener("mouseup", function (e) {
				if (e.which === 1) {
					if (e.detail % 2 === 0) {
						press(this.textContent)
					} else {
						focus_input(focused.input)
					}
				}
			}, false)
		} else {
			btn.addEventListener("click", function () {
				press(this.textContent)
			})
		}

		btn.addEventListener("auxclick", function (e) {
			press(this.textContent, e.which)
		})

		disable_context_menu(btn)		
	}
}

function draw_prog_buttons() {
	DOM.el("#prog_buttons").innerHTML = ""

	for (let i = 0; i < 12; i++) {
		let s = ""
		let prog = programs.items[i]
		let pt1 = ""
		let pt2 = ""
		let t1 = "Primary"
		let t2 = "Secondary"

		if (prog.primary.title !== "") {
			t1 = prog.primary.title

			if (prog.primary.doubleclick) {
				pt1 = "Double "
			}
		}

		if (prog.secondary.title !== "") {
			t2 = prog.secondary.title

			if (prog.secondary.doubleclick) {
				pt2 = "Double "
			}
		}

		s += pt1 + "Click: " + t1 + " &nbsp;|&nbsp; "
		s += pt2 + "Right Click: " + t2 + " &nbsp;|&nbsp; "
		s += "Middle Click: Program"

		place_button_programmable(prog.name, s)
	}

	let progbuttons = DOM.els(".button.programmable")

	for (let i = 0; i < progbuttons.length; i++) {
		let btn = progbuttons[i]

		btn.addEventListener("mouseup", function (event) {
			prog_press(i, event)
		}, false)

		disable_context_menu(btn)
	}
}

function place_button(s, title = "") {
	let el = document.createElement("button")
	el.title = title
	el.classList.add("button")
	el.textContent = s
	DOM.el("#buttons").appendChild(el)
}

function place_button_wider(s, title = "") {
	let el = document.createElement("button")
	el.title = title
	el.classList.add("button")
	el.classList.add("wider")
	el.textContent = s
	DOM.el("#buttons").appendChild(el)
}

function place_prog_buttons_area() {
	let el = document.createElement("span")
	el.id = "prog_buttons"
	DOM.el("#buttons").appendChild(el)
}

function place_button_programmable(s, title = "") {
	let el = document.createElement("button")
	el.title = title
	el.classList.add("button")
	el.classList.add("programmable")
	el.textContent = s
	DOM.el("#prog_buttons").appendChild(el)
}

function buttons_br() {
	let el = document.createElement("br")
	DOM.el("#buttons").appendChild(el)
}

function buttons_space() {
	let el = document.createElement("span")
	el.classList.add(buttons_space)
	DOM.el("#buttons").appendChild(el)
}

function focus_next_or_add() {
	let next_all = DOM.next_all(focused.input.parentNode, ".line")
	let found_line = false

	for (let item of next_all) {
		let inp = item.querySelector(".input")

		if (inp.value === "") {
			focus_input(inp)
			found_line = true
			return false
		}
	}

	if (!found_line) {
		add_line()
	}
}

function add_line(value = false) {
	let num_lines = DOM.els(".line").length
	let letter

	if (num_lines === get_max_line_length()) {
		play("nope")
		return
	}

	if (num_lines === 0) {
		letter = "a"
	}

	else {
		let last_var = DOM.dataset(get_last_input(), "variable")
		letter = increase_var(last_var).substring(1)
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

	focused.input = input

	DOM.els(".variable").slice(-1)[0].addEventListener("click", function () {
		press("$" + letter)
	})

	input.addEventListener("focus", function () {
		focused.input = this
		change_borders()
		check_line_visibility()
	})

	input.addEventListener("input", function () {
		update_results()
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

	focus_input(input)
	move_caret_to_end(input)
}

function add_line_before() {
	move_lines_down()
}

function add_line_after() {
	let index = DOM.index(focused.input)

	if (index === DOM.els(".line").length - 1) {
		add_line()
	}

	else {
		move_lines_down(true)
	}
}

function remove_line() {
	let index = DOM.index(focused.input)

	if (DOM.els(".line").length === 1) {
		clear_input(focused.input)
	} else if (index === DOM.els(".line").length - 1) {
		remove_last_line()
	} else {
		move_lines_up()
	}
}

function remove_all_lines() {
	undefine_variables()
	DOM.el("#lines").innerHTML = ""
	add_line()
}

function move_lines_up() {
	let line_length = DOM.els(".line").length

	if (line_length === 1) {
		play("nope")
		return
	}

	let input = focused.input
	let line = input.parentNode
	let v = DOM.dataset(input, "variable")
	let index = DOM.index(line)

	if (index === (line_length - 1)) {
		if (input === focused.input) {
			line.previousElementSibling.querySelector(".input").focus()
		}

		line.remove()
		update_results()
		return
	}

	for (let i = 0; i < line_length; i++) {
		let ln = DOM.els(".line")[i]
		let inp = ln.querySelector(".input")
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

			let ni = get_var_index(match)

			if (ni > index && ni < line_length) {
				return decrease_var(match)
			}

			return match
		})

		inp.value = val
	}

	for (let i = index + 1; i < line_length; i++) {
		let inp = DOM.els(".line")[i].querySelector(".input")
		let ninp = inp.parentNode.previousElementSibling.querySelector(".input")

		ninp.value = inp.value
		inp.value = ""
	}

	get_last_line().remove()
	update_results()
}

function move_lines_down(alt = false) {
	let line_length = DOM.els(".line").length

	if (line_length === get_max_line_length()) {
		play("nope")
		return
	}

	if (alt) {
		focus_next()
	}

	let input = focused.input
	let line = input.parentNode
	let v = DOM.dataset(input, "variable")
	let index = DOM.index(line)

	for (let i = 0; i < line_length; i++) {
		let ln = DOM.els(".line")[i]
		let inp = ln.querySelector(".input")
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

			let ni = get_var_index(match)

			if (ni > index && ni < line_length) {
				return increase_var(match)
			}

			return match
		})

		inp.value = val
	}

	add_line()

	line_length = DOM.els(".line").length

	for (let i = line_length - 1; i > index; i--) {
		let inp = DOM.els(".line")[i].querySelector(".input")
		let ninp = inp.parentNode.previousElementSibling.querySelector(".input")

		inp.value = ninp.value
	}

	input.value = ""

	focus_input(input)

	update_results()
}

function decrease_var(v) {
	let letter = v.substring(1)
	let res = ""
	let decrease_next = true

	for (let i = letter.length - 1; i >= 0; i--) {
		if (decrease_next) {
			if (letter[i] === letters[0]) {
				if (i === 0) {
					break
				}

				else {
					res += letters[letters.length - 1]
					decrease_next = true
				}
			}

			else {
				res += letters[letters.indexOf(letter[i]) - 1]
				decrease_next = false
			}
		}

		else {
			res += letters[letters.indexOf(letter[i])]
		}
	}

	return "$" + res.split("").reverse().join("")
}

function increase_var(v) {
	let letter = v.substring(1)
	let res = ""
	let increase_next = true

	for (let i = letter.length - 1; i >= 0; i--) {
		if (increase_next) {
			if (letter[i] === letters[letters.length - 1]) {
				res += letters[0]
				increase_next = true

				if (i == 0) {
					res += "a"
				}
			}

			else {
				res += letters[letters.indexOf(letter[i]) + 1]
				increase_next = false
			}
		}

		else {
			res += letters[letters.indexOf(letter[i])]
		}
	}

	return "$" + res.split("").reverse().join("")
}

function get_var_index(v) {
	let letter = v.substring(1)
	let n = letter.length - 1
	let index = 0

	for (let i = 0; i < letter.length; i++) {
		let t = letters.indexOf(letter[i]) + 1
		let p = Math.pow(letters.length, n)

		t *= p

		if (t === 0) {
			t += letters.indexOf(letter[i])
		}

		index += t

		n -= 1
	}

	index -= 1
	return index
}

function remove_last_line() {
	if (DOM.els(".line").length === 1) {
		clear_input(focused.input)
		return
	}

	let line = get_last_line()
	let input = get_last_input()

	if (input === focused.input) {
		line.previousElementSibling.querySelector(".input").focus()
	}

	line.remove()
	update_results()
}

function get_result(input) {
	let result = input.parentNode.querySelector(".result")
	result.innerHTML = ""

	try {
		let val = input.value

		if (val.trim().startsWith("//")) {
			show_comment(input)
			return
		}

		if (val.trim().length === 0) {
			return
		}

		if (options.fraction) {
			result = math_fraction.eval(val + "*1", linevars)
		}

		else {
			result = math_normal.eval(val + "*1", linevars)
		}

		update_variable(input, result)
		show_result(input, format_result(result))
	}

	catch (err) {
		show_error(input)
	}
}

function show_error(input) {
	show_result(input, "Error")
}

function show_comment(input) {
	show_result(input, "Comment")
}

function show_result(input, s) {
	input.parentNode.querySelector(".result").innerHTML = s
}

function update_variable(input, val) {
	linevars[DOM.dataset(input, "variable")] = val
}

function improper_to_mixed(n, d) {
	i = parseInt(n / d)
	n -= i * d
	return [i, n, d]
}

function format_result(n, f = false) {
	if (options.fraction && !f) {
		let split = math_fraction.format(n).split("/")

		if (split.length === 2) {
			let sup = split[0]
			let sub = split[1]

			let nsup = parseInt(sup)
			let nsub = parseInt(sub)

			if (options.mixed && nsup >= nsub) {
				let mixed = improper_to_mixed(nsup, nsub)
				let mwhole = mixed[0]

				if (mixed[1] !== 0 && mixed[2] !== 0) {
					sup = mixed[1]
					sub = mixed[2]
				}

				else {
					return format_result(mwhole, true)
				}

				return `<span class="resolved"><span class="mwhole">${mwhole}</span><span class="fraction"><sup>${sup}</sup><sub>${sub}</sub></span></span>`
			}

			else {
				return `<span class="resolved"><span class="fraction"><sup>${sup}</sup><sub>${sub}</sub></span></span>`
			}
		}

		else {
			return format_result(n, true)
		}
	}

	else {
		if (options.round) {
			n = math_normal.round(n, options.round_places)
		}

		let ns = n.toString()
		let whole, decimal

		if (ns.indexOf(".") !== -1) {
			let split = ns.split(".")
			whole = split[0].toString() + "."
			decimal = split[1].toString()
		}

		else {
			whole = n.toString()
			decimal = ""
		}

		if (options.commas) {
			whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		}

		return `<span class="resolved"><span class="whole">${whole}</span><span class="decimal">${decimal}</span></span>`
	}
}

function press(s, aux = false) {
	if (s === "sin") {
		s = "sin("
	}

	else if (s === "cos") {
		s = "cos("
	}

	else if (s === "tan") {
		s = "tan("
	}

	else if (s === "sqrt") {
		s = "sqrt("
	}

	if (aux) {
		s = check_aux(s, aux)

		if (!s) {
			focus_input(focused.input)
			return
		}
	}

	if (s === "Clear") {
		clear_input(focused.input)
		return
	}

	else if (s === "Erase") {
		erase_character()
		return
	}

	else if (s === "New Line") {
		focus_next_or_add()
		focus_input(focused.input)
		return
	}

	else if (s === "Remove Line") {
		remove_line()
		focus_input(focused.input)
		return
	}

	else if (s === "Up") {
		line_up()
		focus_input(focused.input)
		return
	}

	else if (s === "Down") {
		line_down()
		focus_input(focused.input)
		return
	}

	let v = DOM.dataset(focused.input, "variable")

	if (s === v) {
		focus_next_or_add()
		v = DOM.dataset(focused.input, "variable")

		if (s === v) {
			return
		}
	}

	insert_text(focused.input, s)
}

function blur_focus() {
	focused.input.blur()
	focused.input.focus()
}

function check_aux(s, aux) {
	if (aux) {
		for (let i = 1; i < 10; i++) {
			if (s == i) {
				if (aux === 3) {
					return "0." + i
				}

				else if (aux === 2) {
					return "1/" + i
				}
			}
		}

		if (s == 0) {
			if (aux === 3) {
				return "0."
			}

			else if (aux === 2) {
				return "000"
			}
		}

		else if (s === "cos(") {
			if (aux === 3) {
				return "acos("
			}

			else if (aux === 2) {
				return "acosh("
			}
		}

		else if (s === "tan(") {
			if (aux === 3) {
				return "atan("
			}

			else if (aux === 2) {
				return "atanh("
			}
		}

		else if (s === "sin(") {
			if (aux === 3) {
				return "asin("
			}

			else if (aux === 2) {
				return "asinh("
			}
		}

		else if (s === "^") {
			if (aux === 3) {
				return "^2"
			}

			else if (aux === 2) {
				return "^3"
			}
		}

		else if (s === "sqrt(") {
			if (aux === 3) {
				return "cbrt("
			}

			else if (aux === 2) {
				return "nthRoot("
			}
		}

		else if (s === "pi") {
			if (aux === 3) {
				return "phi"
			}

			else if (aux === 2) {
				return "e"
			}
		}

		else if (s === "/") {
			if (aux === 3) {
				toggle_comment(focused.input)
				return false
			}
		}

		else if (s === "Up") {
			if (aux === 3) {
				move_line_up()
				return false
			}

			else if (aux === 2) {
				go_to_first_input()
				return false
			}
		}

		else if (s === "Down") {
			if (aux === 3) {
				move_line_down()
				return false
			}

			else if (aux === 2) {
				go_to_last_input()
				return false
			}
		}

		else if (s === "Remove Line") {
			if (aux === 3) {
				remove_last_line()
				return false
			}

			else if (aux === 2) {
				remove_all_lines()
				return false
			}
		}

		else if (s === "New Line") {
			if (aux === 3) {
				add_line_after()
				return false
			}

			else if (aux === 2) {
				add_line_before()
				return false
			}
		}

		else if (s === "Clear") {
			if (aux === 3) {
				format_input(focused.input)
				return false
			}

			if (aux === 2) {
				format_all()
				return false
			}
		}
	}

	return false
}

function prog_press(key, e) {
	if (e.which === 2) {
		show_program_editor(key)
		return
	}

	focus_if_isnt(focused.input)

	let prog = programs.items[key]

	if (prog !== undefined) {
		if (e.which === 1) {
			if (prog.primary.doubleclick) {
				if (e.detail % 2 !== 0) {
					return
				}
			}

			execute_program(prog.primary.commands)
		}

		if (e.which === 3) {
			if (prog.secondary.doubleclick) {
				if (e.detail % 2 !== 0) {
					return
				}
			}

			execute_program(prog.secondary.commands)
		}
	}
}

function clear_input(input) {
	if (input.value === "") {
		return
	}

	replace_text(input, "")
}

let update_results = (function () {
	let timer
	return function () {
		clearTimeout(timer)
		timer = setTimeout(function () {
			do_update_results()
		}, 10)
	}
})()

function do_update_results() {
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
					get_result(DOM.el("#" + letter))
				} else {
					show_result(DOM.el("#" + letter), "Not Acyclical")
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
		get_result(DOM.el("#" + letter))
	}
}

function check_line_visibility() {
	let it = focused.input.parentNode.getBoundingClientRect().top
	let ct = DOM.el("#lines_container").getBoundingClientRect().top

	if (it < ct) {
		DOM.el("#lines_container").scrollTop = DOM.el("#lines_container").scrollTop - (ct - it)
	}

	let ib = it + focused.input.parentNode.offsetHeight
	let cb = ct + DOM.el("#lines_container").offsetHeight

	if (ib > cb) {
		DOM.el("#lines_container").scrollTop = DOM.el("#lines_container").scrollTop + (ib - cb)
	}
}

function focus_input(input) {
	input.focus()
}

function focus_next() {
	let line = focused.input.parentNode.nextElementSibling
	if (line) {
		line.querySelector(".input").focus()
	}
}

function focus_prev() {
	let line = focused.input.parentNode.previousElementSibling
	if (line) {
		line.querySelector(".input").focus()
	}
}

function line_up() {
	focus_prev()
}

function line_down() {
	focus_next()
}

function move_line_up() {
	let index = DOM.index(focused.input)

	if (index === 0) {
		play("nope")
		return
	}

	let inp = focused.input
	let ninp = inp.parentNode.previousElementSibling.querySelector(".input")

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

	update_results()
}

function move_line_down() {
	let index = DOM.index(focused.input)

	if (index === (DOM.els(".line").length - 1)) {
		play("nope")
		return
	}

	let inp = focused.input
	let ninp = inp.parentNode.nextElementSibling.querySelector(".input")

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

	update_results()
}

function cycle_inputs(direction) {
	if (DOM.els(".input").length === 1) {
		return
	}

	let index = DOM.index(focused.input)

	if (direction === "down") {
		if (index === (DOM.els(".input").length - 1)) {
			go_to_first_input()
		}

		else {
			focus_next()
		}
	}

	else {
		if (index === 0) {
			go_to_last_input()
		}

		else {
			focus_prev()
		}
	}
}

function change_borders() {
	for (let input of DOM.els(".input")) {
		input.classList.remove("input_focus")
	}

	focused.input.classList.add("input_focus")
}

function place_lines_container() {
	let h = window.innerHeight - DOM.el("#app_top").offsetHeight
	DOM.el("#lines_container").style.height = `${h}px`
}

function resize_events() {
	window.addEventListener("resize", function () {
		resize_timer()
	})
}

let resize_timer = (function () {
	let timer
	return function () {
		clearTimeout(timer)
		timer = setTimeout(function () {
			place_infobar()
			place_lines_container()
		}, 350)
	}
})()

function play(what) {
	if (options.sound) {
		DOM.el("#" + what).pause()
		DOM.el("#" + what).currentTime = 0
		DOM.el("#" + what).play()
	}
}

function refresh_page() {
	document.location = site_root
}

function new_sheet() {
	remove_all_lines()
}

function title_click_events() {
	DOM.el("#lnk_new").addEventListener("click", function () {
		new_sheet()
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
	if (options.fraction) {
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

function create_about() {
	let s = ""

	s += "<b>Merkoba Calculator</b><br>"
	s += "Version " + app_version + "<br><br>"
	s += "This is a calculator that aims to empower users through a different workflow than what is found in most common calculator programs.<br><br>"
	s += "It's based around multiple \"lines\" of calculations which can be reused and edited anytime.<br><br>"
	s += "Calculations are done by the <a href='http://mathjs.org/docs/index.html' target=_blank>math.js</a> library, with high precision settings enabled.<br><br>"
	s += "Calculations are done automatically in real time using topological sorting.<br><br>"
	s += "Since it needs to by acyclical, some variables can't be used in some places. For example you can't make $b depend on $a and $a depend on $b at the same time, since it can't be resolved.<br><br>"
	s += "There are 12 programmable buttons that can be set to execute certain commands in order.<br><br>"
	s += "Note: Formatting and rounding are only applied to the displayed results, not to internal calculations."

	s += "<br><br><br><span class='b2'>Shortcuts</span><br><br>"
	s += "Enter will focus the next available empty line or create a new one.<br><br>"
	s += "Shift + Enter does the same but also adds the previous line's variable into the new one.<br><br>"
	s += "Control + Enter does the same but also copies the line's input into the new one.<br><br>"
	s += "Control + Shift + Enter replaces a line's input's variables with their corresponding inputs.<br><br>"
	s += "Shift + Space adds the variable from the line above to the current line.<br><br>"
	s += "Control + Space adds the input from the line above to the current line.<br><br>"
	s += "Control + Shift + Space formats the input.<br><br>"
	s += "Up and Down arrows change the focus between lines.<br><br>"
	s += "Shift + Up and Shift + Down move the lines up or down.<br><br>"
	s += "Tab and Shift + Tab cycle the focus between lines.<br><br>"
	s += "Escape clears a line, removes the line if already cleared, or closes popups.<br><br>"
	s += "Shift + Backspace clears a line.<br><br>"
	s += "Control + Shift + / toggles line comments.<br><br>"
	s += "Clicking on a result copies the result to the clipboard.<br><br>"
	s += "Some buttons have other mapped functions. Hover the cursor over a button to see if it does."

	about = s
}

function show_about() {
	if (about === undefined) {
		create_about()
	}

	show_modal("About", about)
}

function check_params() {
	if (get_url_param("frac") === null) {
		if (options.fraction) {
			toggle_fraction()
		}
	}

	else {
		if (!options.fraction) {
			toggle_fraction()
		}
	}
}

function get_site_root() {
	site_root = window.location.href.match(/^.*\//)[0]
}

function adjust_volumes() {
	DOM.el("#nope").volume = 0.4
	DOM.el("#pup").volume = 0.6
	DOM.el("#done").volume = 0.7
}

function add_ans(next = false) {
	let variable

	if (next) {
		let line = focused.input.parentNode.nextElementSibling
		if (!line) { return }
		let input = line.querySelector(".input")
		variable = DOM.dataset(input, "variable")
	} else {
		let line = focused.input.parentNode.previousElementSibling
		if (!line) { return }
		let input = line.querySelector(".input")
		variable = DOM.dataset(input, "variable")
	}

	if (variable !== undefined) {
		press(variable)
	}
}

function add_result(next = false) {
	let result

	if (next) {
		result = focused.input.parentNode.nextElementSibling.querySelector(".result")
	}
	
	else {
		result = focused.input.parentNode.previousElementSibling.querySelector(".result")
	}

	if (result !== undefined) {
		press(get_result_text(result))
	}
}

function add_input(next = false) {
	let value

	if (next) {
		value = focused.input.parentNode.nextElementSibling.querySelector(".input").value
	}

	else {
		value = focused.input.parentNode.previousElementSibling.querySelector(".input").value
	}

	if (value !== undefined && value !== "") {
		press(value)
	}
}

function show_options() {
	let s = ""

	s += "<div id='options_container'>"
	s += "<div class='options_item'>"
	s += "Add Commas"
	s += "<div class='vseparator2'></div>"

	if (options.commas) {
		s += "<input id='chk_commas' type='checkbox' checked>"
	}

	else {
		s += "<input id='chk_commas' type='checkbox'>"
	}

	s += "</div>"
	s += "<div class='vseparator'></div>"
	s += "<div class='options_item'>"
	s += "Mixed Fractions"
	s += "<div class='vseparator2'></div>"

	if (options.mixed) {
		s += "<input id='chk_mixed' type='checkbox' checked>"
	}

	else {
		s += "<input id='chk_mixed' type='checkbox'>"
	}

	s += "</div>"
	s += "<div class='vseparator'></div>"
	s += "<div class='options_item'>"
	s += "Round Results"
	s += "<div class='vseparator2'></div>"

	if (options.round) {
		s += "<input id='chk_round' type='checkbox' checked>"
	}

	else {
		s += "<input id='chk_round' type='checkbox'>"
	}

	s += "</div>"
	s += "<div class='vseparator'></div>"
	s += "<div class='options_item'>"
	s += "Round Places"
	s += "<div class='vseparator2'></div>"
	s += "<select id='sel_round_places'>"

	for (let i = 0; i < 31; i++) {
		s += "<option value='" + i + "'>" + i + "</option>"
	}

	s += "</select>"
	s += "</div>"
	s += "<div class='vseparator'></div>"
	s += "<div class='options_item'>"
	s += "Enable Sound"
	s += "<div class='vseparator2'></div>"

	if (options.sound) {
		s += "<input id='chk_sound' type='checkbox' checked>"
	}

	else {
		s += "<input id='chk_sound' type='checkbox'>"
	}

	s += "</div>"
	s += "<div class='vseparator'></div>"
	s += "<div class='options_item'>"
	s += "Color Theme"
	s += "<div class='vseparator2'></div>"
	s += "<select id='sel_theme'>"

	for (let i = 0; i < themes.length; i++) {
		s += "<option value='" + themes[i] + "'>" + capitalize_string(themes[i]) + "</option>"
	}

	s += "</select>"
	s += "</div>"
	s += "</div>"

	show_modal("Options", s)

	let els = Array.from(DOM.el("#sel_round_places").querySelectorAll("option"))
	
	for (let el of els) {
		if (el.value == options.round_places) {
			el.selected = true
		}
	}

	els = Array.from(DOM.el("#sel_theme").querySelectorAll("option"))
	
	for (let el of els) {
		if (el.value == options.theme) {
			el.selected = true
		}
	}

	DOM.el("#chk_commas").addEventListener("change", function () {
		options.commas = this.checked
		update_results()
		update_options()
	})

	DOM.el("#chk_round").addEventListener("change", function () {
		options.round = this.checked
		update_results()
		update_options()
	})

	DOM.el("#sel_round_places").addEventListener("change", function () {
		options.round_places = parseInt(this.value)
		update_results()
		update_options()
	})

	DOM.el("#chk_mixed").addEventListener("change", function () {
		options.mixed = this.checked
		update_results()
		update_options()
	})

	DOM.el("#chk_sound").addEventListener("change", function () {
		options.sound = this.checked
		update_options()
	})

	DOM.el("#sel_theme").addEventListener("change", function () {
		options.theme = this.value
		apply_theme(options.theme)
		update_options()
	})
}

function get_local_storage() {
	get_options()
	get_programs()
}

function update_options() {
	localStorage.setItem(ls_options, JSON.stringify(options))
}

function get_options() {
	options = JSON.parse(localStorage.getItem(ls_options))

	let mod = false

	if (options === null) {
		options = {}
		mod = true
	}

	if (options.version === undefined) {
		options.version = ls_options
		mod = true
	}

	if (options.sound === undefined) {
		options.sound = true
		mod = true
	}

	if (options.commas === undefined) {
		options.commas = true
		mod = true
	}

	if (options.round === undefined) {
		options.round = true
		mod = true
	}

	if (options.round_places === undefined) {
		options.round_places = 10
		mod = true
	}

	if (options.fraction === undefined) {
		options.fraction = false
		mod = true
	}

	if (options.mixed === undefined) {
		options.mixed = false
		mod = true
	}

	if (options.theme === undefined) {
		options.theme = "carbon"
		mod = true
	}

	else {
		if (themes.indexOf(options.theme) === -1) {
			options.theme = "carbon"
			mod = true
		}
	}

	if (mod) {
		update_options()
	}
}

function get_programs() {
	programs = JSON.parse(localStorage.getItem(ls_programs))

	let mod = false

	if (programs === null) {
		programs = {}
		mod = true
	}

	if (programs.version === undefined) {
		programs.version = ls_programs
		mod = true
	}

	if (programs.items === undefined) {
		programs.items = []
		mod = true
	}

	for (let i = 0; i < 12; i++) {
		if (programs.items[i] === undefined) {
			programs.items[i] = {}
			mod = true
		}

		if (programs.items[i].name === undefined) {
			programs.items[i].name = "F" + (i + 1)
			mod = true
		}

		if (programs.items[i].primary === undefined) {
			programs.items[i].primary = {}
			mod = true
		}

		if (programs.items[i].primary.title === undefined) {
			programs.items[i].primary.title = ""
			mod = true
		}

		if (programs.items[i].primary.commands === undefined) {
			programs.items[i].primary.commands = ""
			mod = true
		}

		if (programs.items[i].primary.doubleclick === undefined) {
			programs.items[i].primary.doubleclick = false
			mod = true
		}

		if (programs.items[i].secondary === undefined) {
			programs.items[i].secondary = {}
			mod = true
		}

		if (programs.items[i].secondary.title === undefined) {
			programs.items[i].secondary.title = ""
		}

		if (programs.items[i].secondary.commands === undefined) {
			programs.items[i].secondary.commands = ""
			mod = true
		}

		if (programs.items[i].secondary.doubleclick === undefined) {
			programs.items[i].secondary.doubleclick = false
			mod = true
		}
	}

	if (mod) {
		update_programs()
	}
}

function update_programs() {
	localStorage.setItem(ls_programs, JSON.stringify(programs))
}

function reset_object(ls_name, data = false) {
	if (ls_name === ls_options) {
		reset_options(data)
	} else if (ls_name === ls_programs) {
		reset_programs(data)
	}
}

function reset_options(data = false) {
	if (data) {
		localStorage.setItem(ls_options, data)
	}

	else {
		localStorage.removeItem(ls_options)
	}

	get_options()
	update_results()
	update_infobar()
	apply_theme(options.theme)
	apply_mode()
}

function reset_programs(data = false) {
	if (data) {
		localStorage.setItem(ls_programs, data)
	}

	else {
		localStorage.removeItem(ls_programs)
	}

	get_programs()
	draw_prog_buttons()
}

function fill_sheet(x = false) {
	let n

	if (x) {
		n = x
	}

	else {
		n = get_max_line_length() - DOM.els(".line").length
	}

	for (let i = 0; i < n; i++) {
		add_line()
	}
}

function disable_context_menu(el) {
	el.addEventListener("contextmenu", event => event.preventDefault())
}

function focus_if_isnt(input) {
	if (input !== document.activeElement) {
		focus_input(input)
	}
}

function get_max_line_length() {
	return get_var_index("$zz") + 1
}

function undefine_variables() {
	for (let varName in linevars) {
		linevars[varName] = undefined
	}
}

function get_result_text(el) {
	let s = ""

	if (Array.from(el.querySelectorAll("sup")).length > 0) {
		if (Array.from(el.querySelectorAll(".mwhole")).length > 0) {
			s += el.querySelector(".mwhole").textContent + " "
		}

		s += el.querySelector("sup").textContent

		s += "/"

		s += el.querySelector("sub").textContent
	}

	else {
		s += el.textContent.replace(/,/g, "")
	}

	return s
}

function on_result_click(el) {
	copy_to_clipboard(get_result_text(el))
	play("pup")
}

function toggle_fraction() {
	options.fraction = !options.fraction
	update_results()
	apply_mode()
	update_infobar()
	update_options()
}

function copy_input_down() {
	let og_var = DOM.dataset(focused.input, "variable")
	let og_val = focused.input.value

	focus_next_or_add()

	if (og_var !== DOM.dataset(focused.input, "variable")) {
		replace_text(focused.input, og_val)
	}
}

function copy_result_down() {
	let og_var = DOM.dataset(focused.input, "variable")
	let og_result = get_result_text(focused.input.parentNode.querySelector(".result"))

	focus_next_or_add()

	if (og_var !== DOM.dataset(focused.input, "variable")) {
		replace_text(focused.input, og_result)
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
			}

			else {
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
		play("nope")
		return
	}

	try {
		val = math_normal.parse(val).toString({ parenthesis: "auto", implicit: "show" })
	}

	catch (err) {
		play("nope")
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
		val = math_normal.parse(val).toString({ parenthesis: "auto", implicit: "show" })
	}

	catch (err) {
		play("nope")
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
	focused.input.value = new_value
	focused.input.selectionStart = ss + s.length
	focused.input.selectionEnd = ss + s.length
	focus_if_isnt(input)
	update_results()
}

function replace_text(input, s) {
	input.value = s
	focus_if_isnt(input)
	update_results()
}

function erase_character() {
	let ss = focused.input.selectionStart
	let se = focused.input.selectionEnd
	let value = focused.input.value

	if (ss === se) {
		if (ss === 0) {
			focus_input(focused.input)
			return
		}

		let new_value = value.substring(0, ss - 1) + value.substring(se, value.length)
		focused.input.value = new_value
		focused.input.selectionStart = ss - 1
		focused.input.selectionEnd = ss - 1
		focus_if_isnt(focused.input)
		update_results()
	}
}

function remove_ranges() {
	let ss = focused.input.selectionEnd
	focused.input.setSelectionRange(ss, ss)
}

function place_infobar() {
	let w = DOM.el("#buttons").offsetWidth
	DOM.el("#infobar").style.width = `${w}px`
}

function update_infobar() {
	let s = ""

	s += "<span id='ib_fraction_toggle' class='ib_item'>"

	if (options.fraction) {
		s += "Fraction Mode"
	}

	else {
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
	stylesheet.href = "themes/" + theme + ".css?v=" + app_version
	DOM.el("head").appendChild(stylesheet)
}

function apply_mode() {
	let mode

	if (options.fraction) {
		mode = "fraction"
	}

	else {
		mode = "normal"
	}

	let stylesheet = document.createElement("link")
	stylesheet.rel = "stylesheet"
	stylesheet.href = "modes/" + mode + ".css?v=" + app_version
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

function show_program_editor(key) {
	let s = ""

	s += "<input maxlength='5' id='prog_key_name' class='prog_input prog_key_input'><br><br><br>"
	s += "<div id='prog_p_label' class='prog_label'>Primary Action Title</b2></div>"
	s += "<input type='text' id='prog_p_title' class='prog_input prog_input_smaller'></input>"
	s += "<br><br><br>"
	s += "<div class='prog_label'>Primary Action Commands</div>"
	s += "<input type='text' id='prog_p_commands' class='prog_input'></input>"
	s += "<div id='prog_p_commands_error' class='error_message'></div>"
	s += "<br><br><br>"
	s += "<div class='prog_label'>Require Double Click</div>"
	s += "<input type='checkbox' id='prog_p_dbl'>"
	s += "<br><br><br><br>"
	s += "<div id='prog_s_label' class='prog_label'>Secondary Action Title</div>"
	s += "<input type='text' id='prog_s_title' class='prog_input prog_input_smaller'></input>"
	s += "<br><br><br>"
	s += "<div class='prog_label'>Secondary Action Commands</div>"
	s += "<input type='text' id='prog_s_commands' class='prog_input'></input>"
	s += "<div id='prog_s_commands_error' class='error_message'></div>"
	s += "<br><br><br>"
	s += "<div class='prog_label'>Require Double Click</div>"
	s += "<input type='checkbox' id='prog_s_dbl'>"
	s += "<br><br><br>"
	s += "<span id='prog_save' class='linky2'>Save</span>"
	s += "<br><br><br><div class='prog_label'>Swap With</div>"
	s += "<select id='sel_prog_swap'>"
	s += "<option value='--'></option>"

	for (let i = 0; i < programs.items.length; i++) {
		if (i === key) {
			s += "<option value='" + i + "' disabled>" + programs.items[i].name + "</option>"
		}

		else {
			s += "<option value='" + i + "'>" + programs.items[i].name + "</option>"
		}
	}

	s += "</select>"

	s += "<br><br><br><div class='prog_label'>Move To</div>"

	s += "<select id='sel_prog_move'>"

	s += "<option value='--'></option>"

	for (let i = 0; i < programs.items.length; i++) {
		if (i === key) {
			s += "<option value='" + i + "' disabled>" + programs.items[i].name + "</option>"
		}

		else {
			s += "<option value='" + i + "'>" + programs.items[i].name + "</option>"
		}
	}

	s += "</select>"

	s += "<br><br><br>"

	s += "<div class='prog_label underline'>Available Commands</div>"

	for (let i = 0; i < commands.length; i++) {
		s += commands[i] + "<br>"
	}

	s += "<br><br>"

	s += "<div class='prog_label underline'>Examples</div>"
	s += "insert 34<br>"
	s += "insert pi<br>"
	s += "add line; insert cos(55)<br>"
	s += "go up; erase; format<br>"
	s += "insert 1; add line after; prev variable; insert + 2"

	show_modal("Program Editor", s)

	let prog = programs.items[key]

	if (prog !== undefined) {
		DOM.el("#prog_key_name").value = prog.name

		DOM.el("#prog_p_title").value = prog.primary.title
		DOM.el("#prog_p_commands").value = prog.primary.commands

		DOM.el("#prog_s_title").value = prog.secondary.title
		DOM.el("#prog_s_commands").value = prog.secondary.commands

		DOM.el("#prog_p_dbl").checked = prog.primary.doubleclick
		DOM.el("#prog_s_dbl").checked = prog.secondary.doubleclick
	}

	DOM.el("#prog_save").addEventListener("click", function () {
		save_program(key, prog.name)
	})

	DOM.el("#sel_prog_swap").addEventListener("change", function () {
		prog_swap(key, parseInt(this.value))
	})

	DOM.el("#sel_prog_move").addEventListener("change", function () {
		prog_move(key, parseInt(this.value))
	})

	let els = DOM.els(".prog_input")

	for (let el of els) {
		el.addEventListener("keyup", function (e) {
			if (e.key === "Enter") {
				save_program(key, prog.name)
			}
		})
	}
}

function prog_swap(index1, index2) {
	if (index2 !== "--" && index1 !== index2) {
		let temp = programs.items[index1]

		programs.items[index1] = programs.items[index2]
		programs.items[index2] = temp

		msg.close()
		draw_prog_buttons()
		update_programs()
	}
}

function prog_move(oldKey, newKey) {
	if (newKey !== "--" && oldKey !== newKey) {
		move_in_array(programs.items, oldKey, newKey)

		msg.close()
		draw_prog_buttons()
		update_programs()
	}
}

function save_program(key, name) {
	let prog_key_name = DOM.el("#prog_key_name").value.trim().replace(/\s+/g, "")

	let p_title = DOM.el("#prog_p_title").value.trim().replace(/\s+/g, " ")
	let p_commands = DOM.el("#prog_p_commands").value.replace(/\s*;[;\s]*/g, "; ").replace(/\s+/g, " ").replace(/^;+/, "").trim().replace(/;$/, "")
	let p_dbl = DOM.el("#prog_p_dbl").checked

	let s_title = DOM.el("#prog_s_title").value.trim().replace(/\s+/g, " ")
	let s_commands = DOM.el("#prog_s_commands").value.replace(/\s*;[;\s]*/g, "; ").replace(/\s+/g, " ").replace(/^;+/, "").trim().replace(/;$/, "")
	let s_dbl = DOM.el("#prog_s_dbl").checked

	if (prog_key_name === "") {
		prog_key_name = name
		DOM.el("#prog_key_name").value = name
	}

	DOM.el("#prog_p_commands").value = p_commands
	DOM.el("#prog_s_commands").value = s_commands

	if (check_program(p_commands, s_commands)) {
		msg.close()

		programs.items[key].name = prog_key_name

		programs.items[key].primary.title = p_title
		programs.items[key].primary.commands = p_commands
		programs.items[key].primary.doubleclick = p_dbl

		programs.items[key].secondary.title = s_title
		programs.items[key].secondary.commands = s_commands
		programs.items[key].secondary.doubleclick = s_dbl

		draw_prog_buttons()
		update_programs()
	}

	else {
		play("nope")
	}
}

function check_program(p_commands, s_commands) {
	let ok = true
	let response = execute_program(p_commands, false)

	if (response[0] !== "ok") {
		DOM.el("#prog_p_commands_error").textContent = '"' + response[1] + '" is not a valid command.'
		DOM.el("#prog_p_commands_error").style.display = "block"

		focus_command_error(DOM.el("#prog_p_commands"), response)

		DOM.el("#Msg-content-default").scrollTop = 
			DOM.el("#prog_p_label").getBoundingClientRect().top - 
			DOM.el("#Msg-content-default").getBoundingClientRect().top + 
			(DOM.el("#Msg-content-default").scrollTop - 10)

		ok = false
	}

	else {
		DOM.el("#prog_p_commands_error").style.display = "none"
	}

	response = execute_program(s_commands, false)

	if (response[0] !== "ok") {
		DOM.el("#prog_s_commands_error").textContent = '"' + response[1] + '" is not a valid command.'
		DOM.el("#prog_s_commands_error").style.display = "block"

		if (ok) {
			focus_command_error(DOM.el("#prog_s_commands"), response)
			DOM.el("#Msg-content-default").scrollTop = 
				DOM.el("#prog_s_label").getBoundingClientRect().top - 
				DOM.el("#Msg-content-default").getBoundingClientRect().top + 
				(DOM.el("#Msg-content-default").scrollTop - 10)
		}

		ok = false
	}

	else {
		DOM.el("#prog_s_commands_error").style.display = "none"
	}

	return ok
}

function focus_command_error(input, response) {
	let indices = []
	let str = input.value
	let index

	for (let i = 0; i < str.length; i++) {
		if (str[i] === ";") indices.push(i)
	}

	if (indices.length === 0) {
		index = 0
	}

	else {
		if (response[2] === indices.length) {
			index = input.value.length - response[1].length
		}

		else {
			index = indices[response[2]] - response[1].length
		}
	}

	if (index !== undefined) {
		input.setSelectionRange(index, index)
	}

	input.focus()
}

function execute_program(cmds, run = true) {
	if (cmds.length === 0) {
		return ["ok"]
	}

	let split = cmds.split(";")

	for (let i = 0; i < split.length; i++) {
		let command = split[i].trim().replace(/\s+/g, " ")

		if (command.length === 0) {
			continue
		}

		if (command.indexOf(" ") !== -1) {
			let splt = command.split(" ")

			if (splt[0].toLowerCase() === "insert") {
				if (run) {
					insert_text(focused.input, splt.slice(1).join(" "))
				}

				continue
			}
		}

		if (commands.indexOf(command.toLowerCase()) !== -1) {
			if (run) {
				execute_command(command.toLowerCase())
			}
		}

		else {
			if (run) {
				show_execution_error(command)
			}

			return ["fail", command, i]
		}
	}

	return ["ok"]
}

function execute_command(command) {
	if (command === "clear") {
		clear_input(focused.input)
	}

	else if (command === "erase") {
		erase_character()
	}

	else if (command === "add line") {
		add_line()
	}

	else if (command === "add line before") {
		add_line_before()
	}

	else if (command === "add line after") {
		add_line_after()
	}

	else if (command === "go to first line") {
		go_to_first_input()
	}

	else if (command === "go to last line") {
		go_to_last_input()
	}

	else if (command === "go to next empty line") {
		focus_next_or_add()
	}

	else if (command === "remove line") {
		remove_line()
	}

	else if (command === "remove last line") {
		remove_last_line()
	}

	else if (command === "remove all lines") {
		remove_all_lines()
	}

	else if (command === "prev variable") {
		add_ans()
	}

	else if (command === "prev input") {
		add_input()
	}

	else if (command === "next variable") {
		add_ans(true)
	}

	else if (command === "next input") {
		add_input(true)
	}

	else if (command === "go up") {
		line_up()
	}

	else if (command === "go down") {
		line_down()
	}

	else if (command === "move line up") {
		move_line_up()
	}

	else if (command === "move line down") {
		move_line_down()
	}

	else if (command === "format") {
		format_input(focused.input)
	}

	else if (command === "format all") {
		format_all()
	}

	else if (command === "expand") {
		expand_value(focused.input)
	}

	else if (command === "move caret to end") {
		move_caret_to_end(focused.input)
	}

	else if (command === "move caret to start") {
		move_caret_to_start(focused.input)
	}

	else if (command === "comment") {
		comment(focused.input)
	}

	else if (command === "comment all") {
		comment_all()
	}

	else if (command === "uncomment") {
		uncomment(focused.input)
	}

	else if (command === "uncomment all") {
		uncomment_all()
	}

	else if (command === "toggle comment") {
		toggle_comment(focused.input)
	}

	else if (command === "play done") {
		play("done")
	}

	else if (command === "play pup") {
		play("pup")
	}

	else if (command === "play nope") {
		play("nope")
	}
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
	focus_input(get_first_input())
}

function go_to_last_input() {
	focus_input(get_last_input())
}

function show_execution_error(command) {
	let s = ""
	s += 'An error happened while executing "' + command + '".<br><br>'
	s += "It is not a valid command."
	show_modal("Info", s)
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
	}

	else {
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
			play("nope")
			alert("You're attempting to save an incompatible version.")
			return
		}

		reset_object(item.ls_name, item.value)
		play("done")
	}

	catch (err) {
		play("nope")
		alert("There was an error parsing the JSON.\n\n" + err)
	}
}

function init_msg() {
	msg = Msg.factory({
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

	msg.create()
}

function show_modal(title, html, callback = function () { }) {
	msg.show([title, html], callback)
}

function set_modal_theme(a = true) {
	let background_color = window.getComputedStyle(document.body, null).getPropertyValue("background-color")
	let background_color_2 = colorlib.get_lighter_or_darker(background_color, 0.07)
	let font_color = colorlib.get_lighter_or_darker(background_color, 0.8)
	let overlay_color = colorlib.rgb_to_rgba(font_color, 0.8)

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