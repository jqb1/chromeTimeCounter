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


/*
-------------------------------------
 */
function popupMessage() {

    console.log('received from popup');

    let websiteArray = mapToArray(websiteMap);
    console.log(websiteArray);

    chrome.runtime.sendMessage({data: websiteArray}, function (response) {
        console.log('sent from background to popup')
    });

}

function mapToArray(siteMap) {
    let websiteArray = [];
    for (let [webpage, time] of siteMap.entries()) {
        if(webpage==='expirationDate'){
	    continue;
	}
	time = millisecToMin(time);
        let str = webpage + ' = ' + time;
        websiteArray.push(str)
    }

    return websiteArray
}

function millisecToMin(time) {
    let minutes = Math.floor((time / 1000) / 60);
    return minutes;
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
        if (!currentPage) {
            currentPage = pageName;
            saveMapOnInit();
        }
        // map website name with time spent (tab before change)
        timeMapper(currentPage, elapsedTime);
        // remember current page name
        currentPage = pageName;

    });

}
function saveMapOnInit() {
    // save everything from local storage
    chrome.storage.local.get(null, function(items) {
        websiteMap = new Map(Object.entries(items));
        return websiteMap;
    });
}


function timeMapper(websiteName, elapsedTime) {

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

            let expiration = result['expirationDate'];
            console.log("expirationd date " + expiration);
            // case of first launch of the extension
            if (expiration == null) {
                setExpirationDate();
            }
            // if new day, reset times in local storage
            if (Date.now() > expiration) {
                // clear storage
                clearStorage();
                // set new expiration date
                setExpirationDate();
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
