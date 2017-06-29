import os
import random
import string
import datetime
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render
from app.models import *

root = os.path.dirname(os.path.dirname(__file__))

html_escape_table = {
	"&": "&amp;",
	'"': "\&quot;",
	"'": "&#39;",
	">": "&gt;",
	"<": "\&lt;",
	}

html_escape_table2 = {
	"&": "&amp;",
	'"': "&quot;",
	"'": "&#39;",
	">": "&gt;",
	"<": "&lt;",
	}

def html_escape(text):
	return "".join(html_escape_table.get(c,c) for c in text)
	
def html_escape2(text):
	return "".join(html_escape_table2.get(c,c) for c in text)

def log(s):
	with open(root + '/log', 'a') as log:
		log.write(str(s) + '\n\n')

def random_alpha(n):
	return ''.join(random.choice(string.ascii_letters + string.digits) for x in range(n))

def now():
	return datetime.datetime.now()

def main(request):

	if request.method == 'POST':
		pass

	c = {}

	c['content'] = ''

	return render(request, 'index.html', c)

def load_sheet(request, uid):

	sheet = Sheet.objects.get(uid=uid)

	c = {}

	c['content'] = sheet.content

	return render(request, 'index.html', c)

@csrf_exempt
def save_sheet(request):

	if request.method == 'POST':

		content = request.POST.get('content', '')

		if len(content) < 2:
			return HttpResponse('empty')

		if len(content) > 3000:
			return HttpResponse('toobig')

		else:
			sheet = Sheet(content=content, date=now())
			sheet.uid = random_alpha(8)
			success = False
			failures = 0

			while not success:
				try:
					sheet.save()
				except IntegrityError:
					failures += 1
					if failures > 500:
						raise
					else:
						sheet.uid = random_alpha(9)
				else:
					success = True

			return HttpResponse(sheet.uid)

