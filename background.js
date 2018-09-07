console.log("backgroud  running!");


chrome.browserAction.onClicked.addListener(buttonClicked);
chrome.tabs.onActiveChanged.addListener(tabChanged);

let params = {
    'active': true,
    'lastFocusedWindow': true
};

/*
-----Essential global variables-----
*/
// map for time and website names
let websiteMap = new Map();
// time variables
let start = 0;
let end = 0;
// variable used to remember previous tab when changed
let currentPage;
// expiation date of local storage (one day)
let expiationDate = 0;

/*
-------------------------------------
 */

function buttonClicked(tab) {
    let msg = {
        txt: 'changeColor'
    };
    chrome.tabs.sendMessage(tab.id, msg);

    chrome.storage.local.get(['www.facebook.com'], function(result) {
        console.log('Value currently is ' + result['www.facebook.com'] );
    });

    setExpirationDate();

}

function tabChanged() {
    let elapsedTime = 0;
    // if not first opened page
    if (start !== 0) {

        end = window.performance.now();
        elapsedTime = end - start;
        console.log(elapsedTime);
    }
    start = window.performance.now();

    //check if new day and reset timer if necessary
    isNewDay();

    // when tab is changed, get tab url, start counting time
    chrome.tabs.query(params, function (tabs) {
        //get url
        let url = tabs[0].url;

        let pageName = truncateUrl(url);

        //if first page
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

    // save only domain name
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

    let timeYet, timeSum;
    // check if new website today
    if (websiteMap.has(websiteName) === false) {

        websiteMap.set(websiteName, elapsedTime);
        timeSum = elapsedTime;
    }
    else {
        timeYet = websiteMap.get(websiteName);
        timeSum = timeYet + elapsedTime;
        websiteMap.set(websiteName, timeSum);
    }


    chrome.storage.local.set({[websiteName]: timeSum}, function () {
        console.log('Value set');
    });


    // populate names with times
    console.log(websiteMap);

}

function setExpirationDate() {
    expiationDate = new Date();
    // today, midnight
    expiationDate.setHours(24, 0, 0, 0);
    console.log(expiationDate);
}

// will clear storage every next day
function clearStorage() {

    chrome.storage.local.clear(function () {
        let error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    });
}

function isNewDay() {
    // expiration date will be equal 0 everytime when script will restart
    // so get date from local storage
    if(expiationDate===0){
        chrome.storage.local.get(['expirationDate'], function(result) {
            expiationDate=result['expirationDate'];
            console.log('Expiration date set to ' + result['expirationDate'] );
        });
    }
    // if new day, reset times in local storage
    if (Date.now() > expiationDate) {
        clearStorage();

        //clear map
        websiteMap=new Map();

        // set new expiration date
        setExpirationDate();

        // save new expiration date in local storage
        chrome.storage.local.set({'expirationDate': expiationDate}, function () {
            console.log('Expiration date set');
        });
    }
}


