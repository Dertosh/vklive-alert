import React, { useState, useEffect } from 'react';
import './Options.css';

const Options = () => {
  // States to hold the section name, uploaded file URL, sound setting, and volume
  const [sectionName, setSectionName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [disableSound, setDisableSound] = useState(false);
  const [volume, setVolume] = useState(50); // default volume set to 50%

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
    if (/*fileUrl && sectionName.trim()*/ true) {
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
        let message = { type: 'USERSETTINGS_UPDATE', volume: volume / 100, disableSound: disableSound};

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

  return (
    <div className="container">
      {/* New section for the input fields */}
      {fileUrl && false && (<div className="new-sound-section">
        <input
          type="text"
          value={sectionName}
          onChange={(e) => setSectionName(e.target.value)}
          placeholder="Enter section name"
        />
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
        />
      </div>      )}

      {/* Display uploaded file URL for testing purposes */}
      {fileUrl && false && (
        <div>
          <p>Uploaded File URL: {fileUrl}</p>
          <audio controls src={fileUrl}></audio>
        </div>
      )}

      {/* New section for the settings */}
      <div className="settings-section">
        <label>
          <input
            type="checkbox"
            checked={disableSound}
            onChange={(e) => setDisableSound(e.target.checked)}
          />
          Disable Sound
        </label>
        <label>
          Volume:
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
          {volume}%
        </label>
        <button onClick={handleSaveSettings}>Save Settings</button>
      </div>
    </div>
  );
};

export default Options;
