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
	var about;
	var site_root;
	var save_enabled = true;
	var options;
	var saved;
	var programs;
	var ls_options = 'options_v4';
	var ls_saved = 'saved_v4';
	var ls_programs = 'programs_v4';
	var msg;
	var stor;

	var themes = [
		'lake',
		'leaf',
		'bulb',
		'wine',
		'bubble',
		'vapor',
		'clouds',
		'paper',
		'cobalt',
		'carbon'
	];

	var commands = [
		'insert x',
		'clear',
		'erase',
		'add line',
		'add line before',
		'add line after',
		'go to next empty line',
		'go to first line',
		'go to last line',
		'remove line',
		'remove last line',
		'remove all lines',
		'prev variable',
		'prev input',
		'next variable',
		'next input',
		'go up',
		'go down',
		'move line up',
		'move line down',
		'undo',
		'redo',
		'format',
		'format all',
		'expand',
		'move caret to end',
		'move caret to start',
		'comment',
		'comment all',
		'uncomment',
		'uncomment all',
		'toggle comment',
		'play done',
		'play pup',
		'play nope'
	];

	var focused = {
		input: null
	};

	global.init = function()
	{
		init_msg_and_stor();
		get_local_storage();
		apply_theme(options.theme);
		apply_mode();
		draw_buttons();
		draw_prog_buttons();
		place_infobar();
		update_infobar();
		place_lines_container();
		key_detection();
		resize_events();
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
	}

	function key_detection()
	{
		$(document).keyup(function(e)
		{
			var code = e.keyCode;

			if(code === 27)
			{
				if(focused.input.value === '')
				{
					remove_line();
				}

				else
				{
					clear_input(focused.input);
				}
			}
		});

		$(document).keydown(function(e)
		{
			if(msg.is_open())
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
					copy_input_down();
				}

				else
				{
					focus_next_or_add();
				}

			}

			else if(code === 8)
			{
				if(e.shiftKey)
				{
					clear_input(focused.input);
					e.preventDefault();
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
					add_input();
					e.preventDefault();
				}
			}

			else if(code === 191)
			{
				if(e.shiftKey && e.ctrlKey)
				{
					toggle_comment(focused.input);
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
		place_button(1, 'Right Click: 0.1 &nbsp;|&nbsp; Middle Click: 1/1');
		place_button(2, 'Right Click: 0.2 &nbsp;|&nbsp; Middle Click: 1/2');
		place_button(3, 'Right Click: 0.3 &nbsp;|&nbsp; Middle Click: 1/3');
		place_button(4, 'Right Click: 0.4 &nbsp;|&nbsp; Middle Click: 1/4');
		place_button(5, 'Right Click: 0.5 &nbsp;|&nbsp; Middle Click: 1/5');
		place_button(6, 'Right Click: 0.6 &nbsp;|&nbsp; Middle Click: 1/6');
		place_button(7, 'Right Click: 0.7 &nbsp;|&nbsp; Middle Click: 1/7');
		place_button(8, 'Right Click: 0.8 &nbsp;|&nbsp; Middle Click: 1/8');
		place_button(9, 'Right Click: 0.9 &nbsp;|&nbsp; Middle Click: 1/9');
		place_button(0, 'Right Click: 0. &nbsp;|&nbsp; Middle Click: 000');

		place_button('.');
		place_button(',');

		buttons_br();

		place_button('+');
		place_button('-');
		place_button('*');
		place_button('/', 'Right Click: Toggle Comment');
		place_button('(');
		place_button(')');
		place_button('^', 'Right Click: ^2 &nbsp;|&nbsp; Middle Click: ^3');
		place_button('sqrt', 'Right Click: Cube Root &nbsp;|&nbsp; Middle Click: nth Root');
		place_button('sin', 'Right Click: asin &nbsp;|&nbsp; Middle Click: asinh');
		place_button('cos', 'Right Click: acos &nbsp;|&nbsp; Middle Click: acosh');
		place_button('tan', 'Right Click: atan &nbsp;|&nbsp; Middle Click: atanh');
		place_button('pi', 'Right Click: phi &nbsp;|&nbsp; Middle Click: e');

		buttons_br();

		place_prog_buttons_area();

		buttons_br();

		place_button_wider('Up', 'Right Click: Move Line Up &nbsp;|&nbsp; Middle Click: Go To First Line');
		place_button_wider('Down', 'Right Click: Move Line Down &nbsp;|&nbsp; Middle Click: Go To Last Line');
		place_button_wider('New Line', 'Right Click: Add Line After &nbsp;|&nbsp; Middle Click: Add Line Before');
		place_button_wider('Remove Line', 'Requires Double Click &nbsp;|&nbsp; Right Click: Remove Last Line &nbsp;|&nbsp; Middle Click: Remove All Lines');
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

						else
						{
							focus_input(focused.input);
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
				hideOnClick: true,
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

		for(let i=0; i<12; i++)
		{
			var s = '';

			var prog = programs.items[i];

			var pt1 = '';
			var pt2 = '';

			var t1 = 'Primary';
			var t2 = 'Secondary';

			if(prog.primary.title !== '')
			{
				t1 = prog.primary.title;

				if(prog.primary.doubleclick)
				{
					pt1 = "Double ";
				}
			}

			if(prog.secondary.title !== '')
			{
				t2 = prog.secondary.title;

				if(prog.secondary.doubleclick)
				{
					pt2 = "Double ";
				}
			}

			s += pt1 + "Click: " + t1 + " &nbsp;|&nbsp; ";
			s += pt2 + "Right Click: " + t2 + " &nbsp;|&nbsp; ";
			s += 'Middle Click: Program';

			place_button_programmable(prog.name, s);
		}

		$('.button.programmable').each(function(i)
		{
			this.addEventListener('mouseup', function(event) 
			{
				prog_press(i, event);
			}, false);	
			
			tippy(this, 
			{
				delay: [1200, 100],
				animation: 'scale',
				hideOnClick: true,
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

	function remove_all_lines()
	{
		undefine_variables();
		
		$('#lines').html('');
		
		add_line();
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
				var result = math_fraction.eval(val + '*1', linevars);
			}

			else
			{
				var result = math_normal.eval(val + '*1', linevars);
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
		linevars[$(input).data('variable')] = val;
	}

	function improper_to_mixed(n, d)
	{
		i = parseInt(n / d);
		n -= i * d;
		return [i, n, d];
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

				var nsup = parseInt(sup);
				var nsub = parseInt(sub);

				if(options.mixed && nsup >= nsub)
				{
					var mixed = improper_to_mixed(nsup, nsub);

					var mwhole = mixed[0];

					if(mixed[1] !== 0 && mixed[2] !== 0)
					{
						sup = mixed[1];
						sub = mixed[2];
					}

					else
					{
						return format_result(mwhole, true);
					}
					
					return `<span class='resolved'><span class='mwhole'>${mwhole}</span><span class='fraction'><sup>${sup}</sup><sub>${sub}</sub></span></span>`;
				}

				else
				{
					return `<span class='resolved'><span class='fraction'><sup>${sup}</sup><sub>${sub}</sub></span></span>`;
				}
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
						return "0." + i;
					}

					else if(aux === 2)
					{
						return "1/" + i;
					}
				}
			}

			if(s == 0)
			{
				if(aux === 3)
				{
					return "0.";
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

			else if(s === "^")
			{
				if(aux === 3)
				{
					return "^2";
				}

				else if(aux === 2)
				{
					return "^3";
				}
			}

			else if(s === "sqrt(")
			{
				if(aux === 3)
				{
					return "cbrt(";
				}

				else if(aux === 2)
				{
					return "nthRoot(";
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

			else if(s === "/")
			{
				if(aux === 3)
				{
					toggle_comment(focused.input);
					return false;
				}
			}			

			else if(s === "Up")
			{
				if(aux === 3)
				{
					move_line_up();
					return false;
				}

				else if(aux === 2)
				{
					go_to_first_input();
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

				else if(aux === 2)
				{
					go_to_last_input();
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

				else if(aux === 2)
				{
					remove_all_lines();
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

				if(aux === 2)
				{
					format_all();
					return false;
				}
			}

			else if(s === "Erase")
			{
				if(aux === 3)
				{
					undo_change();
					return false;
				}

				else if(aux === 2)
				{
					redo_change();
					return false;
				}				
			}
		}

		return false;
	}

	function prog_press(key, e)
	{
		if(e.which === 2)
		{
			show_program_editor(key);
			return;
		}

		focus_if_isnt(focused.input);

		var prog = programs.items[key];

		if(prog !== undefined)
		{
			if(e.which === 1)
			{
				if(prog.primary.doubleclick)
				{
					if(e.detail % 2 !== 0)
					{
						return;
					}
				}

				execute_program(prog.primary.commands);
			}

			if(e.which === 3)
			{
				if(prog.secondary.doubleclick)
				{
					if(e.detail % 2 !== 0)
					{
						return;
					}
				}

				execute_program(prog.secondary.commands);
			}	
		}
	}

	function clear_input(input)
	{
		if(input.value === '')
		{
			return;
		}

		replace_text(input, '');
	}

	var update_results = (function() 
	{
		var timer; 
		return function() 
		{
			clearTimeout(timer);
			timer = setTimeout(function() 
			{
				do_update_results();
			}, 10);
		};
	})();

	function do_update_results()
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

		$(focused.input).css('border-width', '0.245em');
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

	function new_sheet()
	{
		remove_all_lines();
		edit_url('');		
	}

	function check_new_sheet()
	{
		var s = stringify_sheet();

		if(s.trim().replace(/@!#/g, '').length < 1)
		{
			new_sheet();
			return;
		}

		if(saved_content !== s)
		{
			var conf = confirm("This will discard all unsaved changes. Are you sure?");

			if(conf) 
			{
				new_sheet();
			}
		}

		else
		{
			new_sheet();
		}		
	}

	function title_click_events()
	{
		$('#lnk_new').click(function()
		{
			check_new_sheet();
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
			show_modal("You can't save an empty sheet.");
			return;
		}

		else if(s.length > 50000)
		{
			show_modal("Sheet is too big.");
			return;
		}

		save_enabled = false;

		$.post('/save_sheet/',
		{
			csrfmiddlewaretoken: csrf_token,
			content: s
		})

		.done(function(data)
		{
			on_save_response(data.response, s);
		})

		.fail(function(data)
		{
			show_modal('A network error occurred.');
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
			show_modal("You can't save an empty sheet.");
		}

		else if(response === 'toobig')
		{
			show_modal("Sheet is too big.");
		}

		else
		{
			var uparams = make_uparams(response);

			edit_url(uparams);

			var s = "";

			var url = site_root + uparams;

			s += url + "<br><br>";

			s += "<span id='ctcb' class='linky2'>Copy To Clipboard</span>";

			show_modal(s);

			play('done');

			$('#ctcb').click(function()
			{
				copy_to_clipboard(url);
				play('pup');
				msg.close();
			});

			add_to_saved(url, svd);

			saved_content = svd;
		}
	}

	function add_to_saved(url, svd)
	{
		if(saved === undefined)
		{
			saved = [];
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

		saved.items.unshift([dateFormat(Date.now(), "dddd, mmmm dS, yyyy, h:MM:ss TT"), url, num_lines, sample, options.fraction]);

		update_saved();
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
		s += "There are 12 programmable buttons that can be set to execute certain commands in order.<br><br>";
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
		s += "Shift + Backspace clears a line.<br><br>";
		s += "Control + Shift + / toggles line comments.<br><br>"
		s += "Clicking on a result copies the result to the clipboard.<br><br>";
		s += "Some buttons have other mapped functions. Hover the cursor over a button to see if it does.";

		about = s;
	}

	function show_about()
	{
		if(about === undefined)
		{
			create_about();
		}

		show_modal(about);
	}

	function msg_align_btns(alt=false)
	{
		if(alt)
		{
			$('#msgjs-container').find('.dialog_btn').each(function()
			{
				$(this).width($(this).outerWidth());
			});		
		}

		else
		{
			var w = 0;

			$('#msgjs-container').find('.dialog_btn').each(function()
			{
				w = Math.max(w, $(this).outerWidth());
			});

			$('#msgjs-container').find('.dialog_btn').each(function()
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

	function add_ans(next=false)
	{
		if(next)
		{
			var variable = $(focused.input).parent().next('.line').find('.input').data('variable');
		}

		else
		{
			var variable = $(focused.input).parent().prev('.line').find('.input').data('variable');
		}

		if(variable !== undefined)
		{
			press(variable);
		}
	}

	function add_result(next=false)
	{
		if(next)
		{
			var result = $(focused.input).parent().next('.line').find('.result')[0];
		}

		else
		{
			var result = $(focused.input).parent().prev('.line').find('.result')[0];
		}	

		if(result !== undefined)
		{
			press(get_result_text(result));
		}
	}

	function add_input(next=false)
	{
		if(next)
		{
			var value = $(focused.input).parent().next('.line').find('.input').val();
		}	

		else
		{
			var value = $(focused.input).parent().prev('.line').find('.input').val();
		}	

		if(value !== undefined && value !== '')
		{
			press(value);
		}
	}

	function show_more()
	{
		var s = "";

		s += "<span class='linky2' id='more_saved'>Saved</span><br><br><br>";
		
		s += "<span class='linky2' id='more_data'>Data</span><br><br><br>";

		s += "<span class='linky2' id='more_about'>About</span>";

		show_modal(s);

		msg_align_btns();

		$('#more_saved').click(function()
		{
			show_saved();
		});

		$('#more_data').click(function()
		{
			show_data_menu();
		});

		$('#more_about').click(function()
		{
			show_about();
		});
	}

	function show_options()
	{
		var s = "";

		s += "<div class='options_section'>";

		s += "<span class='options_item'>";

		s += "Add Commas<br><br>";

		if(options.commas)
		{
			s += "<input id='chk_commas' type='checkbox' checked>";
		}

		else
		{
			s += "<input id='chk_commas' type='checkbox'>";
		}

		s += "</span>";

		s += "<span class='options_hseparator'></span>";

		s += "<span class='options_item'>";
		
		s += "Mixed Fractions<br><br>";

		if(options.mixed)
		{
			s += "<input id='chk_mixed' type='checkbox' checked>";
		}

		else
		{
			s += "<input id='chk_mixed' type='checkbox'>";
		}

		s += "</span>";

		s += "</div>";

		s += "<div class='options_vseparator'></div>";		

		s += "<div class='options_section'>";

		s += "<span class='options_item'>";

		s += "Round Results<br><br>";

		if(options.round)
		{
			s += "<input id='chk_round' type='checkbox' checked>";
		}

		else
		{
			s += "<input id='chk_round' type='checkbox'>";
		}

		s += "</span>";

		s += "<span class='options_hseparator'></span>";

		s += "<span class='options_item'>";

		s += "Round Places<br><br>";

		s += "<select id='sel_round_places'>";

		for(let i=0; i<31; i++)
		{
			s += "<option value='" + i + "'>" + i + "</option>";
		}

		s += "</select>";

		s += "</span>";	

		s += "</div>";

		s += "<div class='options_vseparator'></div>";

		s += "<div class='options_section'>";

		s += "<span class='options_item'>";

		s += "Enable Sound<br><br>";

		if(options.sound)
		{
			s += "<input id='chk_sound' type='checkbox' checked>";
		}

		else
		{
			s += "<input id='chk_sound' type='checkbox'>";
		}

		s += "</span>";

		s += "<span class='options_hseparator'></span>";

		s += "<span class='options_item'>";	

		s += "Color Theme<br><br>";

		s += "<select id='sel_theme'>";

		for(let i=0; i<themes.length; i++)
		{
			s += "<option value='" + themes[i] + "'>" + capitalize_string(themes[i]) + "</option>";
		}

		s += "</select>";

		s += "</span>";

		s += "</div>";

		show_modal(s);

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

		$('#chk_mixed').change(function()
		{
			options.mixed = $(this).prop('checked');
			update_results();
			update_options();
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

	function get_local_storage()
	{
		get_options();
		get_saved();
		get_programs();
	}

	function update_options()
	{
		localStorage.setItem(ls_options, JSON.stringify(options));
	}

	function get_options()
	{
		options = JSON.parse(localStorage.getItem(ls_options));

		var mod = false;

		if(options === null)
		{
			options = {};
			mod = true;
		}

		if(options.version === undefined)
		{
			options.version = ls_options;
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
			options.round_places = 10;
			mod = true;
		}

		if(options.fraction === undefined)
		{
			options.fraction = false;
			mod = true;
		}

		if(options.mixed === undefined)
		{
			options.mixed = false;
			mod = true;
		}

		if(options.theme === undefined)
		{
			options.theme = 'lake';
			mod = true;
		}

		else
		{
			if(themes.indexOf(options.theme) === -1)
			{
				options.theme = 'lake';
				mod = true;
			}
		}

		if(mod)
		{
			update_options();
		}
	}

	function get_saved()
	{
		saved = JSON.parse(localStorage.getItem(ls_saved));

		var mod = false;

		if(saved === null)
		{
			saved = {};
			mod = true;
		}

		if(saved.version === undefined)
		{
			saved.version = ls_saved;
			mod = true;
		}

		if(saved.items === undefined)
		{
			saved.items = [];
			mod = true;
		}

		if(mod)
		{
			update_saved();
		}
	}

	function update_saved()
	{
		localStorage.setItem(ls_saved, JSON.stringify(saved));
	}

	function get_programs()
	{
		programs = JSON.parse(localStorage.getItem(ls_programs));

		var mod = false;

		if(programs === null)
		{
			programs = {};
			mod = true;
		}

		if(programs.version === undefined)
		{
			programs.version = ls_programs;
			mod = true;
		}

		if(programs.items === undefined)
		{
			programs.items = [];
			mod = true;
		}

		for(var i=0; i<12; i++)
		{
			if(programs.items[i] === undefined)
			{
				programs.items[i] = {}
				mod = true;
			}

			if(programs.items[i].name === undefined)
			{
				programs.items[i].name = 'F' + (i + 1);
				mod = true;
			}

			if(programs.items[i].primary === undefined)
			{
				programs.items[i].primary = {};
				mod = true;	
			}

			if(programs.items[i].primary.title === undefined)
			{
				programs.items[i].primary.title = '';
				mod = true;
			}

			if(programs.items[i].primary.commands === undefined)
			{
				programs.items[i].primary.commands = '';
				mod = true;
			}

			if(programs.items[i].primary.doubleclick === undefined)
			{
				programs.items[i].primary.doubleclick = false;
				mod = true;
			}

			if(programs.items[i].secondary === undefined)
			{
				programs.items[i].secondary = {};
				mod = true;	
			}

			if(programs.items[i].secondary.title === undefined)
			{
				programs.items[i].secondary.title = '';
			}

			if(programs.items[i].secondary.commands === undefined)
			{
				programs.items[i].secondary.commands = '';
				mod = true;
			}

			if(programs.items[i].secondary.doubleclick === undefined)
			{
				programs.items[i].secondary.doubleclick = false;
				mod = true;
			}
		}

		if(mod)
		{
			update_programs();
		}		
	}

	function update_programs()
	{
		localStorage.setItem(ls_programs, JSON.stringify(programs));
	}

	function show_saved(j=0)
	{
		if(saved.items.length === 0)
		{
			show_modal('Nothing saved yet.');
			return;
		}

		else
		{
			var s = "";
			
			var n = Math.min(20 + j, saved.items.length);

			for(var i=j; i<n; i++)
			{
				s += "<a class='ancher1' target=_blank href='" + saved.items[i][1] + "' title='" + saved.items[i][3] + "'>";
				
				s += saved.items[i][0];

				var num_lines = saved.items[i][2];
				
				s += "<br>" + num_lines;

				if(num_lines === 1)
				{
					s += " Line";
				}

				else
				{
					s += " Lines";
				}

				if(saved.items[i][4])
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

			if(n < saved.items.length)
			{
				s += "<br><br><div id='svd_load_more' class='linky3' data-j=" + n + ">Load More</div>";
			}

			if(j > 0)
			{
				$('#msg').append(s);
			}

			else
			{
				show_modal(s);
			}

			$('#svd_load_more').click(function()
			{
				var j = $(this).data('j');

				$(this).remove();

				show_saved(j);
			});
		}
	}

	function show_data_menu()
	{
		stor.menu();
	}

	function reset_object(ls_name, data=false)
	{
		if(ls_name === ls_options)
		{
			reset_options(data)
		}

		else if(ls_name === ls_saved)
		{
			reset_saved(data)
		}

		else if(ls_name === ls_programs)
		{
			reset_programs(data);
		}
	}

	function reset_options(data=false)
	{
		if(data)
		{
			localStorage.setItem(ls_options, data);
		}

		else
		{
			localStorage.removeItem(ls_options);
		}

		get_options();
		update_results();
		update_infobar();
		apply_theme(options.theme);
		apply_mode();
	}

	function reset_saved(data=false)
	{
		if(data)
		{
			localStorage.setItem(ls_saved, data);
		}

		else
		{
			localStorage.removeItem(ls_saved);
		}

		get_saved();
		saved_content = '';
	}

	function reset_programs(data=false)
	{
		if(data)
		{
			localStorage.setItem(ls_programs, data);
		}

		else
		{
			localStorage.removeItem(ls_programs);
		}

		get_programs();
		draw_prog_buttons();
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

	function get_result_text(el)
	{
		var s = "";

		if($(el).find('sup').length > 0)
		{
			if($(el).find('.mwhole').length > 0)
			{
				s += $(el).find('.mwhole').text() + ' ';
			}

			s += $(el).find('sup').text();

			s += "/";

			s += $(el).find('sub').text();
		}

		else
		{
			s += $(el).text().replace(/,/g, '');
		}

		return s;		
	}

	function on_result_click(el)
	{
		copy_to_clipboard(get_result_text(el));
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
			show_modal('Nothing to generate.');
			return;
		}

		s = s + c.substring(0, c.length - 8);

		c2 = c2.substring(0, c2.length - 1);

		show_modal(s);

		$('#ctcb').click(function()
		{
			copy_to_clipboard(c2);
			play('pup');
			msg.close();
		});		
	}

	function copy_input_down()
	{
		var og_var = $(focused.input).data('variable');
		var og_val = focused.input.value;

		focus_next_or_add();

		if(og_var !== $(focused.input).data('variable'))
		{
			replace_text(focused.input, og_val);
		}
	}

	function copy_result_down()
	{
		var og_var = $(focused.input).data('variable');
		var og_result = get_result_text($(focused.input).parent().find('.result')[0])

		focus_next_or_add();

		if(og_var !== $(focused.input).data('variable'))
		{
			replace_text(focused.input, og_result);
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
			val = math_normal.parse(val).toString({parenthesis: 'auto', implicit: 'show'});
		}

		catch(err)
		{
			play('nope');
			return;
		}

		replace_text(input, val);
	}

	function format_input(input)
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
			val = math_normal.parse(val).toString({parenthesis: 'auto', implicit: 'show'});
		}

		catch(err)
		{
			play('nope');
			return;
		}

		replace_text(input, val);
	}

	function format_all()
	{
		$('.input').each(function()
		{
			format_input(this);
		});
	}

	function insert_text(input, s)
	{
		focus_if_isnt(input);
		exec_insert(input, s);
	}

	function replace_text(input, s)
	{
		focus_if_isnt(input);
		input.select()
		exec_insert(input, s);
	}

	function exec_insert(input, s)
	{
		if(!document.execCommand('insertText', false, s))
		{
			var ss = input.selectionStart;
			var se = input.selectionEnd;
			var value = input.value;
			var sel = value.substring(ss, se);

			var ns = value.substring(0, ss) + s + value.substring(se, value.length);

			input.value = ns;

			input.setSelectionRange(ss + s.length, ss + s.length);
			
			update_results();
		}
	}

	function erase_character()
	{
		var ss = focused.input.selectionStart;
		var se = focused.input.selectionEnd;

		if(ss === se)
		{
			if(ss === 0)
			{
				focus_input(focused.input);
				return;
			}

			focused.input.setSelectionRange(ss - 1, ss);
		}

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

	function move_caret_to_start(input)
	{
		input.setSelectionRange(0, 0);
	}

	function show_program_editor(key)
	{
		var s = "";

		s += "<input maxlength='5' id='prog_key_name' class='prog_input prog_key_input'><br><br><br>";

		s += "<div id='prog_p_label' class='prog_label'>Primary Action Title</b2></div>";
		s += "<input type='text' id='prog_p_title' class='prog_input prog_input_smaller'></input>";

		s += "<br><br><br>";

		s += "<div class='prog_label'>Primary Action Commands</div>";
		s += "<input type='text' id='prog_p_commands' class='prog_input'></input>";
		s += "<div id='prog_p_commands_error' class='error_message'></div>"

		s += "<br><br><br>";

		s += "<div class='prog_label'>Require Double Click</div>";
		s += "<input type='checkbox' id='prog_p_dbl'>"

		s += "<br><br><br><br>";

		s += "<div id='prog_s_label' class='prog_label'>Secondary Action Title</div>";
		s += "<input type='text' id='prog_s_title' class='prog_input prog_input_smaller'></input>";

		s += "<br><br><br>";

		s += "<div class='prog_label'>Secondary Action Commands</div>";
		s += "<input type='text' id='prog_s_commands' class='prog_input'></input>";
		s += "<div id='prog_s_commands_error' class='error_message'></div>"

		s += "<br><br><br>";

		s += "<div class='prog_label'>Require Double Click</div>";
		s += "<input type='checkbox' id='prog_s_dbl'>"
		
		s += "<br><br><br>";

		s += "<span id='prog_save' class='linky2'>Save</span>";

		s += "<br><br><br><div class='prog_label'>Swap With</div>";

		s += "<select id='sel_prog_swap'>";

		s += "<option value='--'></option>";

		for(let i=0; i<programs.items.length; i++)
		{
			if(i === key)
			{
				s += "<option value='" + i + "' disabled>" + programs.items[i].name + "</option>";
			}

			else
			{
				s += "<option value='" + i + "'>" + programs.items[i].name + "</option>";
			}
		}

		s += "</select>";

		s += "<br><br><br><div class='prog_label'>Move To</div>";

		s += "<select id='sel_prog_move'>";

		s += "<option value='--'></option>";

		for(let i=0; i<programs.items.length; i++)
		{
			if(i === key)
			{
				s += "<option value='" + i + "' disabled>" + programs.items[i].name + "</option>";
			}

			else
			{
				s += "<option value='" + i + "'>" + programs.items[i].name + "</option>";
			} 
		}		

		s += "</select>";	

		s += "<br><br><br>";

		s += "<div class='prog_label underline'>Available Commands</div>";

		for(let i=0; i<commands.length; i++)
		{
			s += commands[i] + "<br>";
		}

		s += "<br><br>";

		s += "<div class='prog_label underline'>Examples</div>";
		s += "insert 34<br>";
		s += "insert pi<br>";
		s += "add line; insert cos(55)<br>";
		s += "go up; erase; format<br>";
		s += "insert 1; add line after; prev variable; insert + 2";

		show_modal(s);		

		var prog = programs.items[key];

		if(prog !== undefined)
		{
			$('#prog_key_name')[0].value = prog.name;

			$('#prog_p_title')[0].value = prog.primary.title;
			$('#prog_p_commands')[0].value = prog.primary.commands;

			$('#prog_s_title')[0].value = prog.secondary.title;
			$('#prog_s_commands')[0].value = prog.secondary.commands;

			$('#prog_p_dbl').prop('checked', prog.primary.doubleclick);
			$('#prog_s_dbl').prop('checked', prog.secondary.doubleclick);
		}

		$('#prog_save').click(function()
		{
			save_program(key, prog.name);
		});

		$('#sel_prog_swap').change(function()
		{
			prog_swap(key, parseInt(this.value));
		});	

		$('#sel_prog_move').change(function()
		{
			prog_move(key, parseInt(this.value));
		});

		$('.prog_input').keyup(function(e)
		{
			var code = e.keyCode;

			if(code === 13)
			{
				save_program(key, prog.name);
			}
		});
	}

	function prog_swap(index1, index2)
	{
		if(index2 !== '--' && index1 !== index2)
		{
			var temp = programs.items[index1];

			programs.items[index1] = programs.items[index2];
			programs.items[index2] = temp;

			msg.close();			
			draw_prog_buttons();
			update_programs();
		}
	}

	function prog_move(oldKey, newKey)
	{
		if(newKey !== '--' && oldKey !== newKey)
		{
			move_in_array(programs.items, oldKey, newKey);

			msg.close();
			draw_prog_buttons();
			update_programs();
		}		
	}

	function save_program(key, name)
	{
		var prog_key_name = $('#prog_key_name')[0].value.trim().replace(/\s+/g, '');

		var p_title = $('#prog_p_title')[0].value.trim().replace(/\s+/g, ' ');
		var p_commands = $('#prog_p_commands')[0].value.replace(/\s*;[;\s]*/g, '; ').replace(/\s+/g, ' ').replace(/^;+/, '').trim().replace(/;$/, '');
		var p_dbl = $('#prog_p_dbl').prop('checked');

		var s_title = $('#prog_s_title')[0].value.trim().replace(/\s+/g, ' ');
		var s_commands = $('#prog_s_commands')[0].value.replace(/\s*;[;\s]*/g, '; ').replace(/\s+/g, ' ').replace(/^;+/, '').trim().replace(/;$/, '');
		var s_dbl = $('#prog_s_dbl').prop('checked');

		if(prog_key_name === '')
		{
			prog_key_name = name;
			$('#prog_key_name')[0].value = name;
		}

		$('#prog_p_commands')[0].value = p_commands;
		$('#prog_s_commands')[0].value = s_commands;

		if(check_program(p_commands, s_commands))
		{
			msg.close();

			programs.items[key].name = prog_key_name;

			programs.items[key].primary.title = p_title;
			programs.items[key].primary.commands = p_commands;
			programs.items[key].primary.doubleclick = p_dbl;

			programs.items[key].secondary.title = s_title;
			programs.items[key].secondary.commands = s_commands;
			programs.items[key].secondary.doubleclick = s_dbl;

			draw_prog_buttons();
			update_programs();
		}

		else
		{
			play('nope');
		}
	}

	function check_program(p_commands, s_commands)
	{
		var ok = true;

		var response = execute_program(p_commands, false);
		
		if(response[0] !== 'ok')
		{
			$('#prog_p_commands_error').text('"' + response[1] + '" is not a valid command.').css('display', 'block');

			focus_command_error($('#prog_p_commands')[0], response);

			$('#msg').scrollTop($('#prog_p_label').offset().top - $('#msg').offset().top + $('#msg').scrollTop() - 10);
			
			ok = false;
		}

		else
		{
			$('#prog_p_commands_error').css('display', 'none');
		}

		response = execute_program(s_commands, false);

		if(response[0] !== 'ok')
		{
			$('#prog_s_commands_error').text('"' + response[1] + '" is not a valid command.').css('display', 'block');

			if(ok)
			{
				focus_command_error($('#prog_s_commands')[0], response);

				$('#msg').scrollTop($('#prog_s_label').offset().top - $('#msg').offset().top + $('#msg').scrollTop() - 10);
			}
			
			ok = false;
		}

		else
		{
			$('#prog_s_commands_error').css('display', 'none');
		}

		return ok;
	}

	function focus_command_error(input, response)
	{
		var indices = [];

		var str = input.value;

		for(var i=0; i<str.length;i++) 
		{
			if (str[i] === ";") indices.push(i);
		}

		if(indices.length === 0)
		{
			var index = 0;
		}

		else
		{
			if(response[2] === indices.length)
			{
				var index = input.value.length - response[1].length;
			}

			else
			{
				var index = indices[response[2]] - response[1].length;	
			}
		}

		if(index !== undefined)
		{
			input.setSelectionRange(index, index);
		}

		input.focus();		
	}	

	function execute_program(cmds, run=true)
	{
		if(cmds.length === 0)
		{
			return ["ok"];
		}

		var split = cmds.split(';');

		for(let i=0; i<split.length; i++)
		{
			var command = split[i].trim().replace(/\s+/g, ' ');

			if(command.length === 0)
			{
				continue;
			}

			if(command.indexOf(' ') !== -1)
			{
				var splt = command.split(' ');

				if(splt[0].toLowerCase() === 'insert')
				{
					if(run)
					{
						insert_text(focused.input, splt.slice(1).join(" "));
					}

					continue;
				}
			}

			if(commands.indexOf(command.toLowerCase()) !== -1)
			{
				if(run)
				{
					execute_command(command.toLowerCase());
				}
			}

			else
			{
				if(run)
				{
					show_execution_error(command);
				}

				return ["fail", command, i];
			}
		}

		return ["ok"];
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

		else if(command === "go to first line")
		{
			go_to_first_input();
		}

		else if(command === "go to last line")
		{
			go_to_last_input();
		}

		else if(command === "go to next empty line")
		{
			focus_next_or_add();
		}

		else if(command === "remove line")
		{
			remove_line();
		}

		else if(command === "remove last line")
		{
			remove_last_line();
		}

		else if(command === "remove all lines")
		{
			remove_all_lines();
		}

		else if(command === "prev variable")
		{
			add_ans();
		}

		else if(command === "prev input")
		{
			add_input();
		}

		else if(command === "next variable")
		{
			add_ans(true);
		}

		else if(command === "next input")
		{
			add_input(true);
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
			format_all();
		}

		else if(command === "expand")
		{
			expand_value(focused.input);
		}

		else if(command === "move caret to end")
		{
			move_caret_to_end(focused.input);
		}

		else if(command === "move caret to start")
		{
			move_caret_to_start(focused.input);
		}

		else if(command === "comment")
		{
			comment(focused.input);
		}

		else if(command === "comment all")
		{
			comment_all();
		}

		else if(command === "uncomment")
		{
			uncomment(focused.input);
		}

		else if(command === "uncomment all")
		{
			uncomment_all();
		}

		else if(command === "toggle comment")
		{
			toggle_comment(focused.input);
		}

		else if(command === "play done")
		{
			play('done');
		}

		else if(command === "play pup")
		{
			play('pup');
		}

		else if(command === "play nope")
		{
			play('nope');
		}
	}

	function go_to_first_input()
	{
		focus_input($('.input').first()[0]);
	}

	function go_to_last_input()
	{
		focus_input($('.input').last()[0]);
	}

	function show_execution_error(command)
	{
		var s = "";

		s += 'An error happened while executing "' + command + '".<br><br>';
		s += 'It is not a valid command.';

		show_modal(s);
	}

	function comment(input)
	{
		if(!input.value.trim().startsWith('//'))
		{
			replace_text(input, '// ' + input.value.trim());
		}
	}

	function comment_all()
	{
		$('.input').each(function()
		{
			comment(this);
		});
	}

	function uncomment(input)
	{
		if(input.value.trim().startsWith('//'))
		{
			replace_text(input, input.value.replace('//', '').trim());
		}
	}

	function uncomment_all()
	{
		$('.input').each(function()
		{
			uncomment(this);
		});
	}

	function toggle_comment(input)
	{
		if(!input.value.trim().startsWith('//'))
		{
			replace_text(input, '// ' + input.value.trim());
		}

		else
		{
			replace_text(input, input.value.replace('//', '').trim());
		}
	}

	function rename_key(obj, old_name, new_name) 
	{
		if (obj.hasOwnProperty(old_name)) 
		{
			obj[new_name] = obj[old_name];
			delete obj[old_name];
		}
	}

	function move_in_array(array, old_index, new_index)
	{
		while(old_index < 0) 
		{
			old_index += array.length;
		}

		while(new_index < 0) 
		{
			new_index += array.length;
		}

		if(new_index >= array.length) 
		{
			var k = new_index - array.length;

			while((k--) + 1) 
			{
				array.push(undefined);
			}
		}

		array.splice(new_index, 0, array.splice(old_index, 1)[0]);		
	}

	function on_object_modified(item)
	{
		try
		{
			var parsed = JSON.parse(item.value);

			if(parsed.version !== item.ls_name)
			{
				play('nope');
				alert("You're attempting to save an incompatible version.");
				return;
			}

			reset_object(item.ls_name, item.value);
			play('done');
		}

		catch(err)
		{
			play('nope');
			alert('There was an error parsing the JSON.\n\n' + err);
		}		
	}

	function init_msg_and_stor()
	{
		msg = Msg(
		{
			lock: false,
			clear_editables: true,
			window_x: "floating_right",
		});

		stor = StorageUI(
		{
			items:
			[
				{
					name: "Options Data",
					ls_name: ls_options,
					on_copied: function(item)
					{
						play('pup');
					},
					on_save: function(item)
					{
						on_object_modified(item);
					},
					on_reset: function(item)
					{
						reset_object(item.ls_name);
					}
				},
				{
					name: "Saved Data",
					ls_name: ls_saved,
					on_copied: function(item)
					{
						play('pup');
					},
					on_save: function(item)
					{
						on_object_modified(item);
					},
					on_reset: function(item)
					{
						reset_object(item.ls_name);
					}
				},
				{
					name: "Programs Data",
					ls_name: ls_programs,
					on_copied: function(item)
					{
						play('pup');
					},
					on_save: function(item)
					{
						on_object_modified(item);
					},
					on_reset: function(item)
					{
						reset_object(item.ls_name);
					}
				}
			],
			msg: msg,
			after_reset: function(list)
			{
				if(list.length > 0)
				{
					play('done');
				}
			}
		});
	}
	
	function show_modal(html)
	{
		msg.set_or_show(html);
	}

	return global;
}());