App.themes = [
	`lake`,
	`leaf`,
	`bulb`,
	`wine`,
	`bubble`,
	`vapor`,
	`clouds`,
	`paper`,
	`cobalt`,
	`carbon`
]

App.max_decimals = 15

App.get_options = () => {
	App.options = JSON.parse(localStorage.getItem(App.ls_options))
	let mod = false

	if (App.options === null) {
		App.options = {}
		mod = true
	}

	if (App.options.version === undefined) {
		App.options.version = App.ls_options
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
		App.options.theme = `carbon`
		mod = true
	}
	else {
		if (App.themes.indexOf(App.options.theme) === -1) {
			App.options.theme = `carbon`
			mod = true
		}
	}

	if (mod) {
		App.update_options()
	}
}

App.show_options = () => {
	let places = []

	for (let i=0; i<=App.max_decimals; i++) {
		places.push(i)
	}

	let themelist = []

	for (let theme of App.themes) {
		let obj = {}
		obj.lowercase = theme
		obj.capitalized = App.capitalize_string(theme)
		themelist.push(obj)
	}

	App.show_modal(`Options`, App.templates[`template_options`]({
		commas: App.options.commas,
		mixed: App.options.mixed,
		round: App.options.round,
		places: places,
		themes: themelist
	}))

	let els = DOM.els(`option`, DOM.el(`#sel_round_places`))

	for (let el of els) {
		if (el.value == App.options.round_places) {
			el.selected = true
		}
	}

	els = DOM.els(`option`, DOM.el(`#sel_theme`))

	for (let el of els) {
		if (el.value == App.options.theme) {
			el.selected = true
		}
	}

	DOM.ev(DOM.el(`#chk_commas`), `change`, (e) => {
		App.options.commas = e.target.checked
		App.update_results()
		App.update_options()
	})

	DOM.ev(DOM.el(`#chk_round`), `change`, (e) => {
		App.options.round = e.target.checked
		App.update_results()
		App.update_options()
	})

	DOM.ev(DOM.el(`#sel_round_places`), `change`, (e) => {
		App.options.round_places = parseInt(e.target.value)
		App.update_results()
		App.update_options()
	})

	DOM.ev(DOM.el(`#chk_mixed`), `change`, (e) => {
		App.options.mixed = e.target.checked
		App.update_results()
		App.update_options()
	})

	DOM.ev(DOM.el(`#sel_theme`), `change`, (e) => {
		App.options.theme = e.target.value
		App.apply_theme(App.options.theme)
		App.update_options()
	})
}

App.update_options = () => {
	localStorage.setItem(App.ls_options, JSON.stringify(App.options))
}

App.apply_theme = (theme) => {
	let stylesheet = DOM.create(`link`)
	stylesheet.rel = `stylesheet`
	stylesheet.href = `themes/` + theme + `.css?v=` + App.version
	DOM.el(`head`).appendChild(stylesheet)
}