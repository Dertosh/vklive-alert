import React, { useEffect, useRef, useState } from 'react';
import './Options.css';

interface SettingsProps {
  settings: {
    sectionName: string;
    fileUrl: string;
    disableSound: boolean;
    volume: number;
    soundFileValue: string;
  };
  setSettings: React.Dispatch<React.SetStateAction<{
    sectionName: string;
    fileUrl: string;
    disableSound: boolean;
    volume: number;
    soundFileValue: string;
  }>>;
}

const SettingsSection: React.FC<SettingsProps> = ({ settings, setSettings }) => {
  const { sectionName, fileUrl, disableSound, volume, soundFileValue } = settings;

  console.log('soundFileValue name:', soundFileValue);

  var fileUploadElement = document.getElementById('fileUpload') as HTMLInputElement;
  
  if(fileUploadElement && (!fileUploadElement.value || fileUploadElement.value.length == 0))
  {
    console.log("fileUpload", fileUploadElement.value)
    fileUploadElement.value = soundFileValue;
  }

  console.log('disableSound name:', disableSound);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load settings from chrome.storage.local when the component mounts
  useEffect(() => {
    chrome.storage.local.get(['sectionName', 'soundUrl', 'disableSound', 'volume', 'soundFileValue'], (result) => {
      setSettings({
        sectionName: result.sectionName || '',
        fileUrl: result.soundUrl || '',
        disableSound: result.disableSound || false,
        volume: result.volume ? result.volume * 100 : 50, // Stored volume is a decimal, so we scale it
        soundFileValue: result.soundFileValue || ''
      });
      console.log('local soundFileValue name:', soundFileValue);

    });

    // Reset play state when audio ends
    if (audioRef.current) {
      const handleEnded = () => setIsPlaying(false);
      audioRef.current.addEventListener('ended', handleEnded);
      return () => audioRef.current?.removeEventListener('ended', handleEnded);
    }
  }, [setSettings]);

  const handleSaveSettings = () => {
    console.log('soundFileValue name:', soundFileValue);
    chrome.storage.local.set({
      soundUrl: fileUrl,
      sectionName: sectionName,
      disableSound: disableSound,
      volume: volume / 100,
      soundFileValue: soundFileValue
    }, () => {
      alert('Settings have been saved.');
      let message = { 
        type: 'USERSETTINGS_UPDATE', 
        volume: volume / 100, 
        disableSound: disableSound,
        customSound: fileUrl
      };
      chrome.runtime.sendMessage(message);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = e.target.value as string;
      console.log('file name:', fileName);
      console.log('soundFileValue name:', soundFileValue);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (fileReader.result) {
          const audioData = fileReader.result as string;
          console.log('file name:', fileName);
          setSettings({ ...settings, fileUrl: audioData, soundFileValue: fileName});
          console.log('soundFileValue name:', soundFileValue);
        }
      };
      fileReader.readAsDataURL(file); // Read file as base64
    }
  };

  const getFileName = () : string => {
    console.log('getFileName soundFileValue name:', typeof soundFileValue, soundFileValue);
    return typeof soundFileValue === "string" && soundFileValue.length > 0 ? soundFileValue : ""
  }

  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.volume = volume / 100; // Set volume
        audioRef.current.play();
        setIsPlaying(true);
      }
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
      <div className="form-group">
        <label htmlFor="fileUpload">Upload Sound File:</label>
        <input
          type="file"
          id="fileUpload"
          accept="audio/*"
          onChange={handleFileUpload}
        />
        {fileUrl && (
          <button onClick={handlePlayAudio} style={{ marginLeft: '10px' }}>
            {isPlaying ? 'Stop Audio' : 'Play Audio'}
          </button>
        )}
        <audio ref={audioRef} src={fileUrl} />
      </div>
      <button onClick={handleSaveSettings}>Save Settings</button>
    </div>
  );
};

export default SettingsSection;
