console.log("backgroud  running!");

chrome.browserAction.onClicked.addListener(buttonClicked);


var params={
    'active': true,
    'lastFocusedWindow': true
};

function printPage() {
    chrome.tabs.query(params, function (tabs) {
        console.log('we\'re here');
        var url = tabs[0].url;
        console.log(url);
    });
}


function buttonClicked(tab) {
    let msg={
        txt:'changeColor'
    };

    printPage();
    chrome.tabs.sendMessage(tab.id,msg);
}