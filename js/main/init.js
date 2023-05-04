App.letters = `abcdefghijklmnopqrstuvwxyz`
App.linevars = {}
App.ls_options = `options_v4`
App.templates = {}

App.focused = {
	input: null
}

App.init = () => {
	App.start_msg()
	App.setup_templates()
	App.get_local_storage()
	App.apply_theme(App.options.theme)
	App.draw_buttons()
	App.place_infobar()
	App.update_infobar()
	App.key_detection()
	App.title_click_events()
	App.add_line()
}