from django.db import models

class Sheet(models.Model):
	uid = models.CharField(max_length=11, null=True, unique=True)
	content = models.TextField(max_length=3000, default='')
	date = models.DateTimeField()
