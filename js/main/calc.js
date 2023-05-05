App.letters = `abcdefghijklmnopqrstuvwxyz`
App.linevars = {}

App.math_normal = math.create({
	number: `BigNumber`,
	precision: 64
})

App.math_fraction = math.create({
	number: `Fraction`
})

App.update_delay = 200

App.setup_calc = () => {
  App.calc_debouncer = App.create_debouncer(() => {
    App.do_calc()
  }, App.update_delay)
}

App.calc = () => {
  App.calc_debouncer.call()
}

App.do_calc = () => {
	App.undefine_variables()
	let variables = {}

	for (let input of DOM.els(`.input`)) {
		let v = App.get_var(input)
		variables[v] = {}
		let vr = variables[v]
		vr.edges = []
	}

	for (let input of DOM.els(`.input`)) {
		let v = App.get_var(input)

		if (App.is_empty(input)) {
			if (input.value.length > 0) {
				App.set_input(input, ``)
			}

			continue
		}

		let matches = App.get_vars(input)

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

		for (let i=0; i<keys.length; i++) {
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
			for (let input of DOM.els(`.input`)) {
				let vr = App.get_var(input)
				let letter = App.get_letter(vr)

				if (sorted.indexOf(vr) !== -1) {
					App.get_result(DOM.el(`#` + letter))
				}
				else {
					App.show_result(DOM.el(`#` + letter), `Not Acyclical`)
				}
			}

			return
		}

		if (n > 10000) {
			return
		}
	}

	for (let i=0; i<sorted.length; i++) {
		let letter = App.get_letter(sorted[i])
		App.get_result(DOM.el(`#` + letter))
	}

  App.focus_input()
	App.save_state()
}

App.get_result = (input) => {
	let result = App.get_result_el(input)
	result.innerHTML = ``

	try {
		if (App.is_empty(input)) {
			App.show_result(input, `Empty`)
			return
		}

		if (App.options.fraction) {
			result = App.math_fraction.evaluate(input.value + `*1`, App.linevars)
		}
		else {
			result = App.math_normal.evaluate(input.value + `*1`, App.linevars)
		}

		App.update_variable(input, result)
		App.show_result(input, App.format_result(result))
	}
	catch (err) {
    // console.error(err)
		App.show_error(input)
	}
}

App.show_result = (input, s) => {
	App.get_result_el(input).innerHTML = s
}

App.update_variable = (input, val) => {
	App.linevars[App.get_var(input)] = val
}

App.improper_to_mixed = (n, d) => {
	i = parseInt(n / d)
	n -= i * d
	return [i, n, d]
}

App.format_result = (n, f = false) => {
	if (App.options.fraction && !f) {
		let split = App.math_fraction.format(n).split(`/`)

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
				}
				else {
					return App.format_result(mwhole, true)
				}

				return `<span class="resolved"><span class="mwhole">${mwhole}</span><span class="fraction"><sup>${sup}</sup><sub>${sub}</sub></span></span>`
			}
			else {
				return `<span class="resolved"><span class="fraction"><sup>${sup}</sup><sub>${sub}</sub></span></span>`
			}
		}
		else {
			return App.format_result(n, true)
		}
	}
	else {
		if (App.options.round) {
			n = App.math_normal.round(n, App.options.round_places)
		}

    let ns = App.math_normal.format(n, {notation: `fixed`})
		let whole, decimal

		if (ns.indexOf(`.`) !== -1) {
			let split = ns.split(`.`)
			whole = split[0].toString() + `.`
			decimal = split[1].toString()
		}
		else {
			whole = ns
			decimal = ``
		}

		if (App.options.commas) {
			whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, `,`)
		}

		return `<span class="resolved"><span class="whole">${whole}</span><span class="decimal">${decimal}</span></span>`
	}
}

App.decrease_var = (vr) => {
	let letter = App.get_letter(vr)
	let res = ``
	let decrease_next = true

	for (let i =letter.length-1; i>= 0; i--) {
		if (decrease_next) {
			if (letter[i] === App.letters[0]) {
				if (i === 0) {
					break
				}
				else {
					res += App.letters[App.letters.length - 1]
					decrease_next = true
				}
			}
			else {
				res += App.letters[App.letters.indexOf(letter[i]) - 1]
				decrease_next = false
			}
		}
		else {
			res += App.letters[App.letters.indexOf(letter[i])]
		}
	}

	return `$` + res.split(``).reverse().join(``)
}

