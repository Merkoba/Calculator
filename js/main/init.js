const App = {}

App.init = () => {
	App.setup_calc()
	App.setup_lines()
	App.setup_windows()
	App.get_options()
	App.setup_snapshots()
	App.draw_buttons()
	App.setup_infobar()
	App.key_detection()
	App.title_click_events()
	App.load_last_snapshot()
}