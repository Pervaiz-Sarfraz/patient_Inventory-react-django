import React, { useEffect, useState } from 'react';
import './PatientList.css'; 

function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); 
  const [newPatient, setNewPatient] = useState({ patient_id: '', fname: '', lname: '', blood: '' });

  useEffect(() => {
    fetch('http://127.0.0.1:8000/patient/')
      .then((response) => response.json())
      .then((data) => {
        setPatients(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching patients:', error);
        setLoading(false);
      });
  }, []);

  const deletePatient = (id) => {
    fetch(`http://127.0.0.1:8000/patient/${id}/`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          setPatients(patients.filter((patient) => patient.patient_id !== id));
        } else {
          console.error('Failed to delete patient');
        }
      })
      .catch((error) => console.error('Error deleting patient:', error));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    fetch('http://127.0.0.1:8000/patient/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPatient),
    })
      .then((response) => response.json())
      .then((data) => {
        setPatients([...patients, data]);
        setShowForm(false);
        setNewPatient({ patient_id: '', fname: '', lname: '', blood: '' }); // Reset form data
      })
      .catch((error) => console.error('Error adding patient:', error));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatient({
      ...newPatient,
      [name]: name === 'patient_id' ? parseInt(value, 10) || '' : value, 
    });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="patient-list-container">
      <h1>Patient List</h1>
      <button className="add-patient-button" onClick={() => setShowForm(true)}>
        Add Patient
      </button>
      {showForm && (
        <div className="form-popup">
          <div className="form-popup-content">
            <h2>Add New Patient</h2>
            <form onSubmit={handleFormSubmit}>
              <label htmlFor="patient_id">Patient ID:</label>
              <input
                type="number"
                id="patient_id"
                name="patient_id"
                value={newPatient.patient_id}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="fname">First Name:</label>
              <input
                type="text"
                id="fname"
                name="fname"
                value={newPatient.fname}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="lname">Last Name:</label>
              <input
                type="text"
                id="lname"
                name="lname"
                value={newPatient.lname}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="blood">Blood Group:</label>
              <input
                type="text"
                id="blood"
                name="blood"
                value={newPatient.blood}
                onChange={handleInputChange}
                required
              />
              <div className="form-buttons">
                <button type="submit" className="submit-button">Submit</button>
                <button type="button" className="cancel-button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <table className="patient-table">
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Blood Group</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient, index) => (
            <tr key={patient.patient_id ? patient.patient_id : `patient-${index}`}>
              <td>{patient.patient_id}</td>
              <td>{patient.fname || 'Unknown'}</td>
              <td>{patient.lname || 'Unknown'}</td>
              <td>{patient.blood || 'Unknown'}</td>
              <td>
                <button className="delete-button" onClick={() => deletePatient(patient.patient_id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PatientList;