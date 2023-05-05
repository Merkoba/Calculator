App.draw_buttons = () => {
	App.place_button(1, `Right Click: 0.1 | Middle Click: 1/1`)
	App.place_button(2, `Right Click: 0.2 | Middle Click: 1/2`)
	App.place_button(3, `Right Click: 0.3 | Middle Click: 1/3`)
	App.place_button(4, `Right Click: 0.4 | Middle Click: 1/4`)
	App.place_button(5, `Right Click: 0.5 | Middle Click: 1/5`)
	App.place_button(6, `Right Click: 0.6 | Middle Click: 1/6`)
	App.place_button(7, `Right Click: 0.7 | Middle Click: 1/7`)
	App.place_button(8, `Right Click: 0.8 | Middle Click: 1/8`)
	App.place_button(9, `Right Click: 0.9 | Middle Click: 1/9`)
	App.place_button(0, `Right Click: 0. | Middle Click: 000`)
	App.place_button(`.`)
  App.place_button(`pi`, `Right Click: tau`)

	App.buttons_br()

	App.place_button(`+`)
	App.place_button(`-`)
	App.place_button(`*`)
	App.place_button(`/`)
	App.place_button(`(`)
	App.place_button(`)`)
	App.place_button(`^`, `Right Click: ^2 | Middle Click: ^3`)
	App.place_button(`sqrt`, `Right Click: Cube Root | Middle Click: nth Root`)
	App.place_button(`sin`, `Right Click: asin | Middle Click: asinh`)
	App.place_button(`cos`, `Right Click: acos | Middle Click: acosh`)
	App.place_button(`tan`, `Right Click: atan | Middle Click: atanh`)
  App.place_button(`phi`)

	App.buttons_br()

	App.place_button_wider(`Add Line`, `Right Click: Add Line After | Middle Click: Add Line Before`)
	App.place_button_wider(`Clear`)
	App.place_button_wider(`Erase`)
	App.place_button_wider(`Undo`)
	App.place_button(`log`, `Right Click: log2 | Middle Click: log10`)
	App.place_button(`LN2`, `Right Click: LN10`)
	App.place_button(`e`, `Right Click: LOG2E | Middle Click: LOG10E`)
  App.place_button(`i`)

	for (let btn of DOM.els(`.button`)) {
		DOM.ev(btn, `click`, (e) => {
      App.press(e.target.textContent)
		})

		DOM.ev(btn, `auxclick`, (e) => {
      App.button_context(e.target)
		})

		App.disable_context_menu(btn)
	}
}

App.place_button = (s, title = ``) => {
	let el = DOM.create(`button`)
	el.title = title
	el.classList.add(`button`)
	el.textContent = s
	DOM.el(`#buttons`).appendChild(el)
}

App.place_button_wider = (s, title = ``) => {
	let el = DOM.create(`button`)
	el.title = title
	el.classList.add(`button`)
	el.classList.add(`wider`)
	el.textContent = s
	DOM.el(`#buttons`).appendChild(el)
}

App.buttons_br = () => {
	let el = DOM.create(`br`)
	DOM.el(`#buttons`).appendChild(el)
}

App.press = (s) => {
	if (s === `sin`) {
		s = `sin(`
	}
	else if (s === `cos`) {
		s = `cos(`
	}
	else if (s === `tan`) {
		s = `tan(`
	}
	else if (s === `sqrt`) {
		s = `sqrt(`
	}
	else if (s === `log`) {
		s = `log(`
	}
	else if (s === `Clear`) {
    App.clear_input()
		return
	}
	else if (s === `Erase`) {
		App.erase()
		return
	}
  else if (s === `Undo`) {
		App.undo()
		return
	}
	else if (s === `Add Line`) {
		App.focus_next_or_add()
		App.focus_input()
		return
	}
	else if (s === `Up`) {
		App.line_up()
		App.focus_input()
		return
	}
	else if (s === `Down`) {
		App.line_down()
		App.focus_input()
		return
	}

	let v = App.get_var()

	if (s === v) {
		App.focus_next_or_add()
		v = App.get_var()

		if (s === v) {
			return
		}
	}

	App.insert_text(App.focused.input, s)
}

App.button_context = (button) => {
  let value = button.textContent
  let num = parseInt(value)

  function insert (opts) {
    let items = []

    for (let opt of opts) {
      items.push({
        text: opt,
        action: () => {
          App.insert_text(App.focused.input, opt)
        },
      })
    }

    NeedContext.show_on_element(button, items)
  }

  function action (opts) {
    let items = []

    for (let opt of opts) {
      items.push({
        text: opt[0],
        action: opt[1],
      })
    }

    NeedContext.show_on_element(button, items)
  }

  if (!isNaN(num)) {
    if (num === 0) {
      insert([`0.`, `000`])
    }
    else {
      for (let i=1; i<10; i++) {
        if (num === i) {
          insert([`0.${i}`, `1/${i}`])
          break
        }
      }
    }

    return
  }

  if (value === `cos`) {
    insert([`acos(`, `acosh(`])
  }
  else if (value === `tan`) {
    insert([`atan(`, `atanh(`])
  }
  else if (value === `sin`) {
    insert([`asin(`, `asinh(`])
  }
  else if (value === `^`) {
    insert([`^2`, `^3`])
  }
  else if (value === `sqrt`) {
    insert([`cbrt(`, `nthRoot(`])
  }
  else if (value === `log`) {
    insert([`log2(`, `log10(`])
  }
  else if (value === `LN2`) {
    insert([`LN10`])
  }
  else if (value === `e`) {
    insert([`LOG2E`, `LOG10E`])
  }
  else if (value === `pi`) {
    insert([`tau`])
  }
  else if (value === `Add Line`) {
    action([
      [`Add Line Before`, () => {
        App.add_line_before()
      }],
      [`Add Line After`, () => {
        App.add_line_after()
      }],
    ])
  }
}