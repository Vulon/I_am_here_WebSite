const urlbase = "http://localhost:8082";

//const urlbase = 'http://92.243.164.53:8082';



function addCorsHeaders(xmlHttpRequest) {
    xmlHttpRequest.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xmlHttpRequest.setRequestHeader("WWW-Authenticate", 'Basic realm="User Visible Realm"');
    xmlHttpRequest.setRequestHeader("Access-Control-Allow-Origin", urlbase);
    xmlHttpRequest.withCredentials = true;

}

//"/web/register"
function createRequest(path, method, responseCallBack, errorCallBack) {
    const xmlHttpRequest = new XMLHttpRequest();
    xmlHttpRequest.open(method, urlbase + path, true);
    addCorsHeaders(xmlHttpRequest);
    xmlHttpRequest.onreadystatechange = function () {
        if (xmlHttpRequest.readyState === 4) {
            if (xmlHttpRequest.status === 200) {
                responseCallBack(xmlHttpRequest);
            } else {
                errorCallBack(xmlHttpRequest.status);
            }
        }
    };

    return xmlHttpRequest;
}

function sendRequest(xmlHttpRequest, data) {
    xmlHttpRequest.send(data);
}


function addHeader(xmlHttpRequest, headerKey, headerData) {
    xmlHttpRequest.setRequestHeader(headerKey, headerData);
}

