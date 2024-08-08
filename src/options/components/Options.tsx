import React, { useState } from 'react';
import SettingsSection from './SettingsSection';
import TestMessageSection from './TestMessageSection';
import './Options.css';

const Options = () => {
  const [activeTab, setActiveTab] = useState('settings');

  // State to store input values
  const [settings, setSettings] = useState({
    sectionName: '',
    fileUrl: '',
    disableSound: false,
    volume: 50
  });

  const [testMessage, setTestMessage] = useState({
    channel: '',
    user: '',
    prizeName: '',
    cost: '',
    context: ''
  });

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="container">
      <div className="tabs">
        <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => handleTabClick('settings')}>
          Settings
        </button>
        <button className={activeTab === 'testMessage' ? 'active' : ''} onClick={() => handleTabClick('testMessage')}>
          Send Test Message
        </button>
      </div>
      {activeTab === 'settings' && (
        <SettingsSection
          settings={settings}
          setSettings={setSettings}
        />
      )}
      {activeTab === 'testMessage' && (
        <TestMessageSection
          testMessage={testMessage}
          setTestMessage={setTestMessage}
        />
      )}
    </div>
  );
};

export default Options;
