var BASE = (function()
{
	var math_normal = math.create(
	{
		number: 'BigNumber',
		precision: 64
	});

	var math_fraction = math.create(
	{
		number: 'Fraction'
	});

	var global = {};
	
	var letters = "abcdefghijklmnopqrstuvwxyz";
	var linevars = {};
	var msg_open = false;
	var about;
	var site_root;
	var save_enabled = true;
	var options;
	var user_data;

	global.ls_options = 'options_v2';
	global.ls_user_data = 'user_data_v1';

	var themes = [
		'paper',
		'leaf',
		'bulb',
		'lake',
		'vapor',
		'cobalt',
		'bubble',
		'carbon'
	];

	var commands = [
		'insert x',
		'clear',
		'erase',
		'add line',
		'add line before',
		'add line after',
		'remove line',
		'remove last line',
		'ans',
		'go up',
		'go down',
		'move line up',
		'move line down',
		'undo',
		'redo',
		'format',
		'format all',
		'expand',
		'caret to end'
	];

	var focused = {
		input: null
	};

	global.init = function()
	{
		get_options();
		get_user_data();
		apply_theme(options.theme);
		apply_mode();
		draw_buttons();
		draw_prog_buttons();
		place_infobar();
		update_infobar();
		place_lines_container();
		key_detection();
		resize_events();
		overlay_clicked();
		title_click_events();
		get_site_root();
		adjust_volumes();

		if(saved_content === '')
		{
			add_line();
		}

		else
		{
			load_saved_content();
		}

		console.log('Started.\n');
	}

	function key_detection()
	{
		$(document).keyup(function(e)
		{
			var code = e.keyCode;

			if(code === 27)
			{
				if(msg_open)
				{
					hide_overlay();
				}

				else
				{
					var result = $(focused.input).next('.result');

					if(focused.input.value === '')
					{
						remove_line();
					}

					else
					{
						clear_input(focused.input);
					}
				}
			}
		});

		$(document).keydown(function(e)
		{
			if(msg_open)
			{
				return;
			}

			var code = e.keyCode;

			if(code === 13)
			{
				if(e.shiftKey && e.ctrlKey)
				{
					expand_value(focused.input);
				}

				else if(e.shiftKey)
				{
					press($(focused.input).data('variable'));
				}

				else if(e.ctrlKey)
				{
					copy_value_down();
				}

				else
				{
					focus_next_or_add();
				}

			}

			else if(code === 9)
			{
				if(e.shiftKey)
				{
					cycle_inputs('up');
				}

				else
				{
					cycle_inputs('down');
				}

				e.preventDefault();
			}

			else if(code === 38)
			{
				if(e.shiftKey)
				{
					move_line_up();
				}

				else
				{
					line_up();
				}

				e.preventDefault();
			}

			else if(code === 40)
			{
				if(e.shiftKey)
				{
					move_line_down();
				}

				else
				{
					line_down();
				}

				e.preventDefault();
			}

			else if(code === 32)
			{
				if(e.shiftKey && e.ctrlKey)
				{
					format_input(focused.input);
				}

				else if(e.shiftKey)
				{
					add_ans();
					e.preventDefault();
				}

				else if(e.ctrlKey)
				{
					add_top_val();
					e.preventDefault();
				}
			}

			if(!e.ctrlKey)
			{
				focus_if_isnt(focused.input);
			}
		});
	}

	function draw_buttons()
	{
		place_button(1, 'Right Click: 1/1 &nbsp;|&nbsp; Middle Click: 0.1');
		place_button(2, 'Right Click: 1/2 &nbsp;|&nbsp; Middle Click: 0.2');
		place_button(3, 'Right Click: 1/3 &nbsp;|&nbsp; Middle Click: 0.3');
		place_button(4, 'Right Click: 1/4 &nbsp;|&nbsp; Middle Click: 0.4');
		place_button(5, 'Right Click: 1/5 &nbsp;|&nbsp; Middle Click: 0.5');
		place_button(6, 'Right Click: 1/6 &nbsp;|&nbsp; Middle Click: 0.6');
		place_button(7, 'Right Click: 1/7 &nbsp;|&nbsp; Middle Click: 0.7');
		place_button(8, 'Right Click: 1/8 &nbsp;|&nbsp; Middle Click: 0.8');
		place_button(9, 'Right Click: 1/9 &nbsp;|&nbsp; Middle Click: 0.9');
		place_button(0, 'Right Click: 00 &nbsp;|&nbsp; Middle Click: 000');

		place_button('.');
		place_button(',');

		buttons_br();

		place_button('+');
		place_button('-');
		place_button('*');
		place_button('/');
		place_button('(');
		place_button(')');
		place_button('pow');
		place_button('sqrt', 'Right Click: Cube Root');
		place_button('sin', 'Right Click: asin &nbsp;|&nbsp; Middle Click: asinh');
		place_button('cos', 'Right Click: acos &nbsp;|&nbsp; Middle Click: acosh');
		place_button('tan', 'Right Click: atan &nbsp;|&nbsp; Middle Click: atanh');
		place_button('pi', 'Right Click: phi &nbsp;|&nbsp; Middle Click: e');

		buttons_br();

		place_prog_buttons_area();

		buttons_br();

		place_button_wider('Up', 'Right Click: Move Line Up');
		place_button_wider('Down', 'Right Click: Move Line Down');
		place_button_wider('New Line', 'Right Click: Add Line After &nbsp;|&nbsp; Middle Click: Add Line Before');
		place_button_wider('Remove Line', 'Requires Double Click &nbsp;|&nbsp; Right Click: Remove Last Line');
		place_button_wider('Clear', 'Requires Double Click &nbsp;|&nbsp; Right Click: Format Input &nbsp;|&nbsp; Middle Click: Format All Inputs');
		place_button_wider('Erase', 'Right Click: Undo &nbsp;|&nbsp; Middle Click: Redo');

		$('.button').not('.programmable').each(function()
		{
			var dblclickers = ["Remove Line", "Clear"];

			if(dblclickers.indexOf($(this).text()) !== -1)
			{
				this.addEventListener('mouseup', function(event) 
				{
					if(event.which === 1)
					{
						if(event.detail % 2 === 0)
						{
							press($(this).text());
						}
					}
				}, false);					
			}

			else
			{
				$(this).click(function()
				{
					press($(this).text());
				});
			}

			$(this).on('auxclick', function(e)
			{
				press($(this).text(), e.which);
			});

			tippy(this, 
			{
				delay: [1200, 100],
				animation: 'scale',
				hideOnClick: false,
				duration: 100,
				arrow: true,
				performance: true,
				size: 'regular',
				arrowSize: 'small'
			});

			disable_context_menu(this);
		});
	}

	function draw_prog_buttons()
	{
		$('#prog_buttons').html('');

		for(let i=1; i<13; i++)
		{
			var s = '';

			var key = 'F' + i;

			var prog = user_data.programs[key];

			var t1 = 'Primary';
			var t2 = 'Secondary';
			
			if(prog !== undefined)
			{

				if(prog.primary !== undefined)
				{
					if(prog.primary.title !== '')
					{
						t1 = prog.primary.title;
					}
				}

				if(prog.secondary !== undefined)
				{
					if(prog.secondary.title !== '')
					{
						t2 = prog.secondary.title;
					}				
				}
			}

			s += "Click: " + t1 + " &nbsp;|&nbsp; ";
			s += "Right Click: " + t2 + " &nbsp;|&nbsp; ";
			s += 'Middle Click: Program';

			place_button_programmable(key, s);
		}

		$('.button.programmable').each(function()
		{
			$(this).click(function(e)
			{
				prog_press($(this).text(), e.which);
			});

			$(this).on('auxclick', function(e)
			{
				prog_press($(this).text(), e.which);
			});
			
			tippy(this, 
			{
				delay: [1200, 100],
				animation: 'scale',
				hideOnClick: false,
				duration: 100,
				arrow: true,
				performance: true,
				size: 'regular',
				arrowSize: 'small'
			});

			disable_context_menu(this);
		});		
	}

	function place_button(s, title='')
	{
		$('#buttons').append(`<button title="${title}" class='button'>${s}</button>`);
	}

	function place_button_wider(s, title='')
	{
		$('#buttons').append(`<button title="${title}" class='button wider'>${s}</button>`);
	}

	function place_prog_buttons_area()
	{
		$('#buttons').append("<span id='prog_buttons'></span>");
	}

	function place_button_programmable(s, title='')
	{
		$('#prog_buttons').append(`<button title="${title}" class='button programmable'>${s}</button>`);
	}

	function buttons_br()
	{
		$('#buttons').append('<br>');
	}

	function buttons_space()
	{
		var s = "<span class='buttons_space'></span>";
		$('#buttons').append(s);
	}

	function focus_next_or_add()
	{
		var nextAll = $(focused.input).parent().nextAll('.line');

		var found_line = false;

		$(nextAll).each(function()
		{
			var inp = $(this).find('.input')[0];

			if(inp.value === '')
			{
				focus_input(inp);
				found_line = true;
				return false;
			}
		});

		if(!found_line)
		{
			add_line();
		}
	}

	function add_line(value=false)
	{
		var num_lines = $('.line').length;

		if(num_lines === get_max_line_length())
		{
			play('nope');
			return;
		}

		if(num_lines === 0)
		{
			var letter = 'a';
		}

		else
		{
			var last_var = $('.input').last().data('variable');
			var letter = increase_var(last_var).substring(1);
		}

		if(!value)
		{
			value = '';
		}

		var s = `<div class='line'><button class='button variable'>$${letter}</button>`;
		s += `<input type='text' class='input' id='${letter}' value='${value}'><div class='result_container'><span class='result'></span></div></div>`;
		
		$('#lines').append(s);

		var input = $('.input').last()[0];
		
		focused.input = input;

		$('.variable').last().click(function()
		{
			press('$' + letter);
		});

		$(input).focus(function()
		{
			focused.input = this;
			change_borders();
			check_line_visibility();
		});

		$(input).on('input', function()
		{
			update_results();
		});

		$(input).keydown(function(e) 
		{
			var code = e.keyCode;

			if(code === 38 || code === 40)
			{
				e.preventDefault();
			}
		});

		$('.result').last().click(function()
		{
			on_result_click(this);
		});

		$('.result').last()[0].addEventListener('mousedown', function(event) 
		{
			if(event.detail > 1) 
			{
				event.preventDefault();
			}
		}, false);		

		$(input).data('variable', '$' + letter);
		
		focus_input(input);

		move_caret_to_end(input);
	}

	function add_line_before()
	{
		move_lines_down();
	}

	function add_line_after()
	{
		if($(focused.input).parent().index() === $('.line').length - 1)
		{
			add_line();
		}

		else
		{	
			move_lines_down(true);
		}
	}

	function remove_line()
	{
		if($('.line').length === 1)
		{
			clear_input(focused.input);
		}

		else if($(focused.input).parent().index() === $('.line').length - 1)
		{
			remove_last_line();
		}

		else
		{
			move_lines_up();
		}
	}

	function move_lines_up()
	{
		var line_length = $('.line').length;

		if(line_length === 1)
		{
			play('nope');
			return;
		}

		var input = focused.input;
		var line = $(input).parent()[0];
		var v = $(input).data('variable');
		var index = $(line).index();
		var last_index = $('.line').last().index();

		if(index === (line_length - 1))
		{
			if(input === focused.input)
			{
				$(line).prev('.line').find('.input').focus();
			}

			$(line).remove();

			update_results();

			return;
		}

		for(var i=0; i<line_length; i++)
		{
			var ln = $('.line').get(i);
			var inp = $(ln).find('.input')[0];
			var val = inp.value;

			if(val.trim() === '')
			{
				continue;
			}

			if(val.trim().startsWith('//'))
			{
				continue;
			}

			val = val.replace(/\$[a-z]+/g, function(match)
			{
				if(match === v)
				{
					return '';
				}

				var ni = get_var_index(match);

				if(ni > index && ni < line_length)
				{
					return decrease_var(match);
				}

				return match;
			});

			inp.value = val;
		}

		for(var i=index + 1; i<line_length; i++)
		{
			var inp = $($('.line').get(i)).find('.input')[0];
			var ninp = $(inp).parent().prev('.line').find('.input')[0];

			ninp.value = inp.value;
			inp.value = '';
		}

		$('.line').last().remove();

		update_results();
	}

	function move_lines_down(alt=false)
	{
		var line_length = $('.line').length;

		if(line_length === get_max_line_length())
		{
			play('nope');
			return;
		}

		if(alt)
		{
			focus_next();
		}

		var input = focused.input;
		var line = $(input).parent()[0];
		var v = $(input).data('variable');
		var index = $(line).index();
		var last_index = $('.line').last().index();

		for(var i=0; i<line_length; i++)
		{
			var ln = $('.line').get(i);
			var inp = $(ln).find('.input')[0];
			var val = inp.value;

			if(val.trim() === '')
			{
				continue;
			}

			if(val.trim().startsWith('//'))
			{
				continue;
			}

			val = val.replace(/\$[a-z]+/g, function(match)
			{
				if(match === v)
				{
					return '';
				}

				var ni = get_var_index(match);

				if(ni > index && ni < line_length)
				{
					return increase_var(match);
				}

				return match;
			});

			inp.value = val;
		}

		add_line();

		line_length = $('.line').length;

		for(var i=line_length - 1; i>index; i--)
		{
			var inp = $($('.line').get(i)).find('.input')[0];
			var ninp = $(inp).parent().prev('.line').find('.input')[0];

			inp.value = ninp.value;
		}

		input.value = '';

		focus_input(input);

		update_results();
	}

	function decrease_var(v)
	{
		var letter = v.substring(1);

		var res = '';

		var decrease_next = true;

		for(var i=letter.length - 1; i>=0; i--)
		{
			if(decrease_next)
			{
				if(letter[i] === letters[0])
				{
					if(i === 0)
					{
						break;
					}

					else
					{
						res += letters[letters.length - 1];
						decrease_next = true;
					}
				}

				else
				{
					res += letters[letters.indexOf(letter[i]) - 1];
					decrease_next = false;
				}
			}

			else
			{
				res += letters[letters.indexOf(letter[i])];
			}
		}

		return '$' + res.split('').reverse().join('');
	}

	function increase_var(v)
	{
		var letter = v.substring(1);

		var res = '';

		var increase_next = true;

		for(var i=letter.length - 1; i>=0; i--)
		{
			if(increase_next)
			{
				if(letter[i] === letters[letters.length - 1])
				{
					res += letters[0];
					increase_next = true;

					if(i == 0)
					{
						res += 'a';
					}
				}

				else
				{
					res += letters[letters.indexOf(letter[i]) + 1];
					increase_next = false;
				}
			}

			else
			{
				res += letters[letters.indexOf(letter[i])];
			}
		}

		return '$' + res.split('').reverse().join('');
	}

	function get_var_index(v)
	{
		var letter = v.substring(1);

		var n = letter.length - 1;

		var index = 0;

		var last_t;

		for(var i=0; i<letter.length; i++)
		{
			var t = letters.indexOf(letter[i]) + 1;

			var p = Math.pow(letters.length, n);
			
			t *= p;

			if(t === 0)
			{
				t += letters.indexOf(letter[i]);
			}
			
			index += t;

			n -= 1;
		}

		index -= 1;

		return index;
	}

	function remove_last_line()
	{
		if($('.line').length === 1)
		{
			clear_input(focused.input);
			return;
		}

		var line = $('.line').last()[0];

		var input = $('.input').last()[0];

		var val = input.value;

		if(input === focused.input)
		{
			$(line).prev('.line').find('.input').focus();
		}

		$(line).remove();

		update_results();
	}

	function hide_plus()
	{
		$('#plus').css('display', 'none');
	}

	function get_result(input)
	{
		var result = $(input).parent().find('.result')[0];

		$(result).html('');

		try
		{
			var val = input.value;

			if(val.trim().startsWith('//'))
			{
				show_comment(input);
				return;
			}

			if(val.trim().length === 0)
			{
				return;
			}

			if(options.fraction)
			{
				var result = math_fraction.eval(val.replace(/\$/g, '_') + '*1', linevars);
			}

			else
			{
				var result = math_normal.eval(val.replace(/\$/g, '_') + '*1', linevars);
			}

			update_variable(input, result);

			show_result(input, format_result(result));
		}

		catch(err)
		{
			show_error(input);
		}
	}

	function show_error(input)
	{
		show_result(input, 'Error');
	}

	function show_comment(input)
	{
		show_result(input, 'Comment');
	}

	function show_result(input, s)
	{
		$(input).parent().find('.result').html(s);
	}

	function update_variable(input, val)
	{
		linevars[$(input).data('variable').replace('$', '_')] = val;
	}

	function format_result(n, f=false)
	{
		if(options.fraction && !f)
		{
			var split = math_fraction.format(n).split('/');

			if(split.length === 2)
			{
				var sup = split[0];
				var sub = split[1];

				return `<span class='resolved'><sup>${sup}</sup><br><sub>${sub}</sub></span>`
			}

			else
			{
				return format_result(n, true);
			}
		}

		else
		{
			if(options.round)
			{
				n = math_normal.round(n, options.round_places);
			}

			var ns = n.toString();

			if(ns.indexOf('.') !== -1)
			{
				var split = ns.split('.');
				var whole = split[0].toString() + '.';
				var decimal = split[1].toString();
			}

			else
			{
				var whole = n.toString();
				var decimal = '';
			}

			if(options.commas)
			{
				whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}
			
			return `<span class='resolved'><span class='whole'>${whole}</span><span class='decimal'>${decimal}</span></span>`
		}
	}

	function press(s, aux=false)
	{
		if(s === "sin")
		{
			s = "sin(";
		}

		else if(s === "cos")
		{
			s = "cos(";
		}

		else if(s === "tan")
		{
			s = "tan(";
		}

		else if(s === "pow")
		{
			s = "^";
		}

		else if(s === "sqrt")
		{
			s = "sqrt(";
		}

		if(aux)
		{
			s = check_aux(s, aux);

			if(!s)
			{
				focus_input(focused.input);
				return;
			}
		}

		if(s === "Clear")
		{
			clear_input(focused.input);
			return;
		}

		else if(s === "Erase")
		{
			erase_character();
			update_results();
			return;
		}

		else if(s === "New Line")
		{
			focus_next_or_add();
			focus_input(focused.input);
			return;
		}

		else if(s === "Remove Line")
		{
			remove_line();
			focus_input(focused.input);
			return;
		}

		else if(s === "Up")
		{
			line_up();
			focus_input(focused.input);
			return;
		}

		else if(s === "Down")
		{
			line_down();
			focus_input(focused.input);
			return;
		}

		var v = $(focused.input).data('variable');

		if(s === v)
		{
			focus_next_or_add();

			v = $(focused.input).data('variable');
			
			if(s === v)
			{
				return;
			}
		}

		insert_text(focused.input, s);

		update_results();
	}

	function blur_focus()
	{
		focused.input.blur();
		focused.input.focus();
	}

	function check_aux(s, aux)
	{
		if(aux)
		{
			for(var i=1; i<10; i++)
			{
				if(s == i)
				{
					if(aux === 3)
					{
						return "1/" + i;
					}

					else if(aux === 2)
					{
						return "0." + i;
					}
				}
			}

			if(s == 0)
			{
				if(aux === 3)
				{
					return "00";
				}

				else if(aux === 2)
				{
					return "000";
				}
			}

			else if(s === "cos(")
			{
				if(aux === 3)
				{
					return "acos(";
				}

				else if(aux === 2)
				{
					return "acosh(";
				}
			}

			else if(s === "tan(")
			{
				if(aux === 3)
				{
					return "atan(";
				}

				else if(aux === 2)
				{
					return "atanh(";
				}
			}

			else if(s === "sin(")
			{
				if(aux === 3)
				{
					return "asin(";
				}

				else if(aux === 2)
				{
					return "asinh(";
				}
			}

			else if(s === "sqrt(")
			{
				if(aux === 3)
				{
					return "cbrt(";
				}
			}

			else if(s === "pi")
			{
				if(aux === 3)
				{
					return "phi"
				}

				else if(aux === 2)
				{
					return "e";
				}
			}

			else if(s === "Up")
			{
				if(aux === 3)
				{
					move_line_up();
					return false;
				}
			}

			else if(s === "Down")
			{
				if(aux === 3)
				{
					move_line_down();
					return false;
				}
			}

			else if(s === "Remove Line")
			{
				if(aux === 3)
				{
					remove_last_line();
					return false;
				}
			}

			else if(s === "New Line")
			{
				if(aux === 3)
				{
					add_line_after();
					return false;
				}

				else if(aux === 2)
				{
					add_line_before();
					return false;
				}
			}

			else if(s === "Clear")
			{
				if(aux === 3)
				{
					format_input(focused.input);
					return false;
				}

				else if(aux === 2)
				{
					format_all_inputs();
					return false;
				}
			}

			else if(s === "Erase")
			{
				if(aux === 3)
				{
					undo_change();
					update_results();
					return false;
				}

				else if(aux === 2)
				{
					redo_change();
					update_results();
					return false;
				}				
			}
		}

		return false;
	}

	function prog_press(key, e)
	{
		if(e === 2)
		{
			open_program_editor(key);
			return false;
		}

		var prog = user_data.programs[key];

		if(prog !== undefined)
		{
			if(e === 1)
			{
				execute_program(prog.primary.commands);
			}

			if(e === 3)
			{
				execute_program(prog.secondary.commands);
			}	
		}

		focus_if_isnt(focused.input);
	}

	function clear_input(input)
	{
		replace_text(input, '');
		update_results();
	}

	function update_results()
	{
		undefine_variables();

		var variables = {};


		$('.input').each(function()
		{
			var val = this.value;

			var v = $(this).data('variable');
			
			variables[v] = {};

			var vr = variables[v];
			
			vr.edges = [];
		});

		$('.input').each(function()
		{
			var v = $(this).data('variable');
			
			var val = this.value;

			if(val.trim() === '')
			{
				if(val.length > 0)
				{
					this.value = '';
				}

				return true;
			}

			if(val.trim().startsWith('//'))
			{
				return true;
			}

			var matches = val.match(/\$[a-z]+/g);

			if(matches !== null)
			{
				variables[v].edges = matches;
			}
		});

		var sorted = [];

		var n = 0;

		while(Object.keys(variables).length)
		{
			n += 1;

			var acyclic = false;

			var vars = Object.assign({}, variables);

			var keys = Object.keys(vars);

			for(var i=0; i<keys.length; i++)
			{
				var edges = vars[keys[i]].edges;

				var found = false;

				for(var el of edges)
				{
					if(vars[el] !== undefined)
					{
						found = true;
						break;
					}
				}

				if(!found)
				{
					acyclic = true;
					delete variables[keys[i]];
					sorted.push(keys[i]);
				}
			}

			if(!acyclic)
			{	
				$('.input').each(function()
				{
					var v = $(this).data('variable');

					var letter = v.substring(1);

					if(sorted.indexOf(v) !== -1)
					{
						get_result($('#' + letter)[0]);
					}

					else
					{
						show_result($('#' + letter)[0], 'Not Acyclical');					
					}
				});

				return;
			}

			if(n > 10000)
			{
				console.log('Exceeded Loop Limit');
				return;
			}
		}

		for(var i=0; i<sorted.length; i++)
		{
			var letter = sorted[i].substring(1);
			get_result($('#' + letter)[0]);
		}
	}

	function check_line_visibility()
	{
		var it = $(focused.input).parent()[0].getBoundingClientRect().top;
		var ct = $('#lines_container').offset().top;

		if(it < ct)
		{
			$('#lines_container').scrollTop($('#lines_container').scrollTop() - (ct - it));
		}

		var ib = it + $(focused.input).parent().outerHeight();
		var cb = ct + $('#lines_container').outerHeight();

		if(ib > cb)
		{
			$('#lines_container').scrollTop($('#lines_container').scrollTop() + (ib - cb));
		}		
	}

	function focus_input(input)
	{
		input.focus();
	}

	function focus_next()
	{
		$(focused.input).parent().next('.line').find('.input').focus();	
	}

	function focus_prev()
	{
		$(focused.input).parent().prev('.line').find('.input').focus();	
	}

	function line_up()
	{
		focus_prev();
	}

	function line_down()
	{
		focus_next();	
	}

	function move_line_up()
	{
		var index = $(focused.input).parent().index();

		if(index === 0)
		{
			play('nope');
			return;
		}

		var inp = focused.input;
		var ninp = $(inp).parent().prev('.line').find('.input')[0];

		var val = inp.value;
		var nval = ninp.value;

		var v = $(inp).data('variable');
		var nv = $(ninp).data('variable');

		var cv = '$@!#' + v.substring(1);
		var cnv = '$@!#' + nv.substring(1);

		var re = new RegExp("\\$" + v.substring(1), 'g');
		var re2 = new RegExp("\\$" + nv.substring(1), 'g');

		$('.input').each(function()
		{
			var vl = this.value.replace(re, cnv);
			vl = vl.replace(re2, cv);
			this.value = vl.replace(/@!#/g, '');
		});

		val = inp.value;
		nval = ninp.value;

		inp.value = nval;
		ninp.value =  val;

		focus_if_isnt(ninp);

		update_results();
	}

	function move_line_down()
	{
		var index = $(focused.input).parent().index();

		if(index === ($('.line').length - 1))
		{
			play('nope');
			return;
		}

		var inp = focused.input;
		var ninp = $(inp).parent().next('.line').find('.input')[0];

		var val = inp.value;
		var nval = ninp.value;

		var v = $(inp).data('variable');
		var nv = $(ninp).data('variable');

		var cv = '$@!#' + v.substring(1);
		var cnv = '$@!#' + nv.substring(1);

		var re = new RegExp("\\$" + v.substring(1), 'g');
		var re2 = new RegExp("\\$" + nv.substring(1), 'g');

		$('.input').each(function()
		{
			var vl = this.value.replace(re, cnv);
			vl = vl.replace(re2, cv);
			this.value = vl.replace(/@!#/g, '');		
		});

		val = inp.value;
		nval = ninp.value;

		inp.value = nval;
		ninp.value =  val;

		focus_if_isnt(ninp);

		update_results();
	}

	function cycle_inputs(direction)
	{
		if($('.input').length === 1)
		{
			return;
		}

		var index = $(focused.input).parent().index();

		if(direction === 'down')
		{
			if(index === ($('.input').length - 1))
			{
				focus_input($('.input').first()[0]);
			}

			else
			{
				focus_next();
			}
		}

		else
		{
			if(index === 0)
			{
				focus_input($('.input').last()[0]);
			}

			else
			{
				focus_prev();
			}
		}
	}

	function change_borders()
	{
		$('.input').each(function()
		{
			$(this).css('border-width', '0.1em');
		});

		$(focused.input).css('border-width', '0.22em');
	}

	function place_lines_container()
	{
		var h = $(window).height() - $('#app_top').outerHeight();

		$('#lines_container').css('height', h + 'px');
	}

	function resize_events()
	{
		$(window).resize(function()
		{
			resize_timer();
		})
	}

	var resize_timer = (function() 
	{
		var timer; 
		return function() 
		{
			clearTimeout(timer);
			timer = setTimeout(function() 
			{
				place_infobar();
				place_lines_container();
			}, 350);
		};
	})();

	function play(what)
	{
		if(options.sound)
		{
			$('#' + what)[0].pause();
			$('#' + what)[0].currentTime = 0;
			$('#' + what)[0].play();
		}
	}

	function refresh_page()
	{
		document.location = site_root;
	}

	function check_refresh()
	{
		var s = stringify_sheet();

		if(s.trim().replace(/@!#/g, '').length < 1)
		{
			refresh_page();
			return;
		}

		if(saved_content !== s)
		{
			var conf = confirm("This will discard all unsaved changes. Are you sure?");

			if(conf) 
			{
				refresh_page();
			}
		}

		else
		{
			refresh_page();
		}		
	}

	function title_click_events()
	{
		$('#lnk_new').click(function()
		{
			check_refresh();
		});	

		$('#lnk_save').click(function()
		{
			save_sheet();
		});

		$('#lnk_options').click(function()
		{
			show_options();
		});

		$('#lnk_more').click(function()
		{
			show_more();
		});
	}

	function save_sheet()
	{
		if(!save_enabled)
		{
			return;
		}

		var s = stringify_sheet();

		if(s.trim().replace(/@!#/g, '').length < 1)
		{
			msg("You can't save an empty sheet.");
			return;
		}

		else if(s.length > 50000)
		{
			msg("Sheet is too big.");
			return;
		}

		save_enabled = false;

		$.post('/save_sheet/',
		{
			content: s
		})

		.done(function(data)
		{
			on_save_response(data.response, s);
		})

		.fail(function(data)
		{
			msg('A network error occurred.');
		})

		.always(function()
		{
			save_enabled = true;
		});
	}

	function on_save_response(response, svd)
	{
		if(response === 'empty')
		{
			msg("You can't save an empty sheet.");
		}

		else if(response === 'toobig')
		{
			msg("Sheet is too big.");
		}

		else
		{
			var uparams = make_uparams(response);

			edit_url(uparams);

			var s = "";

			var url = site_root + uparams;

			s += url + "<br><br>";

			s += "<span id='ctcb' class='linky2'>Copy To Clipboard</span>";

			msg(s);

			play('done');

			$('#ctcb').click(function()
			{
				copy_to_clipboard(url);
				play('pup');
				hide_overlay();
			});

			add_to_saved(url, svd);

			saved_content = svd;
		}
	}

	function add_to_saved(url, svd)
	{
		if(user_data.saved === undefined)
		{
			user_data.saved = [];
		}

		var split = svd.split('@!#');

		var num_lines = split.length;

		var n = Math.min(5,split.length);

		var sample = '';

		for(var i=0; i<n; i++)
		{
			var line = split[i].substring(0, 100).trim();

			if(line === '')
			{
				line = 'Empty'
			}

			sample += line + '\n';
		}

		user_data.saved.unshift([dateFormat(Date.now(), "dddd, mmmm dS, yyyy, h:MM:ss TT"), url, num_lines, sample, options.fraction]);

		update_user_data();
	}

	function copy_to_clipboard(s)
	{
		var textareaEl = document.createElement('textarea');
		document.body.appendChild(textareaEl);
		textareaEl.value = s;
		textareaEl.select();
		document.execCommand('copy');
		document.body.removeChild(textareaEl);
	}

	function make_uparams(s)
	{
		if(options.fraction)
		{
			s += "?";
			s += "frac";
		}

		return s;
	}

	function get_url_param(param)
	{
		return new URLSearchParams(window.location.search).get(param);
	}

	function edit_url(s)
	{
		window.history.pushState({"pageTitle": "title", "content": "etc"}, "", '/' + s);
	}

	function stringify_sheet()
	{
		var s = "";

		$('.input').each(function()
		{
			s += this.value;
			s += "@!#";
		});

		s = s.substring(0, s.length - 3);

		s = s.replace(/\\/g, '\\\\');

		return s;
	}

	function create_about()
	{
		var s = "";

		s += "<b>Merkoba Calculator</b><br>";
		s += "Version " + app_version + "<br><br>";
		s += "This is a calculator that aims to empower users through a different workflow than what is found in most common calculator programs.<br><br>";
		s += "It's based around multiple \"lines\" of calculations which can be reused and edited anytime.<br><br>";
		s += "Calculations are done by the <a href='http://mathjs.org/docs/index.html' target=_blank>math.js</a> library, with high precision settings enabled.<br><br>";
		s += "Calculations are done automatically in real time using topological sorting.<br><br>";
		s += "Since it needs to by acyclical, some variables can't be used in some places. For example you can't make $b depend on $a and $a depend on $b at the same time, since it can't be resolved.<br><br>";
		s += "You can save a sheet for future use or sharing.<br><br>";
		s += "Note: Formatting and rounding are only applied to the displayed results, not to internal calculations.";

		s += "<br><br><br><span class='b2'>Shortcuts</span><br><br>";
		s += "Enter will focus the next available empty line or create a new one.<br><br>";
		s += "Shift + Enter does the same but also adds the previous line's variable into the new one.<br><br>";
		s += "Control + Enter does the same but also copies the line's input into the new one.<br><br>";
		s += "Control + Shift + Enter replaces a line's input's variables with their corresponding inputs.<br><br>";
		s += "Shift + Space adds the variable from the line above to the current line.<br><br>";
		s += "Control + Space adds the input from the line above to the current line.<br><br>";
		s += "Control + Shift + Space formats the input.<br><br>";
		s += "Up and Down arrows change the focus between lines.<br><br>";
		s += "Shift + Up and Shift + Down move the lines up or down.<br><br>";
		s += "Tab and Shift + Tab cycle the focus between lines.<br><br>";
		s += "Escape clears a line, removes the line if already cleared, or closes popups.<br><br>";
		s += "Constants and methods in the Reference will be added to the current line when clicked.<br><br>";
		s += "Some buttons have other mapped functions. Hover the cursor over a button to see if it does.<br><br>";
		s += "Clicking on a result copies the result to the clipboard.";

		s += "<br><br><br><span class='b2'>Exporting</span><br><br>";
		s += "User options and data are stored in the Local Storage in your browser.<br><br>";
		s += "In case you need to export them to another browser you can manually copy the object strings from one browser to another.<br><br>";
		s += "To access the options object use localStorage.getItem(BASE.ls_options).<br><br>";
		s += "To access the user data object use localStorage.getItem(BASE.ls_user_data).<br><br>";
		s += "To copy the values to another browser use localStorage.setItem.";

		about = s;
	}

	function show_about()
	{
		if(about === undefined)
		{
			create_about();
		}

		msg(about);
	}

	function overlay_clicked()
	{
		$('#overlay').click(function()
		{
			hide_overlay();
		});
	}

	function hide_overlay()
	{
		$('#overlay').css('display', 'none');
		$('#msg').css('display', 'none');
		$('#msg').html('');

		msg_open = false;

		focus_input(focused.input);
	}

	function msg(txt, temp_disable=false)
	{
		$('#overlay').css('display', 'block');
		$('#msg').html(txt);
		$('#msg').css('display', 'block');
		$('#msg').scrollTop(0);
		$('#msg').focus();
		
		msg_open = true;
	}

	function msg_align_btns(alt=false)
	{
		if(alt)
		{
			$('#msg').find('.dialog_btn').each(function()
			{
				$(this).width($(this).outerWidth());
			});		
		}

		else
		{
			var w = 0;

			$('#msg').find('.dialog_btn').each(function()
			{
				w = Math.max(w, $(this).outerWidth());
			});

			$('#msg').find('.dialog_btn').each(function()
			{
				$(this).width(w);
			});
		}
	}

	function check_params()
	{
		if(get_url_param('frac') === null)
		{
			if(options.fraction)
			{
				toggle_fraction();
			}
		}

		else
		{
			if(!options.fraction)
			{
				toggle_fraction();
			}
		}		
	}

	function load_saved_content()
	{
		check_params();

		var splits = saved_content.split('@!#');

		for(var i=0; i<splits.length; i++)
		{	
			var value = splits[i];

			add_line(value);
		}

		update_results();
	}

	function get_site_root()
	{
		site_root = window.location.href.match(/^.*\//)[0];
	}

	function adjust_volumes()
	{
		$('#nope')[0].volume = 0.4;
		$('#pup')[0].volume = 0.6;
		$('#done')[0].volume = 0.7;
	}

	function add_ans()
	{
		var variable = $(focused.input).parent().prev('.line').find('.input').data('variable');

		if(variable !== undefined)
		{
			press(variable);
		}
	}

	function add_top_val()
	{
		var val = $(focused.input).parent().prev('.line').find('.input').val();

		if(val !== '')
		{
			press(val);
		}
	}

	function show_more()
	{
		var s = "";

		s += "<span class='linky2' id='more_saved'>Saved</span><br><br><br>";

		s += "<span class='linky2' id='more_about'>About</span>";

		msg(s);

		msg_align_btns();

		$('#more_options').click(function()
		{
			show_options();
		});

		$('#more_saved').click(function()
		{
			show_saved();
		});

		$('#more_about').click(function()
		{
			show_about();
		});
	}

	function show_options()
	{
		var s = "";

		s += "Add Commas<br><br>";

		if(options.commas)
		{
			s += "<input id='chk_commas' type='checkbox' checked>";
		}

		else
		{
			s += "<input id='chk_commas' type='checkbox'>";
		}
		
		s += "<br><br><br>Round Results<br><br>";

		if(options.round)
		{
			s += "<input id='chk_round' type='checkbox' checked>";
		}

		else
		{
			s += "<input id='chk_round' type='checkbox'>";
		}

		s += "<br><br><br>Round Places<br><br>";

		s += "<select id='sel_round_places'>";
		s += "<option value='0'>0</option>";
		s += "<option value='1'>1</option>";
		s += "<option value='2'>2</option>";
		s += "<option value='3'>3</option>";
		s += "<option value='4'>4</option>";
		s += "<option value='5'>5</option>";
		s += "</select>"		

		s += "<br><br><br>Enable Sound<br><br>";

		if(options.sound)
		{
			s += "<input id='chk_sound' type='checkbox' checked>";
		}

		else
		{
			s += "<input id='chk_sound' type='checkbox'>";
		}

		s += "<br><br><br>Theme<br><br>";

		s += "<select id='sel_theme'>";

		for(let i=0; i<themes.length; i++)
		{
			s += "<option value='" + themes[i] + "'>" + capitalize_string(themes[i]) + "</option>";
		}

		s += "</select>"

		msg(s);

		$('#sel_round_places').find('option').each(function()
		{
			if(this.value == options.round_places)
			{
				$(this).prop('selected', true);
			}
		});

		$('#sel_theme').find('option').each(function()
		{
			if(this.value == options.theme)
			{
				$(this).prop('selected', true);
			}
		});

		$('#chk_commas').change(function()
		{
			options.commas = $(this).prop('checked');
			update_results();
			update_options();
		});
		
		$('#chk_round').change(function()
		{
			options.round = $(this).prop('checked');
			update_results();
			update_options();
		});	

		$('#sel_round_places').change(function()
		{
			options.round_places = parseInt(this.value);
			update_results();
			update_options();
		});

		$('#chk_fraction').change(function()
		{
			toggle_fraction();
		});		

		$('#chk_sound').change(function()
		{
			options.sound = $(this).prop('checked');
			update_options();
		});

		$('#sel_theme').change(function()
		{
			options.theme = this.value;
			apply_theme(options.theme);
			update_options();
		});
	}

	function update_options()
	{
		localStorage.setItem(BASE.ls_options, JSON.stringify(options));
	}

	function get_options()
	{
		options = JSON.parse(localStorage.getItem(BASE.ls_options));

		var mod = false;

		if(options === null)
		{
			options = {};
			mod = true;
		}

		if(options.sound === undefined)
		{
			options.sound = true;
			mod = true;
		}

		if(options.commas === undefined)
		{
			options.commas = true;
			mod = true;
		}

		if(options.round === undefined)
		{
			options.round = true;
			mod = true;
		}

		if(options.round_places === undefined)
		{
			options.round_places = 5;
			mod = true;
		}

		if(options.fraction === undefined)
		{
			options.fraction = false;
			mod = true;
		}

		if(options.theme === undefined)
		{
			options.theme = 'paper';
			mod = true;
		}

		else
		{
			if(themes.indexOf(options.theme) === -1)
			{
				options.theme = 'paper';
				mod = true;
			}
		}

		if(mod)
		{
			update_options();
		}
	}

	function get_user_data()
	{
		user_data = JSON.parse(localStorage.getItem(BASE.ls_user_data));

		var mod = false;

		if(user_data === null)
		{
			user_data = {};
			mod = true;
		}

		if(user_data.saved === undefined)
		{
			user_data.saved = [];
			mod = true;
		}

		if(user_data.programs === undefined)
		{
			user_data.programs = {};
			mod = true;
		}

		if(mod)
		{
			update_user_data();
		}
	}

	function update_user_data()
	{
		localStorage.setItem(BASE.ls_user_data, JSON.stringify(user_data));
	}

	function show_saved(j=0)
	{
		if(user_data.saved.length === 0)
		{
			msg('Nothing saved yet.');
			return;
		}

		else
		{
			var s = "";
			
			var n = Math.min(20 + j, user_data.saved.length);

			for(var i=j; i<n; i++)
			{
				s += "<a class='ancher1' target=_blank href='" + user_data.saved[i][1] + "' title='" + user_data.saved[i][3] + "'>";
				
				s += user_data.saved[i][0];

				var num_lines = user_data.saved[i][2];
				
				s += "<br>" + num_lines;

				if(num_lines === 1)
				{
					s += " Line";
				}

				else
				{
					s += " Lines";
				}

				if(user_data.saved[i][4])
				{
					s += " - Fraction";
				}

				else
				{
					s += " - Normal";
				}

				s += "</a>";

				if(i < n - 1)
				{
					s += "<br><br>";
				}
			}

			if(n < user_data.saved.length)
			{
				s += "<br><br><div id='svd_load_more' class='linky3' data-j=" + n + ">Load More</div>";
			}

			if(j > 0)
			{
				$('#msg').append(s);
			}

			else
			{
				msg(s);
			}

			$('#svd_load_more').click(function()
			{
				var j = $(this).data('j');

				$(this).remove();

				show_saved(j);
			});
		}
	}

	function fill_sheet(x=false)
	{
		if(x)
		{
			var n = x;
		}

		else
		{
			var n = get_max_line_length() - $('.line').length;
		}

		for(var i=0; i<n; i++)
		{
			add_line();
		}
	}

	global.test1 = function(x=false)
	{
		fill_sheet(x);

		var s = "+3*45-56/43^4+acosh(8.9)";

		$('.input').each(function()
		{
			this.value = this.value + s;

			$(this).parent().next('.line').find('.input').val($(this).data('variable'));
		});

		update_results();
	}

	function disable_context_menu(el)
	{
		el.addEventListener('contextmenu', event => event.preventDefault());
	}

	function focus_if_isnt(input)
	{
		if(input !== document.activeElement)
		{
			focus_input(input);
		}
	}

	function get_max_line_length()
	{
		return get_var_index('$zz') + 1;
	}

	function undefine_variables()
	{
		for(var varName in linevars) 
		{
			linevars[varName] = undefined;
		}
	}

	function on_result_click(el)
	{
		var s = "";

		if($(el).find('sup').length > 0)
		{
			s += $(el).find('sup').text();

			s += "/";

			s += $(el).find('sub').text();
		}

		else
		{
			s += $(el).text();
		}

		copy_to_clipboard(s);

		play('pup');
	}

	function toggle_fraction()
	{
		options.fraction = !options.fraction;
		update_results();
		apply_mode();
		update_infobar();
		update_options();
	}

	function show_code()
	{
		var s = "<span id='ctcb' class='linky2'>Copy To Clipboard</span><br><br>";

		var c = "";
		
		var c2 = "";

		$('.input').each(function()
		{
			var val = this.value.trim().replace(/\s+/g, ' ');

			if(val === '')
			{
				return true;
			}

			if(!val.startsWith('//'))
			{
				c += "var " + $(this).data('variable') + " = ";
				c2 += "var " + $(this).data('variable') + " = ";
			}

			c += val;

			c2 += val;

			c += ";<br><br>";

			c2 += ";\n"
		});

		if(c === "")
		{
			msg('Nothing to generate.');
			return;
		}

		s = s + c.substring(0, c.length - 8);

		c2 = c2.substring(0, c2.length - 1);

		msg(s);

		$('#ctcb').click(function()
		{
			copy_to_clipboard(c2);
			play('pup');
			hide_overlay();
		});		
	}

	function copy_value_down()
	{
		var og_var = $(focused.input).data('variable');
		var og_val = focused.input.value;

		focus_next_or_add();

		if(og_var !== $(focused.input).data('variable'))
		{
			replace_text(focused.input, og_val);
			update_results();
		}
	}

	function expand_value(input)
	{
		var val = input.value;

		if(val.trim() === '')
		{
			return;
		}

		if(val.trim().startsWith('//'))
		{
			return;
		}

		if(val.indexOf('$') === -1)
		{
			return;
		}

		var vr = $(input).data('variable');

		var n = 0;

		while(true)
		{
			var og_val = val;

			val = val.replace(/\$[a-z]+/g, function(match)
			{
				if(match === vr)
				{
					return match;
				}

				var v = $('#' + match.substring(1)).val();

				if(v !== undefined && v.trim() !== '')
				{
					return "(" + v + ")";
				}

				else
				{
					return match;
				}

			});

			if(og_val === val)
			{
				break;
			}

			n += 1;

			if(n > 10000)
			{
				break;
			}
		}

		if(val.indexOf('$') !== -1)
		{
			play('nope');
			return;
		}

		try
		{
			val = math_normal.parse(val).toString({parenthesis: 'auto'});
		}

		catch(err)
		{
			play('nope');
			return;
		}

		replace_text(input, val);

		update_results();
	}

	function format_input(input, update=true)
	{
		var val = input.value;

		if(val.trim() === '')
		{
			return;
		}

		if(val.trim().startsWith('//'))
		{
			return;
		}

		try
		{
			val = math_normal.parse(val.replace(/\$/g, '_')).toString({parenthesis: 'auto'});
			val = val.replace(/_/g, '$');
		}

		catch(err)
		{
			play('nope');
			return;
		}

		replace_text(input, val);

		if(update)
		{
			update_results();
		}
	}

	function format_all_inputs()
	{
		$('.input').each(function()
		{
			format_input(this, false);
		});

		update_results();
	}

	function insert_text(input, s)
	{
		focus_if_isnt(input);
		document.execCommand('insertText', false, s)
	}

	function replace_text(input, s)
	{
		focus_if_isnt(input);
		document.execCommand('selectAll', false, null);
		document.execCommand('insertText', false, s);
	}

	function erase_character()
	{
		var ss = focused.input.selectionStart;

		if(ss === 0)
		{
			focus_input(focused.input);
			return;
		}

		focused.input.setSelectionRange(ss - 1, ss);
		insert_text(focused.input, '');		
	}

	function undo_change()
	{
		document.execCommand('undo', false, null);
		remove_ranges();
	}

	function redo_change()
	{
		document.execCommand('redo', false, null);
		remove_ranges();		
	}

	function remove_ranges()
	{
		var ss = focused.input.selectionEnd;
		focused.input.setSelectionRange(ss, ss);
	}

	function place_infobar()
	{
		var w = $('#buttons').width();

		$('#infobar').css('width', w + 'px');
	}

	function update_infobar()
	{
		var s = "";

		s += "<span id='ib_fraction_toggle' class='ib_item'>";

		if(options.fraction)
		{
			s += "Fraction Mode";
		}

		else
		{
			s += "Normal Mode";
		}

		s += "</span>"

		$('#infobar').html(s);

		$('#ib_fraction_toggle').click(function()
		{
			toggle_fraction();
		});
	}

	function apply_theme(theme)
	{
		$('head').append("<link rel='stylesheet' href='/static/app/themes/" + theme + ".css?v=" + app_version + "'>");
	}

	function apply_mode()
	{
		if(options.fraction)
		{
			var mode = "fraction";
		}

		else
		{
			var mode = "normal";
		}

		$('head').append("<link rel='stylesheet' href='/static/app/modes/" + mode + ".css?v=" + app_version + "'>");
	}

	function capitalize_string(text) 
	{
		return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
	}

	function move_caret_to_end(input)
	{
		input.setSelectionRange(input.value.length, input.value.length);
	}

	function open_program_editor(key)
	{
		var s = "";

		s += "Primary Action Title</b2>";
		s += "<br><input class='prog_input'></input>";

		s += "<br><br><br>";

		s += "Primary Action Commands";
		s += "<br><input class='prog_input'></input>";

		s += "<br><br><br>";

		s += "Secondary Action Title";
		s += "<br><input class='prog_input'></input>";

		s += "<br><br><br>";

		s += "Secondary Action Commands";
		s += "<br><input class='prog_input'></input>";

		s += "<br><br><br>";

		s += "<span id='prog_save' class='linky2'>Save</span>";

		s += "<br><br><br>";

		s += "Available Commands";

		s += "<br><br>";

		for(let i=0; i<commands.length; i++)
		{
			s += commands[i] + "<br>";
		}

		s += "<br><br>";

		s += "Examples";
		s += "<br><br>";
		s += "insert 34<br>";
		s += "insert pi<br>";
		s += "add line; insert cos(55)<br>";
		s += "go up; erase; format<br>";
		s += "insert 1; add line; ans; insert + 2";

		msg(s);

		var prog = user_data.programs[key];

		if(prog !== undefined)
		{
			$('#msg').find('input').get(0).value = prog.primary.title;
			$('#msg').find('input').get(1).value = prog.primary.commands;

			$('#msg').find('input').get(2).value = prog.secondary.title;
			$('#msg').find('input').get(3).value = prog.secondary.commands;
		}

		$('#msg').find('input').first().focus();

		$('#prog_save').click(function()
		{
			save_program(key);
			hide_overlay();
		});
	}

	function save_program(key)
	{
		var p_title = $('#msg').find('input').get(0).value.trim().replace(/\s+/g, ' ');
		var p_commands = $('#msg').find('input').get(1).value.trim().replace(/\s+/g, ' ');

		var s_title = $('#msg').find('input').get(2).value.trim().replace(/\s+/g, ' ');
		var s_commands = $('#msg').find('input').get(3).value.trim().replace(/\s+/g, ' ');

		if(user_data.programs[key] === undefined)
		{
			user_data.programs[key] = {primary:{}, secondary:{}}
		}

		user_data.programs[key].primary.title = p_title;
		user_data.programs[key].primary.commands = p_commands;

		user_data.programs[key].secondary.title = s_title;
		user_data.programs[key].secondary.commands = s_commands;

		draw_prog_buttons();

		update_user_data();
	}

	function execute_program(cmds)
	{
		var split = cmds.split(';');

		for(let i=0; i<split.length; i++)
		{
			var command = split[i].trim().replace(/\s+/g, ' ');

			if(command.length === 0)
			{
				continue;
			}

			if(command.indexOf('insert ') !== -1)
			{
				insert_text(focused.input, command.replace('insert ', ''));
				continue;
			}

			var index = commands.indexOf(command);

			if(index !== -1)
			{
				execute_command(command);
			}
		}
	}

	function execute_command(command)
	{
		if(command === "clear")
		{
			clear_input(focused.input);
		}

		else if(command === "erase")
		{
			erase_character();
		}

		else if(command === "add line")
		{
			add_line();
		}

		else if(command === "add line before")
		{
			add_line_before();
		}

		else if(command === "add line after")
		{
			add_line_after();
		}

		else if(command === "remove line")
		{
			remove_line();
		}

		else if(command === "remove last line")
		{
			remove_last_line();
		}

		else if(command === "ans")
		{
			add_ans();
		}

		else if(command === "go up")
		{
			line_up();
		}

		else if(command === "go down")
		{
			line_down();
		}

		else if(command === "move line up")
		{
			move_line_up();
		}

		else if(command === "move line down")
		{
			move_line_down();
		}

		else if(command === "undo")
		{
			undo_change();
		}

		else if(command === "redo")
		{
			redo_change();
		}

		else if(command === "format")
		{
			format_input(focused.input);
		}

		else if(command === "format all")
		{
			format_all_inputs();
		}

		else if(command === "expand")
		{
			expand_value(focused.input);
		}

		else if(command === "caret to end")
		{
			move_caret_to_end(focused.input);
		}
	}

	return global;
}());