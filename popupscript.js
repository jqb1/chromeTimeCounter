//send message to background when popup
chrome.runtime.sendMessage({data:"Handshake"},function(response){
    console.log('message sent')
});
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    let str = JSON.stringify(message.data);
    console.log('received from background');
    console.log(str)
});