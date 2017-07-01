var letters = "abcdefghijklmnopqrstuvwxyz";
var $a,$b,$c,$d,$e,$f,$g,$h,$i,$j,$k,$l,$m,$n,$o,$p,$q,$r,$s,$t,$u,$v,$w,$x,$y,$z;

var msg_open = false;
var reference;
var about;
var site_root;
var save_enabled = true;
var ls_options = 'options_v2';

var focused = {
	input: null,
	caretpos: 0
}

function init()
{
	draw_buttons();
	place_lines_container();
	key_detection();
	resize_events();
	overlay_clicked();
	title_click_events();
	get_site_root();
	adjust_volumes();
	get_options();

	if(content === '')
	{
		add_line();
	}

	else
	{
		load_content();
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

				if($(focused.input).val() === '')
				{
					if($('.input').last()[0] === focused.input)
					{
						remove_last_line();
					}
				}

				else
				{
					clear_line(focused.input);
				}
			}
		}

		if($('.input').is(':focus'))
		{
			if(code === 37 || code === 39)
			{
				focused.caretpos = focused.input.selectionStart;
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
			if(e.shiftKey)
			{
				press($(focused.input).data('variable'));
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
			if(e.shiftKey)
			{
				add_ans();
				e.preventDefault();
			}
		}
	});
}

