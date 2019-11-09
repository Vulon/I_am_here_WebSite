function loadHub() {

    const navHome = document.getElementById('navHome');
    const navSubjects = document.getElementById('navSubjects');
    const navGroups = document.getElementById('navGroups');
    const navAuth = document.getElementById('navAuth');
    navHome.className = 'navActive';
    navGroups.className = 'navInActive';
    navSubjects.className = 'navInActive';
    navAuth.className = 'navInActive';
    if (isAccessTokenExpired()) {
        refresh_token(loadHub)
        return;
    }
    hubLoadSettings()
}

function hubLoadSettings() {
    startSpinning();
    if (isAccessTokenExpired()) {
        refresh_token(hubLoadSettings);
        return
    }
    const request = createRequest('/web/credentials', 'GET', function (xmlHttpRequest) {

        const text = xmlHttpRequest.responseText;
        console.log(text);
        const json = JSON.parse(text);
        const container = document.getElementById("container");
        container.className = 'settingsContainer';
        container.innerHTML = '<p>UUID</p>\n' +
            '    <p id="uuidLabel">' + getStoredUUID() + '</p>\n' +
            '    <p>Username</p>\n' +
            '    <p id="nameLabel">' + json["name"] + '</p>\n' +
            '    <p>Email</p>\n' +
            '    <p id="emailLabel">' + json['email'] + '</p>\n' +
            '    <button class="serviceButton" onclick="hubLoadChangeSettings()">Change settings</button>'
        stopSpinning()
    }, function (statusCode) {
        notify("Something went wrong");
        console.error(statusCode)
        stopSpinning()
    });
    addHeader(request, 'access_token', getAccessToken());
    sendRequest(request);
}

function hubLoadChangeSettings() {
    const container = document.getElementById("container");
}

function notify(text) {
    let info_div = document.getElementById('info_div');
    info_div.innerHTML = '<p onclick="clearNotification()">' + text + '</p>';
}

function clearNotification() {
    let info_div = document.getElementById('info_div');
    info_div.innerHTML = '';
}


function startSpinning() {
    const loader = document.getElementById('progress-loader');
    loader.hidden = false;
}

function stopSpinning() {
    const loader = document.getElementById('progress-loader');
    loader.hidden = true;
}