var letters = "abcdefghijklmnopqrstuvwxyz";
var $a,$b,$c,$d,$e,$f,$g,$h,$i,$j,$k,$l,$m,$n,$o,$p,$q,$r,$s,$t,$u,$v,$w,$x,$y,$z;

var msg_open = false;
var site_root = 'http://calculator.merkoba.com/';
// var site_root = 'http://localhost:8000/';

var focused = {
	input: null,
	caretpos: 0,
	preval: ''
}

function init()
{
	draw_buttons();
	place_lines_container();
	key_detection();
	resize_events();
	overlay_clicked();
	title_click_events();

	$('#nope')[0].volume = 0.7;

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

		if(code === 13)
		{
			add_line();
		}

		else if(code === 38)
		{
			line_up();
		}

		else if(code === 40)
		{
			line_down();
		}

		else if(code === 27)
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
					remove_line(focused.input);
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
}

function draw_buttons()
{
	for(var i=0; i<10; i++)
	{
		place_button(i);
	}

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
	place_button('sqrt');
	place_button('sin');
	place_button('cos');
	place_button('tan');
	place_button('pi');

	buttons_br();

	place_button_wider('Up');
	place_button_wider('Down');
	place_button_wider('Add Line');
	place_button_wider('Remove Line');
	place_button_wider('Erase');
	place_button('Clear');
	place_button('Reset');

	$('.button').each(function()
	{
		$(this).click(function()
		{
			press($(this).html());
		});
	});
}

function place_button(i)
{
	var s = `<button class='button'>${i}</button>`;

	$('#buttons').append(s);
}

function place_button_wider(i)
{
	var s = `<button class='button wider'>${i}</button>`;

	$('#buttons').append(s);
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

function add_line(letter=false, value=false)
{
	var num_lines = $('.line').length;

	if(!letter)
	{
		var nextAll = $(focused.input).parent().nextAll('.line');

		var exit = false;

		$(nextAll).each(function()
		{
			var inp = $(this).find('.input');

			if($(inp).val() === '')
			{
				focus_line(inp);
				exit = true;
				return false;
			}
		});

		if(exit)
		{
			return;
		}

		for(var i=0; i<letters.length; i++)
		{
			if($('#' + letters[i]).length === 0)
			{
				var letter = letters[i];
				break;
			}
		}

		var value = '';
	}

	if((num_lines) >= letters.length)
	{
		return;
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
		focused.caretpos = this.selectionStart;
	});

	$(input).focus(function()
	{
		focused.input = this;
		focused.caretpos = this.selectionStart;
		update_preval();
		change_borders();
	});

	$(input).on('input', function()
	{
		focused.caretpos = this.selectionStart;
		update_results();
	});

	$(input).data('variable', '$' + letter);
	
	$('#lines_container').scrollTop(10000000000);

	$(input).focus();
}

function remove_line(input)
{
	if($('.line').length === 1)
	{
		return;
	}

	var id = $(input).attr('id');

	var prev = $($(input).parent().prev('.line'));

	if($(prev).length > 0)
	{
		$($(input).parent().prev('.line').find('.input')).focus();
	}

	else
	{
		$($(input).parent().next('.line').find('.input')).focus();
	}

	update_variable(input, undefined);

	var val = $(input).val();

	$('#' + id).parent().remove();

	if(val !== '')
	{
		update_results();
	}
}

function remove_all_lines()
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

		show_result(input, format(result));
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

function format(n)
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
	
	return `<span class='whole'>${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span><span class='decimal'>${decimal}</span>`
}

function press(s)
{
	focus_line(focused.input);

	if(s === "Clear")
	{
		clear_line(focused.input);
		return;
	}

	else if(s === "Erase")
	{
		erase();
		return;
	}

	else if(s === "Add Line")
	{
		add_line();
		return;
	}

	else if(s === "Remove Line")
	{
		remove_line(focused.input);
		return;
	}

	else if(s === "Reset")
	{
		remove_all_lines();
		return;
	}

	else if(s === "Up")
	{
		line_up();
		return;
	}

	else if(s === "Down")
	{
		line_down();
		return;
	}

	else if(s === "sin")
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

	var val = $(focused.input).val();

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
}

