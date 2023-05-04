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

App.show_about = () => {
	App.show_modal(`About`, App.templates[`template_about`]({
		version: App.version
	}))
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