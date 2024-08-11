import { channel } from "diagnostics_channel";

// The ID of the extension we want to talk to.
let editorExtensionId = "";

const channelName = window.location.href.split('.ru/')[1];

// Function to send a message to the background script
function sendMessageToBackground(message: object): void {
  chrome.runtime.sendMessage(getExcursionId(), message);
}

function getExcursionId(): string {
  if (editorExtensionId === '') {
    const element = document.getElementById("vkliveExtension");
    if (element) {
      editorExtensionId = element.getAttribute("id_of_extension") || '';
    }
  }
  return editorExtensionId;
}

async function parseMessage(data: any){
  let obj: any;
  try {
    obj = JSON.parse(data);
  } catch (e) {
    //console.error("Failed to parse WebSocket message:", e);
    return;
  }

  if (obj && obj['push'] && obj['push']['pub']) {
    const data = obj['push']['pub']['data'];

    if (data['type'] === "message") {

      const messageData = data['data'];
      const botStatus = messageData['author']['vkplayProfileLink'] === '' && messageData['author']['nick'] === "ChatBot";

      // Send the message to the background script
      sendMessageToBackground({
        type: 'BOT_CHAT_MESSAGE',
        messageData: messageData,
        iconURL: messageData['author']['avatarUrl'],
        isBot: botStatus,
        channel: channelName
      });
    }
  }
}

(function () {

  sendMessageToBackground({
    type: 'PAGE_LOAD'
  });

  console.log("connecting to websocket");
  const OrigWebSocket = window.WebSocket as typeof WebSocket;

  //let wsAddListener = OrigWebSocket.prototype.addEventListener;
  //wsAddListener = wsAddListener.call.bind(wsAddListener);

  window.WebSocket = function WebSocket(this: WebSocket, url: string | URL, protocols?: string | string[]): WebSocket {
    let ws: WebSocket;
    if (!(this instanceof WebSocket)) {
      // Called without 'new' (browsers will throw an error).
      ws = new (OrigWebSocket as any)(...Array.prototype.slice.call(arguments));
    } else if (arguments.length === 1) {
      ws = new OrigWebSocket(url);
    } else {
      ws = new OrigWebSocket(url, protocols);
    }

    ws.addEventListener('message', (event: MessageEvent) => {
      if (event.data === '' || event.data === undefined) {
        return;
      }

      parseMessage(event.data);
    });

    return ws;
  } as any;
  
  window.WebSocket.prototype = OrigWebSocket.prototype;
  window.WebSocket.prototype.constructor = window.WebSocket;

  const wsSend = OrigWebSocket.prototype.send;
  OrigWebSocket.prototype.send = function (this: WebSocket) {
    // Convert `arguments` to the appropriate type
    const args = Array.prototype.slice.call(arguments) as [string | ArrayBufferLike | Blob | ArrayBufferView];
    
    //console.log("Sent:", arguments[0]);
    return wsSend.apply(this, args);
  };
})();

export {}