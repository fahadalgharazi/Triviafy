import React, { useState, useEffect } from 'react';

const HelloWorld = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/backend.php') // Assuming PHP file is in the root directory
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

export default HelloWorld;
