console.log("Injecting");

const div = document.createElement("div");
div.setAttribute('id', "vkliveExtension");
div.setAttribute('id_of_extension', chrome.runtime.id);
(document.head || document.documentElement).append(div);

const s = document.createElement('script');
s.src = chrome.runtime.getURL('socket_sniffer/socket_sniffer.js');
s.onload = function() {
    console.log("socket-sniffer Injected");
    (this as HTMLScriptElement).remove();
};
(document.head || document.documentElement).append(s);

export {}