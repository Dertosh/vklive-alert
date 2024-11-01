// public/serviceWorker.ts

let soundUrls = new Map<string, string>(); 
soundUrls.set('default', 'present.mp3');

let UserSettings = {disableSound: false, volume: 0.5, disableSoundMarked: false, disableMarkedMsg: false, customSound: undefined};

var audio = new Audio();

async function UpdateUserSettings()
{
  if(chrome.storage)
  {
    chrome.storage.local.get(['volume'], (result) => {
      UserSettings.volume = result.volume || 0.5;
    });
  }
  else
  {
    console.log("empty storage")
  }
}

UpdateUserSettings();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Message received in audio worker:', message);

  if(message.type === 'AUDIO_PLAY'){
    console.log("AUDIO_PLAY: ", message.audio_name);
    sendResponse({ response: "Service audio worker received the AUDIO_PLAY" });
    playAlertSound(message.audio_name);
    return true;
  }

  if(message.type === 'AUDIO_SET'){
    sendResponse({ response: "Service audio worker received the AUDIO_SET" });
    soundUrls.set(message.name , message.url);
    return true;
  }

  if(message.type === 'AUDIO_SETTINGS'){
    sendResponse({ response: "Service audio worker received the AUDIO_SETTINGS" });
    UserSettings.volume = message.volume || 0.5;
    return true;
  }

  if (message.type === 'USERSETTINGS_UPDATE') {
    sendResponse({ response: "Service audio worker received the USERSETTINGS_UPDATE"});
    UserSettings.volume = message.volume || 0.5;
    if(message.customSound)
    {
      soundUrls.set('default', message.customSound);
    }
    return true;
  }

  sendResponse({response: "Message received"});
});

if(chrome.storage)
{
  chrome.storage.local.get(['default'], (result) => {
    console.log('Retrieved name: ' + result)
    if(result)
    {
      soundUrls.set('default', result.fileUrl);
    }
    else
    {
      soundUrls.set('default', 'present.mp3');
    }
  });


//chrome.storage.

  chrome.storage.local.onChanged.addListener((changes) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      console.log(
        `Storage key "${key}" in namespace "local" changed.`,
        `Old value was "${oldValue}", new value is "${newValue}".`
      );
    }
  });

}
else
{
  console.log("empty local")
}


// Function to play the alert sound
async function playAlertSound(soundName: string): Promise<void> {
  let soundUrl = soundUrls.get(soundName);
  if (!soundUrl) {
    soundUrl = soundUrls.get('default');
  }

  audio.pause();
  audio = new Audio(soundUrl);
  audio.volume = UserSettings.volume;
  //console.log("volume", UserSettings.volume);
  audio.play();
  //console.log("audio.play()");
}
  
// Adding export {} to make this file a module
export {};