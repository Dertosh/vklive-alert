import React, { useEffect } from 'react';
import './Options.css';

interface SettingsProps {
  settings: {
    sectionName: string;
    fileUrl: string;
    disableSound: boolean;
    volume: number;
  };
  setSettings: React.Dispatch<React.SetStateAction<{
    sectionName: string;
    fileUrl: string;
    disableSound: boolean;
    volume: number;
  }>>;
}

const SettingsSection: React.FC<SettingsProps> = ({ settings, setSettings }) => {
  const { sectionName, fileUrl, disableSound, volume } = settings;

  // Load settings from chrome.storage.local when the component mounts
  useEffect(() => {
    chrome.storage.local.get(['sectionName', 'soundUrl', 'disableSound', 'volume'], (result) => {
      setSettings({
        sectionName: result.sectionName || '',
        fileUrl: result.soundUrl || '',
        disableSound: result.disableSound || false,
        volume: result.volume ? result.volume * 100 : 50 // Stored volume is a decimal, so we scale it
      });
    });
  }, [setSettings]);

  const handleSaveSettings = () => {
    chrome.storage.local.set({
      soundUrl: fileUrl,
      sectionName: sectionName,
      disableSound: disableSound,
      volume: volume / 100
    }, () => {
      alert('Settings have been saved.');
      let message = { type: 'USERSETTINGS_UPDATE', volume: volume / 100, disableSound: disableSound };
      chrome.runtime.sendMessage(message);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (fileReader.result) {
          setSettings({ ...settings, fileUrl: fileReader.result as string });
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
          onChange={(e) => setSettings({ ...settings, disableSound: e.target.checked })}
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
          onChange={(e) => setSettings({ ...settings, volume: Number(e.target.value) })}
          disabled={disableSound}
        />
        <span>{volume}%</span>
      </div>
      <button onClick={handleSaveSettings}>Save Settings</button>
    </div>
  );
};

export default SettingsSection;
