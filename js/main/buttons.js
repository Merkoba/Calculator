App.draw_buttons = () => {
	App.place_button(1)
	App.place_button(2)
	App.place_button(3)
	App.place_button(4)
	App.place_button(5)
	App.place_button(6)
	App.place_button(7)
	App.place_button(8)
	App.place_button(9)
	App.place_button(0)
	App.place_button(`.`)
  App.place_button(`pi`)

	App.buttons_br()

	App.place_button(`+`)
	App.place_button(`-`)
	App.place_button(`*`)
	App.place_button(`/`)
	App.place_button(`(`)
	App.place_button(`)`)
	App.place_button(`^`)
	App.place_button(`sqrt`)
	App.place_button(`sin`)
	App.place_button(`cos`)
	App.place_button(`tan`)
  App.place_button(`phi`)

	App.buttons_br()

	App.place_button_wider(`Add Line`)
	App.place_button_wider(`Clear`)
	App.place_button_wider(`Erase`)
	App.place_button_wider(`Change Me`)
	App.place_button(`log`)
	App.place_button(`LN2`)
	App.place_button(`e`)
  App.place_button(`i`)

	for (let btn of DOM.els(`.button`)) {
		DOM.ev(btn, `click`, (e) => {
      App.press(e.target.textContent)
		})

		DOM.ev(btn, `auxclick`, (e) => {
      App.button_context(e.target)
		})

    DOM.ev(btn, `contextmenu`, e => e.preventDefault())
	}
}

App.place_button = (s) => {
	let el = DOM.create(`button`)
	el.classList.add(`button`)
	el.textContent = s
	DOM.el(`#buttons`).appendChild(el)
}

App.place_button_wider = (s) => {
	let el = DOM.create(`button`)
	el.classList.add(`button`)
	el.classList.add(`wider`)
	el.textContent = s
	DOM.el(`#buttons`).appendChild(el)
}

App.buttons_br = () => {
	let el = DOM.create(`br`)
	DOM.el(`#buttons`).appendChild(el)
}

App.press = (value) => {
	if (value === `sin`) {
		value = `sin(`
	}
	else if (value === `cos`) {
		value = `cos(`
	}
	else if (value === `tan`) {
		value = `tan(`
	}
	else if (value === `sqrt`) {
		value = `sqrt(`
	}
	else if (value === `log`) {
		value = `log(`
	}
	else if (value === `Clear`) {
    App.clear_input()
		return
	}
	else if (value === `Erase`) {
		App.erase()
		return
	}
  else if (value === `Undo`) {
		App.undo()
		return
	}
	else if (value === `Add Line`) {
		App.focus_next_or_add()
		App.focus_input()
		return
	}
	else if (value === `Up`) {
		App.line_up()
		App.focus_input()
		return
	}
	else if (value === `Down`) {
		App.line_down()
		App.focus_input()
		return
	}

	let vr = App.get_var()

	if (value === vr) {
		App.focus_next_or_add()
		vr = App.get_var()

		if (value === vr) {
			return
		}
	}

	App.insert_text(App.get_input(), value)
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
          App.insert_text(App.get_input(), opt)
        },
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
}