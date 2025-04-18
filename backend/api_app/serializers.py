from rest_framework import serializers
from .models import Patient  

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['patient_id', 'fname', 'lname', 'blood', 'image']  