function clear_line(input)
{
	if($(input).val() !== '')
	{
		$(input).val('');
	}

	var result = $(input).next('.result');

	$(result).html('');

	update_variable(input, undefined);

	update_results(input);
}


function update_results(input)
{
	var variables = {};

	$('.input').each(function()
	{
		var v = $(this).data('variable');
		
		variables[v] = {};

		var vr = variables[v];
		
		vr.edges = [];
	});

	var vars = Object.keys(variables);

	$('.input').each(function()
	{
		var v = $(this).data('variable');
		
		var val = $(this).val();

		for(var i=0; i<vars.length; i++)
		{
			if(val.indexOf(vars[i]) !== -1)
			{
				variables[v].edges.push(vars[i]);
			}
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
			not_acyc();
			return;
		}

		if(n > 5000)
		{
			console.log('Exceeded Loop Limit');
			return;
		}
	}

	update_preval();

	for(var i=0; i<sorted.length; i++)
	{
		var letter = sorted[i].substring(1);

		get_result($('#' + letter));
	}
}

function update_preval()
{
	focused.preval = $(focused.input).val();
}

function not_acyc()
{
	console.log('Not Acyclic');

	$(focused.input).val(focused.preval);
	focused.caretpos = focused.input.selectionStart;

	play('nope');
}

function focus_line(input)
{
	$(input).focus();
}

function line_up()
{
	$($(focused.input).parent().prev('.line').find('.input')).focus();
}

function line_down()
{
	$($(focused.input).parent().next('.line').find('.input')).focus();
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
		focused.input.focus();
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

function erase()
{
	var val = $(focused.input).val();

	if(val === '')
	{
		return;
	}

	var x = val.substr(0, focused.caretpos - 1);
	var y = val.substring(focused.caretpos);

	$(focused.input).val(x + y);

	var caretpos = focused.caretpos - 1;

	if(caretpos < 0)
	{
		caretpos = 0;
	}

	focused.caretpos = caretpos;

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
	$('#' + what)[0].pause();
	$('#' + what)[0].currentTime = 0;
	$('#' + what)[0].play();
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

	$('#lnk_about').click(function()
	{
		show_about();
	});
}

function save_sheet()
{
	var content = stringify_sheet();

	if(content.length < 2)
	{
		msg("You can't save an empty sheet.");
	}

	else if(content.length > 3000)
	{
		msg("Sheet is too big.")
	}

	$.post('/save_sheet/',
	{
		content: content
	},
	function(data)
	{
		on_save_response(data)
	});
}

function on_save_response(data)
{
	if(data === 'empty')
	{
		msg("You can't save an empty sheet.");
	}

	else if(data === 'toobig')
	{
		msg("Sheet is too big.")
	}

	else
	{
		edit_url(data)

		var s = "";

		var url = site_root + data;


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
	play('pup');
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
		s += $(this).attr('id');
		s += $(this).val();
		s += "@!#";
	});

	s = s.substring(0, s.length - 3);

	return s;
}

function show_about()
{
	var s = ""

	s += "<b>Merkoba Calculator</b><br>";
	s += "Version " + version + "<br><br>";
	s += "This is a calculator that aims to empower users through a different workflow than what is found in most common calculator programs.<br><br>";
	s += "It's based around multiple \"lines\" of calculations which can be reused and edited anytime.<br><br>";
	s += "Calculations are done automatically in real time using topological sorting.<br><br>";
	s += "Since it needs to by acyclical, some variables can't be used in some places. For example you can't make $b depend on $a and $a depend on $b at the same time, since it can't be resolved.<br><br>";
	s += "Calculations are simply JavaScript. You have all the Math module at your disposal. Only certain common functions are available as buttons but you can type anything you want.<br><br>";
	s += "<a target='_blank' href='https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Math'>JavaScript Math Module Reference</a>";

	msg(s);
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

function load_content()
{
	var splits = content.split('@!#');

	for(var i=0; i<splits.length; i++)
	{	
		var line = splits[i];

		var letter = line[0];

		var inp = line.substr(1);

		add_line(letter, inp);
	}

	update_results();
}