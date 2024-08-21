import React, { useState, useEffect } from 'react';

const App = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/backend.php')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error fetching message:', error));
  }, []);
  

  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
};

export default App;