App.increase_var = (vr) => {
	let letter = App.get_letter(vr)
	let res = ``
	let increase_next = true

	for (let i=letter.length-1; i>=0; i--) {
		if (increase_next) {
			if (letter[i] === App.letters[App.letters.length - 1]) {
				res += App.letters[0]
				increase_next = true

				if (i == 0) {
					res += `a`
				}
			}
			else {
				res += App.letters[App.letters.indexOf(letter[i]) + 1]
				increase_next = false
			}
		}
		else {
			res += App.letters[App.letters.indexOf(letter[i])]
		}
	}

	return `$` + res.split(``).reverse().join(``)
}

App.get_var_index = (vr) => {
	let letter = App.get_letter(vr)
	let n = letter.length - 1
	let index = 0

	for (let i=0; i<letter.length; i++) {
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

App.is_empty = (input = App.focused.input) => {
	return input.value.trim() === ``
}

App.expand_value = (input, replace = true, full = true) => {
	let val = input.value

	if (App.is_empty(input)) {
		return
	}

	if (val.indexOf(`$`) === -1) {
		return
	}

	let vr = App.get_var(input)
	let n = 0

	while (true) {
		let og_val = val

		val = val.replace(/\$[a-z]+/g, (match) => {
			if (match === vr) {
				return match
			}

			let v

			if (full) {
				v = DOM.el(`#` + App.get_letter(match)).value
			}
			else {
				v = App.get_result_string(match)
			}

			if (v !== undefined && v.trim() !== ``) {
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

	if (val.indexOf(`$`) !== -1) {
		return
	}

	try {
		val = App.format_input_string(val)
	}
	catch (err) {
		return
	}

  if (replace) {
    App.replace_text(input, val)
  }
  else {
    return val
  }
}

App.setup_infobar = () => {
  DOM.ev(DOM.el(`#infobar`), `click`, () => {
    App.toggle_infobar()
  })

  App.update_infobar()
}

App.update_infobar = () => {
	if (App.options.fraction) {
		DOM.el(`#infobar`).textContent = `Fraction Mode`
	}
	else {
		DOM.el(`#infobar`).textContent = `Normal Mode`
	}
}

App.toggle_infobar = () => {
	App.options.fraction = !App.options.fraction
	App.calc()
	App.update_infobar()
	App.update_options()
}

App.undefine_variables = () => {
	for (let v in App.linevars) {
		App.linevars[v] = undefined
	}
}

App.get_result_text = (el) => {
	let s = ``

	if (DOM.els(`sup`).length > 0) {
		if (DOM.els(`.mwhole`, el).length > 0) {
			s += DOM.el(`.mwhole`, el).textContent + ` `
		}

		s += DOM.el(`sup`, el).textContent
		s += `/`
		s += DOM.el(`sub`, el).textContent
	}
	else {
		s += el.textContent.replace(/,/g, ``)
	}

	return s
}

App.get_vars = (input) => {
	let vars = input.value.match(/\$[a-z]+/g)
	vars = [...new Set(vars)].sort()
	return vars
}

App.get_var_results = (input) => {
	let vars = App.get_vars(input)

	if (!vars) {
		return []
	}

	let items = []

	for (let vr of vars) {
		let val = App.get_input_string(vr)
		let res = App.get_result_string(vr)
		items.push(`${vr} = ${val} = ${res}`)
	}

	return items
}

App.get_input_string = (vr) => {
	let value = App.get_input(vr).value
  return App.format_input_string(value)
}

App.format_input_string = (value) => {
	return App.math_normal.parse(value).toString({parenthesis: `auto`, implicit: `show`, notation: `fixed`})
}

App.get_result_string = (vr) => {
	let result = App.math_normal.bignumber(App.linevars[vr])

	if (App.options.round) {
		result = App.math_normal.round(result, App.options.round_places)
	}

	result = App.math_normal.format(result, {notation: `fixed`})
	return result
}

App.get_var = (input = App.focused.input) => {
	return DOM.dataset(input, `variable`)
}

App.view_result = (input) => {
  let value = input.value.trim()

  if (!value) {
    return
  }

  let vr = App.get_var(input)
  let result = App.get_result_string(vr)

  if (value && result) {
    let form = App.get_input_string(vr)
    let exp_res = App.expand_value(input, false, false)
    let exp_full = App.expand_value(input, false, true)
    let results = App.get_var_results(input)
    let items = []

    if (results.length > 0) {
      items.push(results.join("<br>"))
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