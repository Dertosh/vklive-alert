// public/serviceWorker.ts

let soundUrl = "";
const stringGetPrize = 'получает награду';
const stringMarksMsg = 'выделил сообщение';
let currentChannel = "";
const audioPath = "audioworker/index.html";

let UserSettings = {disableSound: false, disableSoundMarked: false, disableMarkedMsg: false, volume: 0.5, customSound: undefined};
UpdateUserSettings();

let creating: Promise<void> | null; // A global promise to avoid concurrency issues

// Function to send a message to the background script
async function sendMessageFromBackground(message: object) {
  console.log('sendMessageFromBackground');
  chrome.runtime.sendMessage(message, (response) => {
    return;
  });
}

async function UpdateUserSettings()
{
  chrome.storage.local.get(['disableSound', 'volume', 'soundUrl', 'disableMarkedMsg', 'disableSoundMarked'], (result) => {
    UserSettings.disableSound = result.disableSound || false;
    UserSettings.volume = result.volume || 0.5;
    UserSettings.customSound = result.soundUrl || undefined;
    UserSettings.disableMarkedMsg = result.disableMarkedMsg || false;
    UserSettings.disableSoundMarked = result.disableSoundMarked || false;
  });

  const offscreenUrl = chrome.runtime.getURL(audioPath);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [offscreenUrl]
  });
  if (existingContexts.length > 0) {
    sendMessageFromBackground({
      type: 'USERSETTINGS_UPDATE', 
      volume: UserSettings.volume, 
      disableSound: UserSettings.disableSound,
      customSound: UserSettings.customSound,
      disableSoundMarked: UserSettings.disableSoundMarked
    });
  }
}

function getSound() {
    if(soundUrl)
    {
      return;
    }
  
    chrome.storage.local.get(['alertSound'], (result) => {
      if (result.alertSound) {
        soundUrl = result.alertSound;
      }
    });
  }

async function parseBotMessage(message : any) {

  let isMarked: boolean = message.messageData["styles"].includes('marked');

  if (!message.isBot && !isMarked || (message.isBot && isMarked)) {
    return;
  }

   let textOut: string = "";
   let title: string = message.messageData['author']['displayName'] + ' ' + stringMarksMsg;
   let isPrize: boolean = false;

   message.messageData['data'].forEach((element: any) => {
     if (element.type === 'mention') {
       title = element.displayName + ' ' + (isMarked ? stringMarksMsg : stringGetPrize);
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

       textOut += textOut.length !== 0 ? " " : "";

       let isIncludePrize = localdata[0] ? localdata[0].includes(stringGetPrize): false;
       if (!isPrize && isIncludePrize) {
         isPrize = true;
       }

       textOut += isIncludePrize ? localdata[0].slice(stringGetPrize.length + 2) : localdata[0];
     }
   });

   if ((!isPrize && message.isBot) || ((isMarked ? UserSettings.disableMarkedMsg : false) && !message.isBot)) {
    return;
   }

   // Show an alert notification
   chrome.notifications.create({
     type: 'basic',
     iconUrl: chrome.runtime.getURL('logo128.png'),
     title: title,
     message: textOut,
     silent: true,
     buttons: []
   });
   
   // Play the alert sound

   if(isMarked ? !UserSettings.disableSoundMarked : !UserSettings.disableSound)
   {
     playAlertSound();
   }
}

async function createAudioWorker() {
    // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  const offscreenUrl = chrome.runtime.getURL(audioPath);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    return;
  }
    // create offscreen document
    if (creating) {
      await creating;
    } else {
      creating = chrome.offscreen.createDocument({
      url: offscreenUrl,
      reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
      justification: 'notification',
      });

      creating.finally(()=>{
        console.log("created offscreen")
        sendMessageFromBackground({
          type: 'USERSETTINGS_UPDATE', 
          volume: UserSettings.volume, 
          disableSound: UserSettings.disableSound,
          customSound: UserSettings.customSound,
          disableSoundMarked: UserSettings.disableSoundMarked
        });
      });

      await creating;
      creating = null;
    }
} 


chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
    UpdateUserSettings();
  });
  
  chrome.runtime.onMessageExternal.addListener((message, _sender, sendResponse) => {
    console.log('onMessageExternal received in service worker:', message);

    if (message.type === 'USERSETTINGS_UPDATE') {
      sendResponse({ response: "Service worker received the USERSETTINGS_UPDATE"});
      UpdateUserSettings();
      return;
    }

    if (message.type === 'PAGE_LOAD') {
      sendResponse({ response: "Service worker received the PAGE_LOAD" });
      createAudioWorker();
      return;
    }
  
    if (message.type === 'BOT_CHAT_MESSAGE') {
      sendResponse({ response: "Service worker received the BOT_CHAT_MESSAGE" });
      parseBotMessage(message)
    }

    sendResponse({ response: "Service worker received Nothing" });
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {

    console.log('onMessage received in service worker:', message);

    if (message.type === 'USERSETTINGS_UPDATE') {
      sendResponse({ response: "Service worker received the USERSETTINGS_UPDATE"});
      UpdateUserSettings();
      return;
    }

    if (message.type === 'BOT_CHAT_MESSAGE') {
      sendResponse({ response: "Service worker received the BOT_CHAT_MESSAGE" });
      parseBotMessage(message)
    }

    sendResponse({ response: "Service worker received Nothing" });
  });
  
  // Function to play the alert sound
  async function playAlertSound(): Promise<void> {
    await createAudioWorker();
    sendMessageFromBackground({type : 'AUDIO_PLAY', audio_name : currentChannel, target: 'offscreen'});
  }
  
  // Adding export {} to make this file a module
  export {};
  