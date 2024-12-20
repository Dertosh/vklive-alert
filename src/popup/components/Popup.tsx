import React, { useEffect, useState } from 'react';

const Popup: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // Load sound file from Chrome storage

    // Listener for messages from the background script
    const messageListener = (message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
      console.log('Message received in popup:', message);
      setMessages(prevMessages => [...prevMessages, message.type]);
      alert(`New message received: ${message.type}`);
      sendResponse({ response: 'Popup received the message' });
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Cleanup the listener when the component is unmounted
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result) {
          const base64Sound = result.toString();
          chrome.storage.local.set({ alertSound: base64Sound }, () => {
            console.log("Audio uploaded");
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    chrome.runtime.sendMessage({ message: "Hello from Popup" }, response => {
      console.log(response);
    });
  };

  return (
    <div>
      <h1>Hello, Chrome Extension!</h1>
      <button onClick={handleClick}>Send Message</button>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default Popup;