function draw_buttons()
{
	place_button(1, 'Context: 0.1, Middle: 1/1');
	place_button(2, 'Context: 0.2, Middle: 1/2');
	place_button(3, 'Context: 0.3, Middle: 1/3');
	place_button(4, 'Context: 0.4, Middle: 1/4');
	place_button(5, 'Context: 0.5, Middle: 1/5');
	place_button(6, 'Context: 0.6, Middle: 1/6');
	place_button(7, 'Context: 0.7, Middle: 1/7');
	place_button(8, 'Context: 0.8, Middle: 1/8');
	place_button(9, 'Context: 0.9, Middle: 1/9');
	place_button(0, 'Context: 00, Middle: 000');

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
	place_button('sqrt', 'Context: Cube Root');
	place_button('sin', 'Context: asin, Middle: asinh');
	place_button('cos', 'Context: acos, Middle: acosh');
	place_button('tan', 'Context: atan, Middle: atanh');
	place_button('pi');

	buttons_br();

	place_button_wider('Up', 'Context: Move Line Up');
	place_button_wider('Down', 'Context: Move Line Down');
	place_button_wider('New Line');
	place_button_wider('Remove Last');
	place_button_wider('Clear');
	place_button_wider('Erase');

	$('.button').each(function()
	{
		$(this).click(function()
		{
			press($(this).text());
		});

		$(this).on('auxclick', function(e)
		{
			press($(this).text(), e.which);
		});

		tippy(this, 
		{
			delay: [2000, 100],
			animation: 'scale',
			hideOnClick: false,
			duration: 100,
			arrow: true,
			performance: true,
			theme: 'transparent',
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

		if($(inp).val() === '')
		{
			focus_line(inp);
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

	var iterations = Math.floor(num_lines / letters.length);

	if(iterations > letters.length)
	{
		return;
	}

	if(iterations > 0)
	{
		var letter = letters[iterations - 1] + letters[num_lines - (iterations * letters.length)];
	}

	else
	{
		var letter = letters[num_lines];
	}

	if(!value)
	{
		value = '';
	}

	var s = `<div class='line'><button class='button variable'>$${letter}</button>`;
	s += `<input type='text' class='input' id='${letter}' value='${value}'><div class='result'></div></div>`;
	
	$('#lines').append(s);

	var input = $('.input').last();
	
	focused.input = input;

	$('.variable').last().click(function()
	{
		press('$' + letter);
	});

	$(input).click(function()
	{
		set_caretpos();
	});

	$(input).focus(function()
	{
		focused.input = this;
		set_caretpos();
		change_borders();
	});

	$(input).on('input', function()
	{
		focused.caretpos = this.selectionStart;
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

	$(input).data('variable', '$' + letter);
	
	focus_line(input);
}

function remove_last_line()
{
	if($('.line').length === 1)
	{
		return;
	}

	var line = $('.line').last()[0];

	var input = $('.input').last()[0];

	var val = $(input).val();

	if(input === focused.input)
	{
		$(line).prev('.line').find('.input').focus();
	}

	update_variable(input, undefined);

	$(line).remove();

	if(val !== '')
	{
		update_results();
	}
}

function reset_sheet()
{
	var conf = confirm("Are you sure you want to clear everything?");

	if(conf)
	{
		$a=$b=$c=$d=$e=$f=$g=$h=$i=$j=$k=$l=$m=$n=$o=$p=$q=$r=$s=$t=$u=$v=$w=$x=$y=$z = undefined;

		$('#lines').html('');

		add_line();
	}
}

function hide_plus()
{
	$('#plus').css('display', 'none');
}

function get_result(input)
{
	var result = $(input).next('.result');

	$(result).html('');

	try
	{
		var val = $(input).val();

		if(val.startsWith('//'))
		{
			show_comment(input);
			return;
		}

		if(val.length === 0)
		{
			update_variable(input, undefined);
			return;
		}

		var result = eval(val);

		if(isNaN(result))
		{
			show_error(input);
			return;
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
	update_variable(input, undefined);
	show_result(input, 'Error');
}

function show_comment(input)
{
	update_variable(input, undefined);
	show_result(input, 'Comment');
}

function show_result(input, s)
{
	$(input).next('.result').html(s);
}

function update_variable(input, val)
{
	window[$(input).data('variable')] = val;
}

function round(num, places) 
{
	if(!places)
	{
		return Math.round(num);
	}

	var val = Math.pow(10, places);
	return Math.round(num * val) / val;
}

function format_result(n)
{
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

	if(options.format)
	{
		whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	
	return `<span class='whole'>${whole}</span><span class='decimal'>${decimal}</span>`
}

function press(s, aux=false)
{
	if(s === "sin")
	{
		s = "Math.sin(";
	}

	else if(s === "cos")
	{
		s = "Math.cos(";
	}

	else if(s === "tan")
	{
		s = "Math.tan(";
	}

	else if(s === "pi")
	{
		s = "Math.PI";
	}

	else if(s === "pow")
	{
		s = "**";
	}

	else if(s === "sqrt")
	{
		s = "Math.sqrt(";
	}

	if(aux)
	{
		s = check_aux(s, aux);

		if(!s)
		{
			focus_line(focused.input);
			return;
		}
	}

	if(s === "Clear")
	{
		clear_line(focused.input);
		focus_line(focused.input);
		return;
	}

	else if(s === "Erase")
	{
		erase_character();
		focus_line(focused.input);
		return;
	}

	else if(s === "New Line")
	{
		focus_next_or_add();
		focus_line(focused.input);
		return;
	}

	else if(s === "Remove Last")
	{
		remove_last_line();
		focus_line(focused.input);
		return;
	}

	else if(s === "Up")
	{
		line_up();
		focus_line(focused.input);
		return;
	}

	else if(s === "Down")
	{
		line_down();
		focus_line(focused.input);
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

	var val = $(focused.input).val();

	var selstart = focused.input.selectionStart;
	var selend = focused.input.selectionEnd;

	if(selstart !== selend)
	{
		val = val.slice(0, selstart) + val.slice(selend);
	}
	
	var x = val.substr(0, focused.caretpos);
	var y = val.substring(focused.caretpos);

	var str = x + s + y;

	$(focused.input).val(x + s + y);

	val = $(focused.input).val();

	var caretpos = focused.caretpos + s.length;

	if(caretpos > val.length)
	{
		caretpos = val.length;
	}

	focused.caretpos = caretpos;

	move_caret();

	update_results();

	blur_focus();
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
				 return "00";
			}

			else if(aux === 2)
			{
				 return "000";
			}
		}

		else if(s == "Math.cos(")
		{
			if(aux === 3)
			{
				 return "Math.acos(";
			}

			else if(aux === 2)
			{
				 return "Math.acosh(";
			}
		}

		else if(s == "Math.tan(")
		{
			if(aux === 3)
			{
				 return "Math.atan(";
			}

			else if(aux === 2)
			{
				 return "Math.atanh(";
			}
		}

		else if(s == "Math.sin(")
		{
			if(aux === 3)
			{
				 return "Math.asin(";
			}

			else if(aux === 2)
			{
				 return "Math.asinh(";
			}
		}

		else if(s == "Math.sqrt(")
		{
			if(aux === 3)
			{
				 return "Math.cbrt(";
			}
		}

		else if(s == "Up")
		{
			if(aux === 3)
			{
				 move_line_up();
				 return false;
			}
		}

		else if(s == "Down")
		{
			if(aux === 3)
			{
				 move_line_down();
				 return false;
			}
		}
	}

	return false;
}

function clear_line(input)
{
	$(input).val('');

	if(input === focused.input)
	{
		focused.caretpos = 0;
	}

	focus_line(focused.input);

	update_results();
}

function update_results()
{
	var variables = {};

	$('.input').each(function()
	{
		var val = $(this).val();

		var v = $(this).data('variable');
		
		variables[v] = {};

		var vr = variables[v];
		
		vr.edges = [];
	});

	$('.input').each(function()
	{
		var v = $(this).data('variable');
		
		var val = $(this).val();

		if(val.trim() === '')
		{
			if(val.length > 0)
			{
				$(this).val('');

				if(this === focused.input)
				{
					focused.caretpos = 0;
				}
			}

			return true;
		}

		if(val.startsWith('//'))
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
					get_result($('#' + letter));
				}

				else
				{
					show_result($('#' + letter), 'Not Acyclical');					
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
		get_result($('#' + letter));
	}
}

function focus_line(input)
{
	$(input).focus();
}

function line_up()
{
	$(focused.input).parent().prev('.line').find('.input').focus();
	move_caret_to_end();
}

function line_down()
{
	$(focused.input).parent().next('.line').find('.input').focus();	
	move_caret_to_end();
}

function move_line_up()
{
	var index = $(focused.input).parent().index();

	if(index === 0)
	{
		return;
	}

	var inp = focused.input;

	ninp = $(inp).parent().prev('.line').find('.input')[0];

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
		this.value = this.value.replace(re, cnv);
		this.value = this.value.replace(re2, cv);
		this.value = this.value.replace(/@!#/g, '');
	});

	val = inp.value;
	nval = ninp.value;

	inp.value = nval;
	ninp.value = val;

	focused.input = ninp;

	update_results();

	blur_focus();
}

function move_line_down()
{
	var index = $(focused.input).parent().index();

	if(index === ($('.line').length - 1))
	{
		return;
	}

	var inp = focused.input;

	ninp = $(inp).parent().next('.line').find('.input')[0];

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
		this.value = this.value.replace(re, cnv);
		this.value = this.value.replace(re2, cv);
		this.value = this.value.replace(/@!#/g, '');
	});

	val = inp.value;
	nval = ninp.value;

	inp.value = nval;
	ninp.value = val;

	focused.input = ninp;

	update_results();

	blur_focus();
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
			focus_line($('.input').first()[0]);
		}

		else
		{
			$(focused.input).parent().next('.line').find('.input').focus();
		}
	}

	else
	{
		if(index === 0)
		{
			focus_line($('.input').last()[0]);
		}

		else
		{
			$(focused.input).parent().prev('.line').find('.input').focus();
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
	$('#lines_container').css('height', ($(window).height() - $('#title').outerHeight() - $('#buttons').outerHeight()) + 'px');
}

function set_caretpos()
{
	setTimeout(function()
	{
		focused.caretpos = focused.input.selectionStart;
	}, 10);
}

function move_caret() 
{
	var caretpos = focused.caretpos;
	var current_caret = focused.input.selectionStart;

	var distance = caretpos;

	if(distance === current_caret)
	{
		return;
	}

	if(focused.input.setSelectionRange) 
	{
		focus_line(focused.input);
		focused.input.setSelectionRange(distance, distance);
	} 

	else if(focused.input.createTextRange) 
	{
		var range = focused.input.createTextRange();
		range.collapse(true);
		range.moveEnd(distance);
		range.moveStart(distance);
		range.select();
	}
}

function move_caret_to_end()
{
	focused.caretpos = $(focused.input).val().length;
	move_caret();
}

function erase_character()
{
	var val = $(focused.input).val();

	if(val === '')
	{
		return;
	}

	var selstart = focused.input.selectionStart;
	var selend = focused.input.selectionEnd;

	if(selstart !== selend)
	{
		val = val.slice(0, selstart) + val.slice(selend);
		$(focused.input).val(val);
		focused.caretpos = selstart;

	}

	else
	{
		var x = val.substr(0, focused.caretpos - 1);
		var y = val.substring(focused.caretpos);

		$(focused.input).val(x + y);

		var caretpos = focused.caretpos - 1;

		if(caretpos < 0)
		{
			caretpos = 0;
		}

		focused.caretpos = caretpos;
	}

	move_caret();

	update_results();
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

function title_click_events()
{
	$('#lnk_new').click(function()
	{
		document.location = site_root;
	});	

	$('#lnk_save').click(function()
	{
		save_sheet();
	});	

	$('#lnk_reference').click(function()
	{
		show_reference();
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

	var content = stringify_sheet();

	if(content.trim().length < 1)
	{
		msg("You can't save an empty sheet.");
		return;
	}

	else if(content.length > 50000)
	{
		msg("Sheet is too big.");
		return;
	}

	save_enabled = false;

	$.post('/save_sheet/',
	{
		content: content,
	})

	.done(function(data)
	{
		on_save_response(data.response);
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

function on_save_response(response)
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
		play('pup');

		edit_url(response);

		var s = "";

		var url = site_root + response;

		s += url + "<br><br>";

		s += "<span class='linky2' onclick=\"copy_to_clipboard('" + url + "');hide_overlay()\">Copy To Clipboard</span>";

		msg(s);
	}
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

function edit_url(s)
{
	window.history.pushState({"pageTitle": "title", content: "etc"}, "", '/' + s);

}

function stringify_sheet()
{
	var s = "";

	$('.input').each(function()
	{
		s += $(this).val();
		s += "@!#";
	});

	s = s.substring(0, s.length - 3);

	return s;
}

function create_about()
{
	var s = "";

	s += "<b>Merkoba Calculator</b><br>";
	s += "Version " + version + "<br><br>";
	s += "This is a calculator that aims to empower users through a different workflow than what is found in most common calculator programs.<br><br>";
	s += "It's based around multiple \"lines\" of calculations which can be reused and edited anytime.<br><br>";
	s += "Calculations are done automatically in real time using topological sorting.<br><br>";
	s += "Since it needs to by acyclical, some variables can't be used in some places. For example you can't make $b depend on $a and $a depend on $b at the same time, since it can't be resolved.<br><br>";
	s += "Calculations are simply JavaScript. You have all the Math module at your disposal. Only certain common functions are available as buttons but you can type anything you want.<br><br>";
	s += "There's a reference popup with the Math constants and methods.<br><br>";
	s += "You can save a sheet for future use or sharing.<br><br><br>";

	s += "<span class='b2'>Shortcuts</span><br><br>";
	s += "Enter will focus the next available empty line or create a new one.<br><br>";
	s += "Shift + Enter does the same but also adds the previous line's variable into the new one.<br><br>";
	s += "Shift + Space adds the variable from the line above to the current line.<br><br>";
	s += "Up and Down arrows change the focus between lines.<br><br>";
	s += "Shift + Up and Shift + Down move the lines up or down.<br><br>";
	s += "Tab and Shift + Tab cycle the focus between lines.<br><br>";
	s += "Escape clears a line, removes the line if already cleared, or closes popups.<br><br>";
	s += "Constants and methods in the Reference will be added to the current line when clicked.<br><br>";
	s += "Some buttons have other mapped functions. Hover the cursor over a button to see if it does.";

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

	focus_line(focused.input);
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

function load_content()
{
	var splits = content.split('@!#');

	for(var i=0; i<splits.length; i++)
	{	
		var value = splits[i];

		add_line(value);
	}

	move_caret_to_end();

	update_results();
}

function create_reference()
{
	var s = "";

	s += "<b>Constants</b><br><br>";


	s += "<span class='refitem'>Math.E</span><br>";
	s += "Euler's constant and the base of natural logarithms, approximately 2.718.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.LN2</span><br>";
	s += "Natural logarithm of 2, approximately 0.693.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.LN10</span><br>";
	s += "Natural logarithm of 10, approximately 2.303.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.LOG2E</span><br>";
	s += "Base 2 logarithm of E, approximately 1.443.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.LOG10E</span><br>";
	s += "Base 10 logarithm of E, approximately 0.434.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.PI</span><br>";
	s += "Ratio of the circumference of a circle to its diameter, approximately 3.14159.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.SQRT1_2</span><br>";
	s += "Square root of 1/2; equivalently, 1 over the square root of 2, approximately 0.707.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.SQRT2</span><br>";
	s += "Square root of 2, approximately 1.414.";
	s += "<br><br>";


	s += "<br><b>Methods</b><br><br>";


	s += "<span class='refitem'>Math.abs(x)</span><br>";
	s += "Returns the absolute value of a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.acos(x)</span><br>";
	s += "Returns the arccosine of a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.acosh(x)</span><br>";
	s += "Returns the hyperbolic arccosine of a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.asin(x)</span><br>";
	s += "Returns the arcsine of a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.asinh(x)</span><br>";
	s += "Returns the hyperbolic arcsine of a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.atan(x)</span><br>";
	s += "Returns the arctangent of a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.atanh(x)</span><br>";
	s += "Returns the hyperbolic arctangent of a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.atan2(y, x)</span><br>";
	s += "Returns the arctangent of the quotient of its arguments.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.cbrt(x)</span><br>";
	s += "Returns the cube root of a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.ceil(x)</span><br>";
	s += "Returns the smallest integer greater than or equal to a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.clz32(x)</span><br>";
	s += "Returns the number of leading zeroes of a 32-bit integer.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.cos(x)</span><br>";
	s += "Returns the cosine of a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.cosh(x)</span><br>";
	s += "Returns the hyperbolic cosine of a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.exp(x)</span><br>";
	s += "Returns Ex, where x is the argument, and E is Euler's constant (2.718…), the base of the natural logarithm.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.expm1(x)</span><br>";
	s += "Returns subtracting 1 from exp(x).";
	s += "<br><br>";

	s += "<span class='refitem'>Math.floor(x)</span><br>";
	s += "Returns the largest integer less than or equal to a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.fround(x)</span><br>";
	s += "Returns the nearest single precision float representation of a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.hypot([x[, y[, …]]])</span><br>";
	s += "Returns the square root of the sum of squares of its arguments.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.imul(x, y)</span><br>";
	s += "Returns the result of a 32-bit integer multiplication.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.log(x)</span><br>";
	s += "Returns the natural logarithm (loge, also ln) of a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.log1p(x)</span><br>";
	s += "Returns the natural logarithm (loge, also ln) of 1 + x for a number x.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.log10(x)</span><br>";
	s += "Returns the base 10 logarithm of a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.log2(x)</span><br>";
	s += "Returns the base 2 logarithm of a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.max([x[, y[, …]]])</span><br>";
	s += "Returns the largest of zero or more numbers.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.min([x[, y[, …]]])</span><br>";
	s += "Returns the smallest of zero or more numbers.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.pow(x, y)</span><br>";
	s += "Returns base to the exponent power, that is, baseexponent.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.random()</span><br>";
	s += "Returns a pseudo-random number between 0 and 1.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.round(x)</span><br>";
	s += "Returns the value of a number rounded to the nearest integer.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.sign(x)</span><br>";
	s += "Returns the sign of the x, indicating whether x is positive, negative or zero.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.sin(x)</span><br>";
	s += "Returns the sine of a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.sinh(x)</span><br>";
	s += "Returns the hyperbolic sine of a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.sqrt(x)</span><br>";
	s += "Returns the positive square root of a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.tan(x)</span><br>";
	s += "Returns the tangent of a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.tanh(x)</span><br>";
	s += "Returns the hyperbolic tangent of a number.";
	s += "<br><br>";

	s += "<span class='refitem'>Math.trunc(x)</span><br>";
	s += "Returns the integral part of the number x, removing any fractional digits.";
	s += "<br><br>";

	reference = s;
}

function show_reference()
{
	if(reference === undefined)
	{
		create_reference();
	}

	msg(reference);

	$('.refitem').click(function()
	{
		var txt = $(this).text();

		if(txt.indexOf('(') !== -1)
		{
			var s = txt.split('(')[0] + '(';
		}

		else
		{
			var s = txt;
		}

		press(s);

		hide_overlay();
	});
}

function get_site_root()
{
	site_root = window.location.href.match(/^.*\//)[0];
}

function adjust_volumes()
{
	$('#nope')[0].volume = 0.7;
}

function add_ans()
{
	var variable = $(focused.input).parent().prev('.line').find('.input').data('variable');

	if(variable !== undefined)
	{
		press(variable);
	}
}

function show_more()
{
	var s = "";

	s += "<div class='linky2' id='more_options'>Options</div><br><br>";
	s += "<div class='linky2' id='more_about'>About</div>";

	msg(s);

	msg_align_btns();

	$('#more_options').click(function()
	{
		show_options();
	});

	$('#more_about').click(function()
	{
		show_about();
	});
}

function show_options()
{
	var s = "";

	s += "Format Results<br><br>";

	if(options.format)
	{
		s += "<input id='chk_format' type='checkbox' checked>";
	}

	else
	{
		s += "<input id='chk_format' type='checkbox'>";
	}
	s += "<br><br><br>Enable Sound<br><br>";

	if(options.sound)
	{
		s += "<input id='chk_sound' type='checkbox' checked>";
	}

	else
	{
		s += "<input id='chk_sound' type='checkbox'>";
	}

	msg(s);

	$('#chk_sound').change(function()
	{
		options.sound = $(this).prop('checked');
		update_options();
	});

	$('#chk_format').change(function()
	{
		options.format = $(this).prop('checked');
		update_options();
		update_results();
	});
}

function update_options()
{
	localStorage.setItem(ls_options, JSON.stringify(options));
}

function get_options()
{
	options = JSON.parse(localStorage.getItem(ls_options));

	if(options === null)
	{
		options = {sound: true, format: true};
		update_options();
	}
}

function fill_sheet()
{
	var n = 702 - $('.line').length;

	for(var i=0; i<701; i++)
	{
		add_line();
	}
}

function test1()
{
	fill_sheet();

	var s = "+3*45-56/(43**4)+Math.acosh(8.9)";

	$('.input').each(function()
	{
		$(this).val($(this).val() + s);

		$(this).parent().next('.line').find('.input').val($(this).data('variable'));
	});

	update_results();
}

function disable_context_menu(el)
{
	el.addEventListener('contextmenu', event => event.preventDefault());
}