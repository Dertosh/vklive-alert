// public/serviceWorker.ts
console.log('audio id_of_extension', chrome.runtime.id);

let soundUrls = new Map<string, string>(); 
soundUrls.set('default', 'audioworker/present.mp3');

var audio = new Audio();


//chrome.runtime.onInstalled.addListener(()=>{ 
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
    sendResponse({response: "Message received"});
  });
//}); 

// Function to play the alert sound
async function playAlertSound(soundName: string): Promise<void> {
  let soundUrl = soundUrls.get(soundName);
  if (!soundUrl) {
    soundUrl = soundUrls.get('default');
  }

  audio.pause();
  audio = new Audio(soundUrl);
  audio.play();
  console.log("audio.play()");
}
  
// Adding export {} to make this file a module
export {};
  