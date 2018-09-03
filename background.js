console.log("backgroud  running!");


chrome.browserAction.onClicked.addListener(buttonClicked);

//check when tab is changed
chrome.tabs.onActiveChanged.addListener(tabChanged);

let params={
    'active': true,
    'lastFocusedWindow': true
};

function printPage() {
    //get currently opened tab info
    chrome.tabs.query(params, function (tabs) {
         url = tabs[0].url;
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

function tabChanged(){
    console.log("tab changed!");
    //when tab is changed, get tab url
    chrome.tabs.query(params, function (tabs) {
        //get url
        url = tabs[0].url;

        checkUrl(url);

    });

}

function checkUrl (url) {


    let website = truncateUrl(url)
    console.log(website);

}

function truncateUrl(url) {
    let counter = 0;
    let output_word='';

    //save only domain name
    for (letter of url){

        if (letter =='/'){
            counter++;
        }
        if (counter>=2 && counter<3){
            if (letter=='/')
                continue;

            output_word=output_word.concat(letter);
        }
    }

    return output_word;


}