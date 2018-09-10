console.log('test2');


chrome.runtime.onMessage.addListener(gotMessage);

let isColored = false;



function gotMessage(request,sender,sendResponse) {


    console.log(request.txt);


    if(request.txt==="changeColor"){
        let divs = document.getElementsByTagName('p');

        if (isColored ===false) {

            for (div of divs) {
                div.style['background-color'] = '#4683ea'
            }
            isColored = true;
        }
        else{
            for (div of divs) {
                div.style['background-color'] = '#fff'
            }
            isColored = false
        }
    }
}