// public/serviceWorker.ts

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
  });
  
  chrome.runtime.onMessageExternal.addListener((message, _sender, sendResponse) => {
    console.log('Message received in service worker:', message);
  
    if (message.type === 'BOT_CHAT_MESSAGE') {
      sendResponse({ response: "Service worker received the BOT_CHAT_MESSAGE" });
  
      if (!message.isBot) {
        return;
      }
  
      let textOut: string = "empty";
      let isPrize: boolean = false;
  
      message.messageData['data'].forEach((element: any) => {
        if (element.type === 'mention') {
          textOut += element.displayName;
          return;
        }
        if (element.type === 'text') {
          if (element.content === '') {
            return;
          }
          const localdata: string[] | null = JSON.parse(element.content);

          if(!localdata || localdata.length === 0)
          {
            return;
          }

          if (!isPrize && localdata[0] ? localdata[0].includes('получает награду'): false ) {
            isPrize = true;
          }
          textOut += textOut.length !== 0 ? " " : "";
          textOut += localdata[0];
        }
      });
  
      if (!isPrize) {
        return;
      }
  
      // Show an alert notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: message.iconURL,
        title: message.messageData['author']['displayName'],
        message: textOut
      });
  
      // Play the alert sound
      playAlertSound();
    }
  });
  
  // Function to play the alert sound
  function playAlertSound(): void {
    const audio = new Audio(chrome.runtime.getURL('alertSound.mp3'));
    audio.play();
  }
  
  // Adding export {} to make this file a module
  export {};
  