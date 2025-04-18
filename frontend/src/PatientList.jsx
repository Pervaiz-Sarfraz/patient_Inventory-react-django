import React, { useEffect, useState } from 'react';

function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [newPatient, setNewPatient] = useState({
    patient_id: '',
    fname: '',
    lname: '',
    blood: '',
    image: null,
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = () => {
    fetchWithAuth('http://127.0.0.1:8001/patients/')
      .then((response) => response.json())
      .then((data) => {
        setPatients(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching patients:', error);
        setLoading(false);
      });
  };

  const fetchWithAuth = async (url, options = {}) => {
    const access = localStorage.getItem('access');
    const refresh = localStorage.getItem('refresh');

    let headers = options.headers || {};

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    headers['Authorization'] = `Bearer ${access}`;

    let response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      const refreshResponse = await fetch('http://127.0.0.1:8001/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        localStorage.setItem('access', refreshData.access);
        headers['Authorization'] = `Bearer ${refreshData.access}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      } else {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }
    }

    return response;
  };

  const deletePatient = (id) => {
    fetchWithAuth(`http://127.0.0.1:8001/patients/${id}/`, { method: 'DELETE' })
      .then((response) => {
        if (response.ok) {
          setPatients(patients.filter((p) => p.patient_id !== id));
        } else {
          console.error('Failed to delete patient');
        }
      })
      .catch((error) => console.error('Error deleting patient:', error));
  };

  const editPatient = (patient) => {
    setNewPatient({ ...patient, image: null }); // reset image to null for edit
    setIsEditing(true);
    setEditingPatientId(patient.patient_id);
    setShowForm(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing
      ? `http://127.0.0.1:8001/patients/${editingPatientId}/`
      : 'http://127.0.0.1:8001/patients/';

    const formData = new FormData();
    formData.append('patient_id', newPatient.patient_id);
    formData.append('fname', newPatient.fname);
    formData.append('lname', newPatient.lname);
    formData.append('blood', newPatient.blood);
    if (newPatient.image) {
      formData.append('image', newPatient.image);
    }

    fetchWithAuth(url, {
      method,
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (isEditing) {
          setPatients((prev) =>
            prev.map((p) => (p.patient_id === editingPatientId ? data : p))
          );
        } else {
          setPatients((prev) => [...prev, data]);
        }
        resetForm();
      })
      .catch((err) => console.error('Submit error:', err));
  };

  const resetForm = () => {
    setNewPatient({
      patient_id: '',
      fname: '',
      lname: '',
      blood: '',
      image: null,
    });
    setShowForm(false);
    setIsEditing(false);
    setEditingPatientId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setNewPatient((prev) => ({
      ...prev,
      [name]: name === 'image' ? files[0] : name === 'patient_id' ? parseInt(value, 10) || '' : value,
    }));
  };

  if (loading) return <p>Loading...</p>;

  return (
<>
<button className='logout'>log out</button>
<div className="patient-list-container">
      <h1>Patient List</h1>
      <button className="add-patient-button" onClick={() => setShowForm(true)}>
        Add Patient
      </button>

      {showForm && (
        <div className="form-popup">
          <div className="form-popup-content">
            <h2>{isEditing ? 'Edit Patient' : 'Add New Patient'}</h2>
            <form onSubmit={handleFormSubmit}>
              <label htmlFor="patient_id">Patient ID:</label>
              <input
                type="number"
                name="patient_id"
                value={newPatient.patient_id}
                onChange={handleInputChange}
                required
                disabled={isEditing}
              />
              <label htmlFor="fname">First Name:</label>
              <input
                type="text"
                name="fname"
                value={newPatient.fname}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="lname">Last Name:</label>
              <input
                type="text"
                name="lname"
                value={newPatient.lname}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="blood">Blood Group:</label>
              <input
                type="text"
                name="blood"
                value={newPatient.blood}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="image">Patient Image:</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleInputChange}
              />
              <div className="form-buttons">
                <button type="submit">{isEditing ? 'Update' : 'Submit'}</button>
                <button type="button" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="patient-table">
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Profile</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Blood Group</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.patient_id}>
              <td>{p.patient_id}</td>
              <td>
                {p.image ? (
                  <img
                    src={typeof p.image === 'string' ? p.image : URL.createObjectURL(p.image)}
                    alt="Patient"
                    width="100"
                  />
                ) : (
                  'N/A'
                )}
              </td>
              <td>{p.fname}</td>
              <td>{p.lname}</td>
              <td>{p.blood}</td>
              <td>
                <button className='edit-button' onClick={() => editPatient(p)}>Edit</button>
                <button className='delete-button' onClick={() => deletePatient(p.patient_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
</>
  );
}

export default PatientList;