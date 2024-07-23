// The ID of the extension we want to talk to.
var editorExtensionId = "";

// Function to send a message to the background script
function sendMessageToBackground(message) {
  chrome.runtime.sendMessage(getExcursionId(), message, response => {
    console.log('Response from sniffer:', response);
  });
}

function getExcursionId() {
  if(editorExtensionId == '')
  {
    var element = document.getElementById("vkliveExtension");
    if(element)
    {
      editorExtensionId = element.getAttribute("id_of_extension");
    }
  }
  console.log("id_of_extension", editorExtensionId);
  return editorExtensionId;
}

(function () {

  console.log("chrome.runtime.id sniffer", chrome.runtime.id );

  // chrome.runtime.onMessage.addListener(
  //   function(request, sender, sendResponse) {
  //     console.log(sender.tab ?
  //                 "from a content script:" + sender.tab.url :
  //                 "from the extension");
  //     if (request.type == "extension-id")
  //       editorExtensionId = request.id;
  //       sendResponse({farewell: "get extension id"});
  //   });

    console.log("connecting to websocket");
    var OrigWebSocket = window.WebSocket;
  
    var callWebSocket = OrigWebSocket.apply.bind(OrigWebSocket);
    var wsAddListener = OrigWebSocket.prototype.addEventListener;
    wsAddListener = wsAddListener.call.bind(wsAddListener);
    window.WebSocket = function WebSocket(url, protocols) {
      var ws;
      if (!(this instanceof WebSocket)) {
        // Called without 'new' (browsers will throw an error).
        ws = callWebSocket(this, arguments);
      } else if (arguments.length === 1) {
        ws = new OrigWebSocket(url);
      } else if (arguments.length >= 2) {
        ws = new OrigWebSocket(url, protocols);
      } else { // No arguments (browsers will throw an error)
        ws = new OrigWebSocket();
      }
  
      wsAddListener(ws, 'message', function (event) {
        if(event.data == ''|| event.data == undefined)
        {
          return
        }

        var obj = JSON.parse(event.data);

        if(obj != undefined && obj['push'] != undefined && obj['push']['pub'] != undefined)
        {
          var data = obj['push']['pub']['data'];

          if(data['type'] == "message")
          {
            var messageData = data['data']
            var botStatus = messageData['author']['vkplayProfileLink'] == '' && messageData['author']['nick'] == "ChatBot"

            //console.log("Message data:", messageData);
            //console.log("Message author:", messageData['author']['displayName']," text ", messageData['data'][0]['content'], " bot:", botStatus ? "True" : "False")

            if(true)
            {
              sendMessageToBackground({ type: 'BOT_CHAT_MESSAGE', messageData: messageData, iconURL: messageData['author']['avatarUrl'], isBot: botStatus});
            }
          }
        }

      });
      return ws;
    }.bind();
    window.WebSocket.prototype = OrigWebSocket.prototype;
    window.WebSocket.prototype.constructor = window.WebSocket;
  
    var wsSend = OrigWebSocket.prototype.send;
    wsSend = wsSend.apply.bind(wsSend);
    OrigWebSocket.prototype.send = function (data) {
      //console.log("Sent:", data);
      return wsSend(this, arguments);
    };
  })();