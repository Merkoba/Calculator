App.disable_context_menu = (el) => {
	DOM.ev(el, `contextmenu`, event => event.preventDefault())
}

App.capitalize_string = (text) => {
	return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// For testing
App.fill_sheet = (x = false) => {
	let n

	if (x) {
		n = x
	}
	else {
		n = App.max_line_length - DOM.els(`.line`).length
	}

	for (let i=0; i<n; i++) {
		App.add_line()
	}
}

App.create_debouncer = (func, delay) => {
  let timer
  let obj = {}

  function clear () {
    clearTimeout(timer)
  }

  function run (...args) {
    func(...args)
  }

  obj.call = (...args) => {
    clear()

    timer = setTimeout(() => {
      run(...args)
    }, delay)
  }

  obj.now = (...args) => {
    clear()
    run(...args)
  }

  obj.cancel = () => {
    clear()
  }

  return obj
}

App.make_html_safe = (text) => {
  return text.replace(/\</g, `&lt;`).replace(/\>/g, `&gt;`)
}

App.get_letter = (vr) => {
  return vr.replace(`$`, ``)
}

App.log = (message, mode = `normal`) => {
  let icon

  if (mode === `normal`) {
    icon = `🟢`
  }
  else if (mode === `error`) {
    icon = `🔴`
  }

  console.info(`${icon} ${message}`)
}