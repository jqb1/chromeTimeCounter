console.log("backgroud  running!");

//chrome.browserAction.onClicked.addListener(buttonClicked);
chrome.tabs.onActiveChanged.addListener(tabChanged);

//handling handshake and responding with data
chrome.runtime.onMessage.addListener(popupMessage);

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
// expiration date of local storage (one day)
let expirationDate = 0;


let datax = 'alela';

/*
-------------------------------------
 */
function popupMessage() {

    console.log('received from popup');

    chrome.runtime.sendMessage({data: datax}, function (response) {
        console.log('sent from background to popup')
    });

}

function buttonClicked(tab) {
    // let msg = {
    //     txt: 'changeColor'
    // };
    // chrome.tabs.sendMessage(tab.id, msg);
    //
    // let websiteName = 'www.facebook.com';
    //
    // chrome.storage.local.get('expirationDate', function (result) {
    //     console.log('Value currently is ' + result['expirationDate']);
    // });
    //
    // setExpirationDate();
    // console.log(expirationDate)
    console.log('buttonclicked')

}

function tabChanged() {
    let elapsedTime = 0;
    // if not first opened page
    if (start !== 0) {

        end = window.performance.now();
        elapsedTime = end - start;
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

    });

}


function timeMapper(websiteName, elapsedTime) {

    console.log('timemaper');
    let timeYet, timeSum;
    // check if new website today
    if (websiteMap.has(websiteName) === false) {

        // if value not yet in a map, check local storage
        chrome.storage.local.get([websiteName], function (result) {

            //when new day result[websiteName] will be undefined and map will be cleared
            if (result[websiteName])
                timeSum = elapsedTime + result[websiteName];
            else
                timeSum = elapsedTime;

            let minutes = (timeSum / 1000) / 60;
            if (result[websiteName] == null) {
                websiteMap.set(websiteName, timeSum)
            }
            else
                websiteMap.set(websiteName, timeSum)
        });

    }
    else {

        timeYet = websiteMap.get(websiteName);
        timeSum = timeYet + elapsedTime;
        let minutes = (timeSum / 1000) / 60;
        websiteMap.set(websiteName, timeSum);
    }


    chrome.storage.local.set({[websiteName]: timeSum}, function () {

        console.log('Value in local storage overwritten');
        console.log(websiteMap);

    });

    // populate names with times

}

function isNewDay() {
    // expiration date will be equal 0 everytime when script will restart
    // so get date from local storage
    if (expirationDate === 0 || Date.now() > expirationDate) {
        chrome.storage.local.get(['expirationDate'], function (result) {

            expirationDate = result['expirationDate'];
            console.log("expirationd ate " + expirationDate);
            // case of first launch of the extension
            if (result['expirationDate'] == null) {
                setExpirationDate();
            }
            // if new day, reset times in local storage
            if (Date.now() > expirationDate) {
                clearStorage();
                // set new expiration date
                setExpirationDate();

                // save new expiration date in local storage
                chrome.storage.local.set({'expirationDate': expirationDate}, function () {
                    console.log('Expiration date set NEW DAY');
                });
            }
        });
    }

}


function setExpirationDate() {
    expirationDate = new Date();

    // today, midnight
    expirationDate.setHours(24, 0, 0, 0);
    expirationDate = expirationDate.getTime();

    chrome.storage.local.set({'expirationDate': expirationDate}, function () {
        console.log('Expiration date set ');
    });

}

// will clear storage every next day
function clearStorage() {
    //clear map
    websiteMap = new Map();

    console.log('should be almost never');
    chrome.storage.local.clear(function () {
        let error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
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

function writeToPopup() {

}
