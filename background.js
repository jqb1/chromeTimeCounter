console.log("backgroud  running!");


chrome.browserAction.onClicked.addListener(buttonClicked);

//check when tab is changed
chrome.tabs.onActiveChanged.addListener(tabChanged);

let params = {
    'active': true,
    'lastFocusedWindow': true
};

let websiteMap = new Map();

// time variables
let start = 0;
let end = 0;

//variable used to remember previous tab when changed
let currentPage;

let date = new Date();
date.setHours(24,0,0,0);
let cookieExp=(date.getTime())/1000;


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
    let elapsedTime = 0;
    //if not first opened page
    if (start !== 0) {

        end = window.performance.now();
        elapsedTime = end - start;
        console.log(elapsedTime);
    }
    start = window.performance.now();


    //when tab is changed, get tab url, start counting time
    chrome.tabs.query(params, function (tabs) {
        //get url
        let url = tabs[0].url;

        let pageName = truncateUrl(url);

        //if first page change
        if (!currentPage)
            currentPage = pageName;

        // map previous website name with time spent
        timeMapper(currentPage, elapsedTime);
        // remember current page name
        currentPage = pageName;
        console.log(pageName);

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


function timeMapper(websiteName, elapsedTime) {

    let timeYet,timeSum;
    //check if new website today
    if (websiteMap.has(websiteName) === false) {

        websiteMap.set(websiteName, elapsedTime);
        timeSum=elapsedTime;
    }
    else {
        timeYet = websiteMap.get(websiteName);
        timeSum = timeYet + elapsedTime;
        websiteMap.set(websiteName, timeSum);
    }


    let cookie = {
        'name': 'kukik',
        'url': 'https://' + websiteName,
        'value': timeSum.toString(),
        'expirationDate':cookieExp
    };

    console.log(cookie.expirationDate+'herehrere');
    chrome.cookies.set(cookie);
    console.log('cookie has been set');

    //populate names with times
    console.log(websiteMap);

}

function countTime() {

}
