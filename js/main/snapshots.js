App.ls_snapshots = `snapshots_v1`
App.snapshot_delay = 800
App.max_snapshots = 250
App.snapshots = []

App.setup_snapshots = () => {
  App.get_snapshots()

  App.snapshot_debouncer = App.create_debouncer(() => {
    App.do_snapshot()
  }, App.snapshot_delay)
}

App.get_snapshots = () => {
  try {
    App.snapshots = JSON.parse(localStorage.getItem(App.ls_snapshots))
  }
  catch (err) {
    App.snapshots = null
  }

	let mod = false

	if (App.snapshots === null) {
		App.snapshots = []
		mod = true
	}

  if (mod) {
		App.save_snapshots()
	}
}

App.snapshot = () => {
  App.snapshot_debouncer.call()
}

App.get_snapshot = () => {
  let snapshot = {}
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

    snapshot[vr] = {
      comment: comment.value.trim(),
      input: input.value.trim(),
      focused: focused,
      focused_element: focused_element,
    }
  }

  return snapshot
}

App.do_snapshot = () => {
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

  App.save_snapshots()
}

App.clear_snapshots = () => {
  App.snapshots = []
  App.save_snapshots()
}

App.save_snapshots = () => {
  localStorage.setItem(App.ls_snapshots, JSON.stringify(App.snapshots))
  App.log(`Snapshots saved`)
}

App.load_last_snapshot = () => {
  if (App.snapshots.length === 0) {
    App.add_line()
    return
  }

  let last = App.snapshots.slice(-1)[0]

  if ((Object.keys(last)).length > 0) {
    App.apply_snapshot(last)
  }
  else {
    App.add_line()
  }
}

App.apply_snapshot = (snapshot) => {
  try {
    let num_lines = Object.keys(snapshot).length
    let to_focus, to_focus_element

    if (num_lines === 0) {
      App.add_line()
      return
    }

    let last_var = Object.keys(snapshot).sort().slice(-1)[0]
    let last_index = App.get_var_index(last_var)
    let vr = `$a`

    for (let i=0; i<=last_index; i++) {
      let line = App.get_line_by_var(vr)

      if (!line) {
        line = App.add_line()
      }

      let comment = App.get_comment(line)
      let input = App.get_input(line)

      App.set_comment(comment, snapshot[vr].comment || ``)
      App.set_input(input, snapshot[vr].input || ``)

      if (snapshot[vr].focused) {
        to_focus = line
        to_focus_element = snapshot[vr].focused_element
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
    App.reset_snapshots()
    App.new_sheet()
  }
}

App.reset_snapshots = () => {
  App.snapshots = {}
  App.save_snapshots()
}

App.undo = () => {
  if (App.snapshots.length > 1) {
    App.snapshots.pop()
    App.apply_snapshot(App.snapshots.pop())
  }
}