const App = {}
App.letters = `abcdefghijklmnopqrstuvwxyz`
App.linevars = {}
App.ls_options = `options_v4`
App.templates = {}

App.focused = {
	input: null
}

App.init = () => {
	App.start_msg()
	App.setup_templates()
	App.get_local_storage()
	App.apply_theme(App.options.theme)
	App.draw_buttons()
	App.place_infobar()
	App.update_infobar()
	App.key_detection()
	App.title_click_events()
	App.add_line()
}

App.title_click_events = () => {
	DOM.ev(DOM.el(`#lnk_new`), `click`, () => {
		App.new_sheet()
	})

	DOM.ev(DOM.el(`#lnk_options`), `click`, () => {
		App.show_options()
	})

	DOM.ev(DOM.el(`#lnk_about`), `click`, () => {
		App.show_about()
	})
}

// For testing:

App.fill_sheet = (x = false) => {
	let n

	if (x) {
		n = x
	}
	else {
		n = App.get_max_line_length() - DOM.els(`.line`).length
	}

	for (let i=0; i<n; i++) {
		App.add_line()
	}
}