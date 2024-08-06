import React, { useState } from 'react';
import SettingsSection from './SettingsSection';
import TestMessageSection from './TestMessageSection';
import './Options.css';

const Options = () => {
  const [activeTab, setActiveTab] = useState('settings');

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
      {activeTab === 'settings' && <SettingsSection />}
      {activeTab === 'testMessage' && <TestMessageSection />}
    </div>
  );
};

export default Options;
