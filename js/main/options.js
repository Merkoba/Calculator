App.ls_options = `options_v4`
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
		App.options.round_places = 3
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

	if (mod) {
		App.update_options()
	}
}

App.show_options = () => {
	let places = []

	for (let i=0; i<=App.max_decimals; i++) {
		places.push(i)
	}

	App.show_modal(`Options`, App.template_options({
		commas: App.options.commas,
		mixed: App.options.mixed,
		round: App.options.round,
		places: places,
	}))

	let els = DOM.els(`option`, DOM.el(`#sel_round_places`))

	for (let el of els) {
		if (el.value == App.options.round_places) {
			el.selected = true
		}
	}

	DOM.ev(DOM.el(`#chk_commas`), `change`, (e) => {
		App.options.commas = e.target.checked
		App.calc()
		App.update_options()
	})

	DOM.ev(DOM.el(`#chk_round`), `change`, (e) => {
		App.options.round = e.target.checked
		App.calc()
		App.update_options()
	})

	DOM.ev(DOM.el(`#sel_round_places`), `change`, (e) => {
		App.options.round_places = parseInt(e.target.value)
		App.calc()
		App.update_options()
	})

	DOM.ev(DOM.el(`#chk_mixed`), `change`, (e) => {
		App.options.mixed = e.target.checked
		App.calc()
		App.update_options()
	})
}

App.update_options = () => {
	localStorage.setItem(App.ls_options, JSON.stringify(App.options))
}