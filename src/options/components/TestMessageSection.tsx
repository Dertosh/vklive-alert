import React, { useState } from 'react';
import './Options.css';

const TestMessageSection = () => {
  const [channel, setChannel] = useState('');
  const [user, setUser] = useState('');
  const [prizeName, setPrizeName] = useState('');
  const [cost, setCost] = useState('');
  const [context, setContext] = useState('');

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
  );
};

export default TestMessageSection;
