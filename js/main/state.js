App.ls_state = `state_v5`
App.state_delay = 1000

App.setup_state = () => {
  App.get_state()

  App.state_debouncer = App.create_debouncer(() => {
    App.do_update_state()
  }, App.state_delay)
}

App.get_state = () => {
  try {
    App.state = JSON.parse(localStorage.getItem(App.ls_state))
  }
  catch (err) {
    App.state = null
  }

	let mod = false

	if (App.state === null) {
		App.state = {}
		mod = true
	}

  if (mod) {
		App.save_state()
	}
}

App.get_state_lines = () => {
  let state = {}
  let focused_line = App.get_line()

	for (let line of DOM.els(`.line`)) {
    let comment = App.get_comment(line)
    let input = App.get_input(line)
    let vr = App.get_var(input)
    let focused = line === focused_line
    let focused_element = `input`

    if (document.activeElement === comment) {
      focused_element = `comment`
    }

    state[vr] = {
      comment: comment.value.trim(),
      input: input.value.trim(),
      focused: focused,
      focused_element: focused_element,
    }
  }

  return state
}

App.update_state = () => {
  App.state_debouncer.call()
}

App.do_update_state = () => {
  App.state = App.get_state_lines()
  App.save_state()
}

App.reset_state = () => {
  App.state = []
  App.save_state()
}

App.save_state = () => {
  localStorage.setItem(App.ls_state, JSON.stringify(App.state))
  App.log(`State saved`)
}

App.restore_state = () => {
  if ((Object.keys(App.state)).length > 0) {
    App.apply_state(App.state)
  }
  else {
    App.add_line()
  }
}

App.apply_state = (state) => {
  try {
    let num_lines = Object.keys(state).length
    let to_focus, to_focus_element

    if (num_lines === 0) {
      App.add_line()
      return
    }

    let last_var = Object.keys(state).sort().slice(-1)[0]
    let last_index = App.get_var_index(last_var)
    let vr = `$a`

    for (let i=0; i<=last_index; i++) {
      let line = App.get_line_by_var(vr)

      if (!line) {
        line = App.add_line()
      }

      let comment = App.get_comment(line)
      let input = App.get_input(line)

      App.set_comment(comment, state[vr].comment || ``)
      App.set_input(input, state[vr].input || ``)

      if (state[vr].focused) {
        to_focus = line
        to_focus_element = state[vr].focused_element
      }

      vr = App.increase_var(vr)
    }

    if (to_focus) {
      if (to_focus_element === `comment`) {
        App.focus_comment(App.get_comment(to_focus))
      }
      else {
        App.focus_input(App.get_input(to_focus))
      }
    }

    App.trim_lines(last_index)
    App.calc()
  }
  catch (err) {
    console.error(err)
    App.new_sheet()
  }
}