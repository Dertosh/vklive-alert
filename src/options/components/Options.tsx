import React, { useState, useEffect } from 'react';
import './Options.css';

const Options = () => {
  // States to hold the section name, uploaded file URL, sound setting, and volume
  const [sectionName, setSectionName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [disableSound, setDisableSound] = useState(false);
  const [volume, setVolume] = useState(50); // default volume set to 50%

  // New states for the test message inputs
  const [channel, setChannel] = useState('');
  const [user, setUser] = useState('');
  const [prizeName, setPrizeName] = useState('');
  const [cost, setCost] = useState('');
  const [context, setContext] = useState('');

  // Load settings from chrome.storage.local on component mount
  useEffect(() => {
    chrome.storage.local.get(['disableSound', 'volume', 'sectionName', 'soundUrl'], (result) => {
      setDisableSound(result.disableSound || false);
      setVolume(result.volume * 100 || 50);
      setSectionName(result.sectionName || '');
      setFileUrl(result.soundUrl || '');
    });
  }, []);

  // Function to handle the save settings event
  const handleSaveSettings = () => {
    if (true) {
      // Save the file URL, section name, disable sound setting, and volume to chrome.storage.local
      chrome.storage.local.set({
        soundUrl: fileUrl,
        sectionName: sectionName,
        disableSound: disableSound,
        volume: volume / 100
      }, () => {
        console.log('Settings saved to chrome.storage.local');
        alert('Settings have been saved.');
        // Send a message to the background script about the settings update
        let message = { type: 'USERSETTINGS_UPDATE', volume: volume / 100, disableSound: disableSound };

        chrome.runtime.sendMessage(message);
      });

      // Reset the input fields if needed
      // setFileUrl('');
      // setSectionName('');
    } else {
      alert('Please upload a sound file and enter a section name.');
    }
  };

  // Function to handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (fileReader.result) {
          setFileUrl(fileReader.result as string);
        }
      };
      fileReader.readAsDataURL(file);
    }
  };

  // Function to handle sending the test message
  const sendTestMessage = () => {
    console.log('Sending test message with the following details:');
    console.log('Channel:', channel);
    console.log('User:', user);
    console.log('Prize Name:', prizeName);
    console.log('Cost:', cost);
    console.log('Context:', context);
    // Implement your message sending logic here
  };

  return (
    <div className="container">
      {/* Existing sections */}
      <div className="settings-section">
        <h2>Sound Settings</h2>
        <div className="form-group">
          <label htmlFor="disableSound">Disable Sound:</label>
          <input
            type="checkbox"
            id="disableSound"
            checked={disableSound}
            onChange={(e) => setDisableSound(e.target.checked)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="volume">Volume:</label>
          <input
            type="range"
            id="volume"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            disabled={disableSound}
          />
          <span>{volume}%</span>
        </div>
        <button onClick={handleSaveSettings}>Save Settings</button>
      </div>

      {/* New section for sending test message */}
      <div className="test-message-section">
        <h2>Send Test Message</h2>
        <div className="form-group">
          <label htmlFor="channel">Channel:</label>
          <input
            type="text"
            id="channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="user">User:</label>
          <input
            type="text"
            id="user"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="prizeName">Prize Name:</label>
          <input
            type="text"
            id="prizeName"
            value={prizeName}
            onChange={(e) => setPrizeName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="cost">Cost:</label>
          <input
            type="text"
            id="cost"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="context">Context:</label>
          <input
            type="text"
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>
        <button onClick={sendTestMessage}>Send Test Message</button>
      </div>
    </div>
  );
};

export default Options;
