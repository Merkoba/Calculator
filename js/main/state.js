App.ls_state = `state_v1`

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
  App.state.lines = {}

	for (let input of DOM.els(`.input`)) {
    let v = App.get_var(input)
    let value = input.value.trim()
    App.state.lines[v] = value
  }

  App.update_state()
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
      let vr = App.add_line()
      App.set_input(App.focused.input, App.state.lines[vr] || ``)
    }

    App.calc()
  }
  catch (err) {
    console.error(err)
    App.restore_state()
    App.new_sheet()
  }
}

App.restore_state = () => {
  App.state = {}
  App.state.lines = {}
  App.update_state()
}