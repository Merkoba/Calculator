const App = {}

App.init = () => {
	App.setup_calc()
	App.setup_lines()
	App.setup_windows()
	App.get_options()
	App.get_state()
	App.draw_buttons()
	App.setup_infobar()
	App.key_detection()
	App.title_click_events()
	App.apply_state()
}