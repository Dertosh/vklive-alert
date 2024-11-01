import React, { useEffect, useRef, useState } from 'react';
import './Options.css';

interface SettingsProps {
  settings: {
    sectionName: string;
    fileUrl: string;
    disableSound: boolean;
    disableSoundMarked: boolean;
    disableMarkedMsg: boolean;
    volume: number;
    soundFileValue: string;
  };
  setSettings: React.Dispatch<React.SetStateAction<{
    sectionName: string;
    fileUrl: string;
    disableSound: boolean;
    disableSoundMarked: boolean;
    disableMarkedMsg: boolean;
    volume: number;
    soundFileValue: string;
  }>>;
}

const SettingsSection: React.FC<SettingsProps> = ({ settings, setSettings }) => {
  const { sectionName, fileUrl, disableSound, disableSoundMarked, disableMarkedMsg, volume, soundFileValue } = settings;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load settings from chrome.storage.local when the component mounts
  useEffect(() => {
    chrome.storage.local.get(['sectionName', 'soundUrl', 'disableSound', 'disableSoundMarked', 'disableMarkedMsg', 'volume', 'soundFileValue'], (result) => {
      setSettings({
        sectionName: result.sectionName || '',
        fileUrl: result.soundUrl || '',
        disableSound: result.disableSound || false,
        disableSoundMarked: result.disableSoundMarked || false,
        disableMarkedMsg: result.disableMarkedMsg || false,
        volume: result.volume ? result.volume * 100 : 50, // Stored volume is a decimal, so we scale it
        soundFileValue: result.soundFileValue || ''
      });
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
      disableSoundMarked: disableSoundMarked,
      disableMarkedMsg: disableMarkedMsg,
      volume: volume / 100,
      soundFileValue: soundFileValue
    }, () => {
      alert('Settings have been saved.');
      let message = { 
        type: 'USERSETTINGS_UPDATE', 
        volume: volume / 100, 
        disableSound: disableSound,
        disableSoundMarked: disableSoundMarked,
        disableMarkedMsg: disableMarkedMsg,
        customSound: fileUrl
      };
      chrome.runtime.sendMessage(message);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = e.target.value as string;
      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (fileReader.result) {
          const audioData = fileReader.result as string;
          setSettings({ ...settings, fileUrl: audioData, soundFileValue: fileName});
        }
      };
      fileReader.readAsDataURL(file); // Read file as base64
    }
  };

  const getFileName = () : string => {
    return typeof soundFileValue === "string" && soundFileValue.length > 0 ? soundFileValue.split("fakepath\\")[1] : "No custom audio"
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

  const handleResetAudio = () => {
    setSettings({ ...settings, fileUrl: "", soundFileValue: ""});
  };

  return (
    <div className="settings-section">
      <div className="form-group">
        <label htmlFor="disableMarkedMsg">Disable show Marked Message:</label>
        <input
          type="checkbox"
          id="disableMarkedMsg"
          checked={disableSoundMarked}
          onChange={(e) => setSettings({ ...settings, disableMarkedMsg: e.target.checked })}
        />
      </div>
      <div className="form-group">
        <label htmlFor="disableSoundMarked">Disable Sound for Marked Message:</label>
        <input
          type="checkbox"
          id="disableSoundMarked"
          checked={disableSoundMarked}
          onChange={(e) => setSettings({ ...settings, disableSoundMarked: e.target.checked })}
        />
      </div>
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
        <span className='text-description' style={{ marginLeft: '10px' }}>{volume}%</span>
      </div>
      <div className="form-group">
        <label htmlFor="fileUpload">Uploaded Custom Sound:</label>
        {fileUrl && (
          <button onClick={handlePlayAudio} style={{ marginRight: '10px' }}>
            {isPlaying ? 'Stop Audio' : 'Play Audio'}
          </button>
        )}
        <div className='text-description'>{getFileName()}</div>
        {fileUrl && (
          <button onClick={handleResetAudio} style={{ marginLeft: '10px' }}>
            Reset Audio
          </button>
        )}
        <audio ref={audioRef} src={fileUrl} />
      </div>
      <div className="form-group">
        <label htmlFor="fileUpload">Upload Sound File:</label>
        <input
          type="file"
          id="fileUpload"
          accept="audio/*"
          onChange={handleFileUpload}
        />
        <audio ref={audioRef} src={fileUrl} />
      </div>
      <button onClick={handleSaveSettings}>Save Settings</button>
    </div>
  );
};

export default SettingsSection;
