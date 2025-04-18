import React, { useState } from 'react';
import PatientList from './PatientList';
import Login from './Login';
import Register from './Register';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access'));
  const [isRegistering, setIsRegistering] = useState(false);

  if (isLoggedIn) return <PatientList />;

  return (
    <div className='maincontainer'>
 <div className="container">
 {isRegistering ? (
        <>
          <Register onRegister={() => setIsRegistering(false)} />
          <p>
            Already have an account? <button onClick={() => setIsRegistering(false)}>Login</button>
          </p>
        </>
      ) : (
        <>
          <Login onLogin={() => setIsLoggedIn(true)} />
          <p>
            Don't have an account? <button onClick={() => setIsRegistering(true)}>Register</button>
          </p>
        </>
      )}
 </div>
    </div>
  );
}

export default App;
