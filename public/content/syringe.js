console.log("Injecting");
console.log("chrome.runtime.id inject", chrome.runtime.id );

var div = document.createElement("div");
div.setAttribute('id', "vkliveExtension");
div.setAttribute('id_of_extension', chrome.runtime.id);
(document.head || document.documentElement).append(div);

var s = document.createElement('script');
s.src = chrome.runtime.getURL('lib/socket-sniffer.js');
s.onload = function() {
    console.log("socket-sniffer Injected");
    this.remove();
};
(document.head || document.documentElement).append(s);

console.log("End start Injected");