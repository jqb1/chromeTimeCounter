console.log("backgroud  running!");


chrome.browserAction.onClicked.addListener(buttonClicked);

//check when tab is changed
chrome.tabs.onActiveChanged.addListener(tabChanged);

let params = {
    'active': true,
    'lastFocusedWindow': true
};

let websiteMap=new Map();

// time variables
let start = 0;
let end = 0;
function printPage() {


    //get currently opened tab info
    chrome.tabs.query(params, function (tabs) {
        url = tabs[0].url;
        console.log(url);
    });
}

function buttonClicked(tab) {
    let msg = {
        txt: 'changeColor'
    };

    printPage();
    chrome.tabs.sendMessage(tab.id, msg);
}

function tabChanged() {
    if(start !==0)
        end = window.performance.now();

    let elapsed = end - start;
    console.log(elapsed);
    start=window.performance.now();


    //when tab is changed, get tab url, start counting time
    chrome.tabs.query(params, function (tabs) {
        //get url
        let url = tabs[0].url;

        let websiteName = truncateUrl(url);
        console.log(websiteName);
        timeCounter(websiteName);
    });

}


function truncateUrl(url) {
    let counter = 0;
    let output_word = '';

    //save only domain name
    for (let letter of url) {

        if (letter === '/') {
            counter++;
        }
        if (counter >= 2 && counter < 3) {
            //skip the first slash
            if (letter === '/')
                continue;

            output_word = output_word.concat(letter);
        }
    }

    return output_word;
}


function timeCounter(websiteName){
    //check if new website today
    if(websiteMap.has(websiteName)===false){

        websiteMap.set(websiteName,0);
    }
    else{

    }
    //populate names with times
    console.log(websiteMap);

}

function countTime(){

}
