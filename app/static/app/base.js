var letters = "abcdefghijklmnopqrstuvwxyz";
var $a,$b,$c,$d,$e,$f,$g,$h,$i,$j,$k,$l,$m,$n,$o,$p,$q,$r,$s,$t,$u,$v,$w,$x,$y,$z;

var msg_open = false;
var reference;
var about;
var site_root;
var save_enabled = true;

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
	get_site_root();
	adjust_volumes();

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
		set_caretpos();
	});

	$(input).focus(function()
	{
		focused.input = this;
		set_caretpos();
		update_preval();
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
		var val = $(this).val();

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

		if(val === '')
		{
			return true;
		}

		if(val.startsWith('//'))
		{
			return true;
		}

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
	move_caret_to_end();
}

function line_down()
{
	$($(focused.input).parent().next('.line').find('.input')).focus();
	move_caret_to_end();
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

function move_caret_to_end()
{
	focused.caretpos = $(focused.input).val().length;
	move_caret();
}

function erase()
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

		move_caret();
	}

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

	$('#lnk_reference').click(function()
	{
		show_reference();
	});	

	$('#lnk_about').click(function()
	{
		show_about();
	});
}

function save_sheet()
{
	if(!save_enabled)
	{
		return;
	}

	var content = stringify_sheet();

	if(content.trim().length < 2)
	{
		msg("You can't save an empty sheet.");
		return;
	}

	else if(content.length > 20000)
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
		msg("Sheet is too big.")
	}

	else
	{
		edit_url(response)

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

function create_about()
{
	var s = ""

	s += "<b>Merkoba Calculator</b><br>";
	s += "Version " + version + "<br><br>";
	s += "This is a calculator that aims to empower users through a different workflow than what is found in most common calculator programs.<br><br>";
	s += "It's based around multiple \"lines\" of calculations which can be reused and edited anytime.<br><br>";
	s += "Calculations are done automatically in real time using topological sorting.<br><br>";
	s += "Since it needs to by acyclical, some variables can't be used in some places. For example you can't make $b depend on $a and $a depend on $b at the same time, since it can't be resolved.<br><br>";
	s += "Calculations are simply JavaScript. You have all the Math module at your disposal. Only certain common functions are available as buttons but you can type anything you want.<br><br>";
	s += "There's a reference popup with the Math constants and methods.<br><br>";
	s += "You can save a sheet for future use or sharing.";

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

	move_caret_to_end();

	update_results();
}

function create_reference()
{
	var s = "";

	s += "<b>Constants</b><br><br>";


	s += "<div class='refitem'>Math.E</div>";
	s += "Euler's constant and the base of natural logarithms, approximately 2.718.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.LN2</div>";
	s += "Natural logarithm of 2, approximately 0.693.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.LN10</div>";
	s += "Natural logarithm of 10, approximately 2.303.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.LOG2E</div>";
	s += "Base 2 logarithm of E, approximately 1.443.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.LOG10E</div>";
	s += "Base 10 logarithm of E, approximately 0.434.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.PI</div>";
	s += "Ratio of the circumference of a circle to its diameter, approximately 3.14159.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.SQRT1_2</div>";
	s += "Square root of 1/2; equivalently, 1 over the square root of 2, approximately 0.707.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.SQRT2</div>";
	s += "Square root of 2, approximately 1.414.";
	s += "<br><br>";


	s += "<br><b>Methods</b><br><br>";


	s += "<div class='refitem'>Math.abs(x)</div>"
	s += "Returns the absolute value of a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.acos(x)</div>"
	s += "Returns the arccosine of a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.acosh(x)</div>"
	s += "Returns the hyperbolic arccosine of a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.asin(x)</div>"
	s += "Returns the arcsine of a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.asinh(x)</div>"
	s += "Returns the hyperbolic arcsine of a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.atan(x)</div>"
	s += "Returns the arctangent of a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.atanh(x)</div>"
	s += "Returns the hyperbolic arctangent of a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.atan2(y, x)</div>"
	s += "Returns the arctangent of the quotient of its arguments.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.cbrt(x)</div>"
	s += "Returns the cube root of a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.ceil(x)</div>"
	s += "Returns the smallest integer greater than or equal to a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.clz32(x)</div>"
	s += "Returns the number of leading zeroes of a 32-bit integer.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.cos(x)</div>"
	s += "Returns the cosine of a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.cosh(x)</div>"
	s += "Returns the hyperbolic cosine of a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.exp(x)</div>"
	s += "Returns Ex, where x is the argument, and E is Euler's constant (2.718…), the base of the natural logarithm.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.expm1(x)</div>"
	s += "Returns subtracting 1 from exp(x).";
	s += "<br><br>";

	s += "<div class='refitem'>Math.floor(x)</div>"
	s += "Returns the largest integer less than or equal to a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.fround(x)</div>"
	s += "Returns the nearest single precision float representation of a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.hypot([x[, y[, …]]])</div>"
	s += "Returns the square root of the sum of squares of its arguments.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.imul(x, y)</div>"
	s += "Returns the result of a 32-bit integer multiplication.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.log(x)</div>"
	s += "Returns the natural logarithm (loge, also ln) of a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.log1p(x)</div>"
	s += "Returns the natural logarithm (loge, also ln) of 1 + x for a number x.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.log10(x)</div>"
	s += "Returns the base 10 logarithm of a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.log2(x)</div>"
	s += "Returns the base 2 logarithm of a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.max([x[, y[, …]]])</div>"
	s += "Returns the largest of zero or more numbers.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.min([x[, y[, …]]])</div>"
	s += "Returns the smallest of zero or more numbers.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.pow(x, y)</div>"
	s += "Returns base to the exponent power, that is, baseexponent.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.random()</div>"
	s += "Returns a pseudo-random number between 0 and 1.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.round(x)</div>"
	s += "Returns the value of a number rounded to the nearest integer.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.sign(x)</div>"
	s += "Returns the sign of the x, indicating whether x is positive, negative or zero.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.sin(x)</div>"
	s += "Returns the sine of a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.sinh(x)</div>"
	s += "Returns the hyperbolic sine of a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.sqrt(x)</div>"
	s += "Returns the positive square root of a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.tan(x)</div>"
	s += "Returns the tangent of a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.tanh(x)</div>"
	s += "Returns the hyperbolic tangent of a number.";
	s += "<br><br>";

	s += "<div class='refitem'>Math.trunc(x)</div>"
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