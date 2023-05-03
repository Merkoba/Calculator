App.copy_to_clipboard = (s) => {
	navigator.clipboard.writeText(s)
}

App.get_local_storage = () => {
	App.get_options()
}

App.disable_context_menu = (el) => {
	DOM.ev(el, `contextmenu`, event => event.preventDefault())
}

App.capitalize_string = (text) => {
	return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}