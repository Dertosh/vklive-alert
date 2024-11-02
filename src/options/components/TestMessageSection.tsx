import React, { useState } from 'react';
import './Options.css';

const botMessageTemplate = {
  "isPrivate": false,
  "flags": {
      "isParentDeleted": false,
      "isFirstMessage": false
  },
  "parent": null,
  "user": {
      "name": "ChatBot",
      "nick": "ChatBot",
      "hasAvatar": true,
      "profileLinks": [],
      "isChatModerator": false,
      "createdAt": 1670417487,
      "id": 12529926,
      "nickColor": 1,
      "isVerifiedStreamer": false,
      "isOwner": false,
      "isChannelModerator": false,
      "badges": [
          {
              "mediumUrl": "https://images.live.vkplay.ru/badge/7447a8b2-78ef-41a1-b0ce-d4ef23ca0f39/icon/size/medium?change_time=1670416365",
              "id": "7447a8b2-78ef-41a1-b0ce-d4ef23ca0f39",
              "largeUrl": "https://images.live.vkplay.ru/badge/7447a8b2-78ef-41a1-b0ce-d4ef23ca0f39/icon/size/large?change_time=1670416365",
              "smallUrl": "https://images.live.vkplay.ru/badge/7447a8b2-78ef-41a1-b0ce-d4ef23ca0f39/icon/size/small?change_time=1670416365",
              "isCreated": true,
              "name": "",
              "achievement": {
                  "name": "internal_chatbot",
                  "type": "blog_control"
              }
          }
      ],
      "avatarUrl": "https://images.live.vkplay.ru/user/12529926/avatar?change_time=1670417698",
      "roles": [],
      "vkplayProfileLink": "",
      "displayName": "ChatBot"
  },
  "author": {
      "isOwner": false,
      "isChannelModerator": false,
      "avatarUrl": "https://images.live.vkplay.ru/user/12529926/avatar?change_time=1670417698",
      "roles": [],
      "vkplayProfileLink": "",
      "displayName": "ChatBot",
      "badges": [
          {
              "mediumUrl": "https://images.live.vkplay.ru/badge/7447a8b2-78ef-41a1-b0ce-d4ef23ca0f39/icon/size/medium?change_time=1670416365",
              "id": "7447a8b2-78ef-41a1-b0ce-d4ef23ca0f39",
              "largeUrl": "https://images.live.vkplay.ru/badge/7447a8b2-78ef-41a1-b0ce-d4ef23ca0f39/icon/size/large?change_time=1670416365",
              "isCreated": true,
              "smallUrl": "https://images.live.vkplay.ru/badge/7447a8b2-78ef-41a1-b0ce-d4ef23ca0f39/icon/size/small?change_time=1670416365",
              "name": "",
              "achievement": {
                  "type": "blog_control",
                  "name": "internal_chatbot"
              }
          }
      ],
      "id": 12529926,
      "createdAt": 1670417487,
      "isVerifiedStreamer": false,
      "nickColor": 1,
      "profileLinks": [],
      "hasAvatar": true,
      "nick": "ChatBot",
      "isChatModerator": false,
      "name": "ChatBot"
  },
  "id": 109195267,
  "threadId": null,
  "styles": [""],
  "createdAt": 1721748075,
  "data": [
      {
          "displayName": "TestUser",
          "nick": "TestUser",
          "nickColor": "0",
          "name": "TestUser",
          "type": "mention",
          "blogUrl": null,
          "id": 12173852
      },
      {
          "type": "text",
          "modificator": "",
          "content": ""
      },
      {
          "type": "text",
          "content": "[\"\\n\",\"unstyled\",[]]",
          "modificator": ""
      },
      {
          "modificator": "",
          "content": "[\"Text\",\"unstyled\",[]]",
          "type": "text"
      },
      {
          "type": "text",
          "modificator": "BLOCK_END",
          "content": ""
      },
      {
          "content": "",
          "modificator": "BLOCK_END",
          "type": "text"
      }
  ]
}


interface TestMessageProps {
  testMessage: {
    channel: string;
    user: string;
    prizeName: string;
    cost: string;
    context: string;
    markedMsg: boolean;
  };
  setTestMessage: React.Dispatch<React.SetStateAction<{
    channel: string;
    user: string;
    prizeName: string;
    cost: string;
    context: string;
    markedMsg: boolean;
  }>>;
}

const TestMessageSection: React.FC<TestMessageProps> = ({ testMessage, setTestMessage }) => {
  const { channel, user, prizeName, cost, context, markedMsg } = testMessage;

  const sendTestMessage = () => {
    // Send the message to the background script
    let messageData = botMessageTemplate;

    messageData.data[0].displayName = user;
    let prizeTitle = "получает награду: " + prizeName + " (1 раз) за " + cost;
    messageData.data[1].content = markedMsg ? "" : JSON.stringify([prizeTitle,"unstyled",[]]);

    messageData.data[3].content = JSON.stringify([context,"unstyled",[]]);

    messageData.styles = markedMsg ? ["marked"] : []; 

    let message = {
      type: 'BOT_CHAT_MESSAGE',
      messageData: messageData,
      iconURL: "",
      isBot: !markedMsg,
      channel: channel
    };
    chrome.runtime.sendMessage(message);

    console.log('Sending test message with the following details:');
    console.log('Channel:', channel);
    console.log('User:', user);
    console.log('Prize Name:', prizeName);
    console.log('Cost:', cost);
    console.log('Context:', context);
    console.log('Marked message:', markedMsg);
  };

  return (
    <div className="test-message-section">
      <div className="form-group">
        <label htmlFor="markedMsg">Marked message:</label>
        <input
          type="checkbox"
          id="markedMsg"
          //value={markedMsg}
          checked={markedMsg}
          onChange={(e) => setTestMessage({ ...testMessage, markedMsg: e.target.checked })}
        />
      </div>
      <div className="form-group">
        <label htmlFor="channel">Channel:</label>
        <input
          type="text"
          id="channel"
          value={channel}
          onChange={(e) => setTestMessage({ ...testMessage, channel: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label htmlFor="user">User:</label>
        <input
          type="text"
          id="user"
          value={user}
          onChange={(e) => setTestMessage({ ...testMessage, user: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label htmlFor="prizeName">Prize Name:</label>
        <input
          type="text"
          id="prizeName"
          value={prizeName}
          onChange={(e) => setTestMessage({ ...testMessage, prizeName: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label htmlFor="cost">Cost:</label>
        <input
          type="number"
          id="cost"
          value={cost}
          onChange={(e) => setTestMessage({ ...testMessage, cost: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label htmlFor="context">Context:</label>
        <input
          type="text"
          id="context"
          value={context}
          onChange={(e) => setTestMessage({ ...testMessage, context: e.target.value })}
        />
      </div>
      <button onClick={sendTestMessage}>Send Test Message</button>
    </div>
  );
};

export default TestMessageSection;
