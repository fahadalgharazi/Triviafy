import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

function App() {
  const [buttonDisplayed, setButtonDisplayed] = useState(true)
  const [messageDisplayed, setMessageDisplayed] = useState(false)

  const handleButtonClick = () => {
    setButtonDisplayed(false)
    setMessageDisplayed(true)
  }

  return (
    <div className="App">
      <div>
        {buttonDisplayed && <button onClick={handleButtonClick}>Show Message</button>}
        {messageDisplayed && <p>Welcome to my basic React app! -Corey</p>}
      </div>
    </div>
  );
}

export default App;
