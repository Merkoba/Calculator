App.ls_state = `state_v2`
App.save_state_delay = 2500

App.setup_state = () => {
  App.get_state()

  App.save_state_debouncer = App.create_debouncer(() => {
    App.do_save_state()
  }, App.save_state_delay)
}

App.get_state = () => {
	App.state = JSON.parse(localStorage.getItem(App.ls_state))
	let mod = false

	if (App.state === null) {
		App.state = {}
    App.state.lines = {}
		mod = true
	}

  if (mod) {
		App.update_state()
	}
}

App.save_state = () => {
  App.save_state_debouncer.call()
}

App.do_save_state = () => {
  App.state.lines = {}

	for (let line of DOM.els(`.line`)) {
    let comment = DOM.el(`.comment`, line)
    let input = DOM.el(`.input`, line)
    let vr = App.get_var(input)

    App.state.lines[vr] = {
      comment: comment.value.trim(),
      input: input.value.trim(),
    }
  }

  App.update_state()
  App.log(`State saved`)
}

App.update_state = () => {
	localStorage.setItem(App.ls_state, JSON.stringify(App.state))
}

App.apply_state = () => {
  try {
    let num_lines = Object.keys(App.state.lines).length

    if (num_lines === 0) {
      App.add_line()
      return
    }

    let last_var = Object.keys(App.state.lines).sort().slice(-1)[0]
    let last_index = App.get_var_index(last_var)

    for (let i=0; i<=last_index; i++) {
      let line = App.add_line()
      let comment = DOM.el(`.comment`, line)
      let input = DOM.el(`.input`, line)
      let vr = App.get_var(line)

      App.set_comment(comment, App.state.lines[vr].comment || ``)
      App.set_input(input, App.state.lines[vr].input || ``)
    }

    App.calc()
  }
  catch (err) {
    App.error(err, `error`)
    App.restore_state()
    App.new_sheet()
  }
}

App.restore_state = () => {
  App.state = {}
  App.state.lines = {}
  App.update_state()
}