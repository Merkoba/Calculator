App.templates = {}
App.confirm_action = () => {}

App.setup_windows = () => {
  App.setup_templates()

	App.msg = Msg.factory({
		enable_titlebar: true,
		center_titlebar: true,
    close_on_escape: false,
    after_close: (instance) => {
      App.focus_if_isnt()
    },
	})

	App.msg.create()

	App.msg_confirm = Msg.factory({
		enable_titlebar: false,
    close_on_escape: false,
    window_x: `none`,
    after_close: (instance) => {
      App.confirm_action = () => {}
      App.focus_if_isnt()
    },
	})

  let c = DOM.create(`div`, `confirm`)
  c.innerHTML = App.templates[`template_confirm`]()

  DOM.ev(DOM.el(`#confirm_ok`, c), `click`, () => {
    App.on_confirm()
  })

  DOM.ev(DOM.el(`#confirm_cancel`, c), `click`, () => {
    App.msg_confirm.close()
  })

  App.msg_confirm.set(c)
}

App.on_confirm = () => {
  App.confirm_action()
  App.msg_confirm.close()
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

App.confirm = (message, action) => {
  DOM.el(`#confirm_message`).textContent = message
  App.confirm_action = action
  App.msg_confirm.show()
}