from django.db import models

class Patient(models.Model):
    patient_id = models.BigIntegerField(primary_key=True)
    fname =models.CharField(max_length=200)
    lname =models.CharField(max_length=200)
    blood = models.CharField(max_length=50)

    def __str__(self):
        return self.fname

