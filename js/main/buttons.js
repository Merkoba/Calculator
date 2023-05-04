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
	App.place_button(`e`)

	App.buttons_br()

	App.place_button(`+`)
	App.place_button(`-`)
	App.place_button(`*`)
	App.place_button(`/`, `Right Click: Toggle Comment`)
	App.place_button(`(`)
	App.place_button(`)`)
	App.place_button(`^`, `Right Click: ^2 | Middle Click: ^3`)
	App.place_button(`sqrt`, `Right Click: Cube Root | Middle Click: nth Root`)
	App.place_button(`sin`, `Right Click: asin | Middle Click: asinh`)
	App.place_button(`cos`, `Right Click: acos | Middle Click: acosh`)
	App.place_button(`tan`, `Right Click: atan | Middle Click: atanh`)
	App.place_button(`pi`, `Right Click: phi | Middle Click: e`)

	App.buttons_br()

	App.place_button_wider(`Add Line`, `Right Click: Add Line After | Middle Click: Add Line Before`)
	App.place_button_wider(`Rm Line`, `Right Click: Remove Last Line`)
	App.place_button_wider(`Clear`)
	App.place_button_wider(`Format`)
	App.place_button_wider(`Space`)
	App.place_button_wider(`Erase`)

	for (let btn of DOM.els(`.button`)) {
		DOM.ev(btn, `mousedown`, (e) => {
      if (e.button === 0) {
        App.press(e.target.textContent)
      }
		})

		DOM.ev(btn, `auxclick`, (e) => {
			App.press(e.target.textContent, e.which)
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

App.press = (s, aux = false) => {
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

	if (aux) {
		s = App.check_aux(s, aux)

		if (!s) {
			App.focus_input(App.focused.input)
			return
		}
	}

	if (s === `Clear`) {
		App.clear_input(App.focused.input)
		return
	}
	else if (s === `Erase`) {
		App.erase_character()
		return
	}
  else if (s === `Space`) {
    App.insert_text(App.focused.input, ` `)
    return
  }
  else if (s === `Format`) {
    App.format_all()
    return
  }
	else if (s === `Add Line`) {
		App.focus_next_or_add()
		App.focus_input(App.focused.input)
		return
	}
	else if (s === `Rm Line`) {
		App.remove_line()
		App.focus_input(App.focused.input)
		return
	}
	else if (s === `Up`) {
		App.line_up()
		App.focus_input(App.focused.input)
		return
	}
	else if (s === `Down`) {
		App.line_down()
		App.focus_input(App.focused.input)
		return
	}

	let v = DOM.dataset(App.focused.input, `variable`)

	if (s === v) {
		App.focus_next_or_add()
		v = DOM.dataset(App.focused.input, `variable`)

		if (s === v) {
			return
		}
	}

	App.insert_text(App.focused.input, s)
}

App.check_aux = (s, aux) => {
	if (aux) {
		for (let i=1; i<10; i++) {
			if (s == i) {
				if (aux === 3) {
					return `0.` + i
				}
				else if (aux === 2) {
					return `1/` + i
				}
			}
		}

		if (s == 0) {
			if (aux === 3) {
				return `0.`
			}
			else if (aux === 2) {
				return `000`
			}
		}
		else if (s === `cos(`) {
			if (aux === 3) {
				return `acos(`
			}
			else if (aux === 2) {
				return `acosh(`
			}
		}
		else if (s === `tan(`) {
			if (aux === 3) {
				return `atan(`
			}
			else if (aux === 2) {
				return `atanh(`
			}
		}
		else if (s === `sin(`) {
			if (aux === 3) {
				return `asin(`
			}
			else if (aux === 2) {
				return `asinh(`
			}
		}
		else if (s === `^`) {
			if (aux === 3) {
				return `^2`
			}
			else if (aux === 2) {
				return `^3`
			}
		}
		else if (s === `sqrt(`) {
			if (aux === 3) {
				return `cbrt(`
			}
			else if (aux === 2) {
				return `nthRoot(`
			}
		}
		else if (s === `pi`) {
			if (aux === 3) {
				return `phi`
			}
			else if (aux === 2) {
				return `e`
			}
		}
		else if (s === `/`) {
			if (aux === 3) {
				App.toggle_comment(App.focused.input)
				return false
			}
		}
		else if (s === `Up`) {
			if (aux === 3) {
				App.move_line_up()
				return false
			}
			else if (aux === 2) {
				App.go_to_first_input()
				return false
			}
		}
		else if (s === `Down`) {
			if (aux === 3) {
				App.move_line_down()
				return false
			}
			else if (aux === 2) {
				App.go_to_last_input()
				return false
			}
		}
		else if (s === `Rm Line`) {
			if (aux === 3) {
				App.remove_last_line()
				return false
			}
		}
		else if (s === `Add Line`) {
			if (aux === 3) {
				App.add_line_after()
				return false
			}
			else if (aux === 2) {
				App.add_line_before()
				return false
			}
		}
		else if (s === `Clear`) {
			if (aux === 3) {
				App.format_input(App.focused.input)
				return false
			}
			else if (aux === 2) {
				App.format_all()
				return false
			}
		}
	}

	return false
}