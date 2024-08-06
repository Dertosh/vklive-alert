import React, { useState, useEffect } from 'react';
import './Options.css';

const SettingsSection = () => {
  const [sectionName, setSectionName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [disableSound, setDisableSound] = useState(false);
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    chrome.storage.local.get(['disableSound', 'volume', 'sectionName', 'soundUrl'], (result) => {
      setDisableSound(result.disableSound || false);
      setVolume(result.volume * 100 || 50);
      setSectionName(result.sectionName || '');
      setFileUrl(result.soundUrl || '');
    });
  }, []);

  const handleSaveSettings = () => {
    if (true) {
      chrome.storage.local.set({
        soundUrl: fileUrl,
        sectionName: sectionName,
        disableSound: disableSound,
        volume: volume / 100
      }, () => {
        console.log('Settings saved to chrome.storage.local');
        alert('Settings have been saved.');
        let message = { type: 'USERSETTINGS_UPDATE', volume: volume / 100, disableSound: disableSound };
        chrome.runtime.sendMessage(message);
      });
    } else {
      alert('Please upload a sound file and enter a section name.');
    }
  };

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
  );
};

export default SettingsSection;
