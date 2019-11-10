let storedToken = "";

function getStoredUUID() {
    return window.localStorage.getItem("UUID");
}

function storeTokenDataString(tokenDataString) {
    let json = JSON.parse(tokenDataString);
    window.localStorage.setItem("access_token", json["access_token"]);
    window.localStorage.setItem("refresh_token", json["refresh_token"]);
    window.localStorage.setItem("access_token_expire_date", json["access_token_expire_date"]);
    window.localStorage.setItem("refresh_token_expire_date", json["refresh_token_expire_date"]);
}

function storeAccessToken(access_token) {
    window.localStorage.setItem("access_token", access_token);
}

function storeRefreshToken(refresh_token) {
    window.localStorage.setItem("refresh_token", refresh_token);
}

function storeAccessTokenTimestamp(access_timestamp) {
    window.localStorage.setItem("access_token_expire_date", access_timestamp);
}

function storeRefreshTokenTimestamp(refresh_timestamp) {
    window.localStorage.setItem("refresh_token_expire_date", refresh_timestamp);
}

function getAccessToken() {
    return window.localStorage.getItem("access_token");
}

function getRefreshToken() {
    return window.localStorage.getItem("refresh_token");
}

function getAccessTokenTimestamp() {
    return window.localStorage.getItem("access_token_expire_date");
}

function getRefreshTokenTimestamp() {
    return window.localStorage.getItem("refresh_token_expire_date");
}

function redirectToAuth(message) {
    alert(message)
    window.location.href = "auth.html";
}

function refresh_token(callback) {
    const refresh_expire = getRefreshTokenTimestamp();
    const refresh = getRefreshToken();
    if (refresh === null || refresh_expire === null) {
        redirectToAuth()
        return;
    }
    if (Date.now() >= refresh_expire) {
        redirectToAuth()
        return
    }

    const rq = createRequest('/web/refresh', 'GET', function (xmlHttpRequest) {
        const text = xmlHttpRequest.responseText;
        storeTokenDataString(text);
        if (!callback) {
            callback()
        }
    }, function (statusCode) {
        if (statusCode === 403) {
            alert('Something went wrong with cors!')
        } else if (statusCode === 409) {
            alert("User was not found in database")
        } else if (statusCode >= 500) {
            alert("Server is unavailable")
        } else if (statusCode === 404) {
            alert("Could not find requested web page")
        }
        redirectToAuth("Could not get new access token")
    });
    addHeader(rq, 'refresh_token', refresh);
    sendRequest(rq, null);
}

function isAccessTokenExpired() {
    const access_token = getAccessToken();
    const tokenExpire = getAccessTokenTimestamp()
    if (!tokenExpire || !access_token) {
        return true;
    }
    return Date.now() >= tokenExpire;
}

function sign_out() {
    changeActivePage('Auth')
    window.localStorage.removeItem("access_token");
    window.localStorage.removeItem("refresh_token");
    window.localStorage.removeItem("access_token_expire_date");
    window.localStorage.removeItem("refresh_token_expire_date");
    redirectToAuth("Signed out")
}