console.log('test2');


chrome.runtime.onMessage.addListener(gotMessage);

var isColored = false;



function gotMessage(request,sender,sendResponse) {


    console.log(request.txt);


    if(request.txt==="changeColor"){
        let divs = document.getElementsByTagName('p');

        if (isColored ===false) {

            for (el of divs) {
                el.style['background-color'] = '#4683ea'
            }
            isColored = true;
        }
        else{
            for (el of divs) {
                el.style['background-color'] = '#fff'
            }
            isColored = false
        }
    }
}