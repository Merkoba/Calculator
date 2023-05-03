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
	App.apply_mode()
	App.draw_buttons()
	App.place_infobar()
	App.update_infobar()
	App.key_detection()
	App.title_click_events()
	App.add_line()
}

App.new_sheet = () => {
	App.remove_all_lines()
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

App.copy_to_clipboard = (s) => {
	navigator.clipboard.writeText(s)
}

App.show_about = () => {
	App.show_modal(`About`, App.templates[`template_about`]({
		version: App.version
	}))
}

App.get_local_storage = () => {
	App.get_options()
}

// For testing
App.fill_sheet = (x = false) => {
	let n

	if (x) {
		n = x
	}
	else {
		n = App.get_max_line_length() - DOM.els(`.line`).length
	}

	for (let i = 0; i < n; i++) {
		App.add_line()
	}
}

App.disable_context_menu = (el) => {
	DOM.ev(el, `contextmenu`, event => event.preventDefault())
}

App.capitalize_string = (text) => {
	return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

App.start_msg = () => {
	App.msg = Msg.factory({
		enable_titlebar: true,
		center_titlebar: true,
	})

	App.msg.create()
}

App.show_modal = (title, html, callback = () => {}) => {
	App.msg.show([title, html], callback)
}

App.setup_templates = () => {
	Handlebars.registerHelper(`eq`, (a, b) => a == b)

  for (let el of DOM.els(`.template`)) {
    App.templates[el.id] = Handlebars.compile(DOM.el(`#${el.id}`).innerHTML)
  }
}