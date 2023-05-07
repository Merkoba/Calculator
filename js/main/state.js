App.ls_state = `state_v3`
App.save_state_delay = 1000
App.max_snapshots = 250
App.snapshots = []

App.setup_state = () => {
  App.get_state()

  App.save_state_debouncer = App.create_debouncer(() => {
    App.do_save_state()
  }, App.save_state_delay)
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
		App.update_state()
	}
}

App.save_state = () => {
  App.save_state_debouncer.call()
}

App.get_snapshot = () => {
  let state = {}
  let focused = App.get_line()

	for (let line of DOM.els(`.line`)) {
    let comment = App.get_comment(line)
    let input = App.get_input(line)
    let vr = App.get_var(input)

    state[vr] = {
      comment: comment.value.trim(),
      input: input.value.trim(),
      focused: line === focused
    }
  }

  return state
}

App.save_snapshot = () => {
  let snapshot = App.get_snapshot()

  if (!snapshot) {
    return
  }

  // Check if the last snapshot is the same
  if (App.snapshots.length > 0) {
    if (JSON.stringify(snapshot) === JSON.stringify(App.snapshots.slice(-1)[0])) {
      return
    }
  }

  App.snapshots.push(snapshot)

  if (App.snapshots.length > App.max_snapshots) {
    App.snapshots.shift()
  }

  App.save_state()
}

App.clear_snapshots = () => {
  App.snapshots = []
}

App.do_save_state = () => {
  App.state = App.snapshots.slice(-1)[0]
  App.update_state()
  App.log(`State saved`)
}

App.update_state = () => {
	localStorage.setItem(App.ls_state, JSON.stringify(App.state))
}

App.restore_state = () => {
  if ((Object.keys(App.state)).length > 0) {
    App.apply_snapshot(App.state)
  }
  else {
    App.add_line()
  }
}

App.apply_snapshot = (snapshot) => {
  try {
    App.remove_all_lines()
    let num_lines = Object.keys(snapshot).length
    let to_focus

    if (num_lines === 0) {
      App.add_line()
      return
    }

    let last_var = Object.keys(snapshot).sort().slice(-1)[0]
    let last_index = App.get_var_index(last_var)

    for (let i=0; i<=last_index; i++) {
      let line = App.add_line()
      let comment = App.get_comment(line)
      let input = App.get_input(line)
      let vr = App.get_var(line)

      App.set_comment(comment, snapshot[vr].comment || ``)
      App.set_input(input, snapshot[vr].input || ``)

      if (snapshot[vr].focused) {
        to_focus = input
      }
    }

    if (to_focus) {
      App.focus_input(to_focus)
    }

    App.calc()
  }
  catch (err) {
    console.error(err)
    App.reset_state()
    App.new_sheet()
  }
}

App.reset_state = () => {
  App.state = {}
  App.update_state()
}

App.undo = () => {
  if (App.snapshots.length > 1) {
    App.snapshots.pop()
    App.apply_snapshot(App.snapshots.pop())
  }
}