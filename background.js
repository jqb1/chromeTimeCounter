console.log("backgroud  running!");

chrome.browserAction.onClicked.addListener(buttonClicked);

function buttonClicked(tab) {
    let msg={
        txt:'changeColor'
    };
    console.log(msg);
    chrome.tabs.sendMessage(tab.id,msg);
}