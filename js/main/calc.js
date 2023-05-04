App.math_normal = math.create({
	number: `BigNumber`,
	precision: 64
})

App.math_fraction = math.create({
	number: `Fraction`
})

App.update_results = (() => {
	let timer
	return () => {
		clearTimeout(timer)
		timer = setTimeout(() => {
			App.do_update_results()
		}, 10)
	}
})()

App.do_update_results = () => {
	App.undefine_variables()
	let variables = {}

	for (let input of DOM.els(`.input`)) {
		let v = DOM.dataset(input, `variable`)
		variables[v] = {}
		let vr = variables[v]
		vr.edges = []
	}

	for (let input of DOM.els(`.input`)) {
		let v = DOM.dataset(input, `variable`)
		let val = input.value

		if (val.trim() === ``) {
			if (val.length > 0) {
				input.value = ``
			}

			continue
		}

		if (val.trim().startsWith(`//`)) {
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
				let v = DOM.dataset(input, `variable`)
				let letter = v.substring(1)

				if (sorted.indexOf(v) !== -1) {
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
		let letter = sorted[i].substring(1)
		App.get_result(DOM.el(`#` + letter))
	}
}

App.get_result = (input) => {
	let result = DOM.el(`.result`, input.parentNode)
	result.innerHTML = ``

	try {
		let val = input.value

		if (val.trim().startsWith(`//`)) {
			App.show_comment(input)
			return
		}

		if (val.trim().length === 0) {
			return
		}

		if (App.options.fraction) {
			result = App.math_fraction.evaluate(val + `*1`, App.linevars)
		}
		else {
			result = App.math_normal.evaluate(val + `*1`, App.linevars)
		}

		App.update_variable(input, result)
		App.show_result(input, App.format_result(result))
	}
	catch (err) {
    // console.log(err)
		App.show_error(input)
	}
}

App.show_result = (input, s) => {
	DOM.el(`.result`, input.parentNode).innerHTML = s
}

App.update_variable = (input, val) => {
	App.linevars[DOM.dataset(input, `variable`)] = val
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

		let ns = n.toString()
		let whole, decimal

		if (ns.indexOf(`.`) !== -1) {
			let split = ns.split(`.`)
			whole = split[0].toString() + `.`
			decimal = split[1].toString()
		}
		else {
			whole = n.toString()
			decimal = ``
		}

		if (App.options.commas) {
			whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, `,`)
		}

		return `<span class="resolved"><span class="whole">${whole}</span><span class="decimal">${decimal}</span></span>`
	}
}

App.decrease_var = (v) => {
	let letter = v.substring(1)
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

App.increase_var = (v) => {
	let letter = v.substring(1)
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

App.get_var_index = (v) => {
	let letter = v.substring(1)
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

App.expand_value = (input) => {
	let val = input.value

	if (val.trim() === ``) {
		return
	}

	if (val.trim().startsWith(`//`)) {
		return
	}

	if (val.indexOf(`$`) === -1) {
		return
	}

	let vr = DOM.dataset(input, `variable`)
	let n = 0

	while (true) {
		let og_val = val

		val = val.replace(/\$[a-z]+/g, (match) => {
			if (match === vr) {
				return match
			}

			let v = DOM.el(`#` + match.substring(1)).value

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
		val = App.math_normal.parse(val).toString({ parenthesis: `auto`, implicit: `show` })
	}
	catch (err) {
		return
	}

	App.replace_text(input, val)
}

App.toggle_fraction = () => {
	App.options.fraction = !App.options.fraction
	App.update_results()
	App.update_infobar()
	App.update_options()
}

App.update_infobar = () => {
	let s = ``
	s += `<span id='ib_fraction_toggle' class='ib_item'>`

	if (App.options.fraction) {
		s += `Fraction Mode`
	}
	else {
		s += `Normal Mode`
	}

	s += `</span>`
	DOM.el(`#infobar`).innerHTML = s

	DOM.ev(DOM.el(`#ib_fraction_toggle`), `click`, () => {
		App.toggle_fraction()
	})
}

App.undefine_variables = () => {
	for (let varName in App.linevars) {
		App.linevars[varName] = undefined
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