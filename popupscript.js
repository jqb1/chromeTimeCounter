//send message to background when popup
chrome.runtime.sendMessage({data: "Handshake"}, function (response) {
    console.log('message sent')
});
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    let websites = message.data;
    console.log('received from background');
    console.log(websites);

    websites = arrayToHTML(websites);
    document.getElementById('time').innerHTML = websites;
});

function arrayToHTML(array) {
    let output_list = '';
    output_list+='<ul>';
    for (let time of array) {
        output_list += '<li>' + time + ' min'+'</li>';
    }
    output_list+='</ul>';
    return output_list
}