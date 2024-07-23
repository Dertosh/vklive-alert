// public/serviceWorker.js

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

function appendTextToBody(text) {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.executeScript(tab.id, {"code" : '$("body").append("vkPlayAlertId : "'+chrome.runtime.id+');'}) ;
  });
}

// function check(tab_id, data, tab){
//     if(tab.url != undefined && tab.url.indexOf("live.vkplay.ru") > -1){
//         chrome.tabs.executeScript(tab_id, {"code" : '$("body").append("vklivealertid : "'+text+');'}) ;
//     }
// };
// chrome.tabs.onUpdated.addListener(check);

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log('Message received in service worker:', message);

  if (message.type === 'BOT_CHAT_MESSAGE') {
    // Handle the message and send a response
    sendResponse({ response: "Service worker received the BOT_CHAT_MESSAGE" });

    if(!message.isBot)
    {
      return;
    }

    var text = "empty"
    // if(!message.isBot)
    // {
    //   text = message.messageData[0]['content'];
    // }
    // else
    {
      text = ""
      isPrize = false;
      message.messageData['data'].forEach((element) => {
        if(element.type == 'mention')
        {
          text += element.displayName;
          return;
        }
        if(element.type == 'text')
        {
          if(element.content == '')
          {
            return;
          }
          var localdata = JSON.parse(element.content);
          text += text.length != 0 ? " " : ""
          if(!isPrize && localdata[0].includes('получает награду'))
          {
            isPrize = true;
          }
          text += localdata[0];
        }
      });
    }

    if(!isPrize)
    {
      return;
    }

    // Show an alert notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: message.iconURL,
      title: message.messageData['author']['displayName'],
      message: text
    });
    

    // Play the alert sound
    //playAlertSound();
  }
});

// Function to play the alert sound
function playAlertSound() {
  const audio = new Audio(chrome.runtime.getURL('alertSound.mp3'));
  audio.play();
}
