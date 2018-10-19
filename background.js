console.log("backgroud  running!");


chrome.tabs.onActiveChanged.addListener(tabChanged);

//handling handshake and responding with data
chrome.runtime.onMessage.addListener(popupMessage);

chrome.tabs.onUpdated.addListener(urlChanged);



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


//when opening a browser check if new day
isNewDay();

/*
-------------------------------------
 */

/*---------Popup ----------*/
function popupMessage() {


    let websiteArray = mapToArray(websiteMap); console.log(websiteArray);


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
	let page = [webpage,time];
        
	websiteArray.push(page);
    }
    //sorting output array by time
    //if subtraction result is negative sorting function will place first value before the second etc
    websiteArray=websiteArray.sort(function (a,b){
        return a[1] - b[1];
    });


    return websiteArray.reverse();
}

function millisecToMin(time) {
    let minutes = Math.floor((time / 1000) / 60);
    return minutes;
}

/*-------------------------*/

//handle url change
function urlChanged(tabId,changeInfo,tab){
    if(changeInfo.url)
	tabChanged();
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
    });
}


function timeMapper(websiteName, elapsedTime) {

    let timeYet, timeSum;
    // check if new website today
    if (websiteMap.has(websiteName) === false) {

        // if value not yet in a map, check local storage
        chrome.storage.local.get([websiteName], function (result) {

            //when new day result[websiteName] will be undefined and map will be clean
            if (result[websiteName])
                timeSum = elapsedTime + result[websiteName];
            else
                timeSum = elapsedTime;

             websiteMap.set(websiteName, timeSum)
        });

    }
    else {

        timeYet = websiteMap.get(websiteName);
        timeSum = timeYet + elapsedTime;

        websiteMap.set(websiteName, timeSum);
    }

    // saving in local storage
    chrome.storage.local.set({[websiteName]: timeSum}, function () {

        console.log('Value in local storage overwritten');
        console.log(websiteMap);

    });


}

function isNewDay() {
    // expiration date will be equal 0 everytime when script will restart
    // so get the date from local storage
    if (expirationDate === 0 || Date.now() > expirationDate) {
        chrome.storage.local.get(['expirationDate'], function (result) {

            let expiration = result['expirationDate'];
            console.log("expirationd date " + expiration);
            if(!expiration)
		setExpirationDate();

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
       	console.log('Local storage cleared') 		
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
