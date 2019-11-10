function toRegister() {
    let e = document.getElementById('form');
    e.innerHTML = '<p class="form_label">Please enter your password</p>\n' +
        '    <input type="password" id="first_password" class="form_input">\n' +
        '    <p class="form_label">Please repeat your password</p>\n' +
        '    <input type="password" id="second_password" class="form_input">\n' +
        '    <br>\n' +
        '    <button class="submit_button" onclick="doRegister()">Submit</button>';
    let b = document.getElementById('toggle_button');
    b.innerHTML = '<button class="toggle_button" onclick="toLogin()">Login</button>';
}

function toLogin() {
    let e = document.getElementById('form');
    e.innerHTML = '<p class="form_label">Please enter your password</p>\n' +
        '    <input type="password" id="first_password" class="form_input">\n' +
        '    <br>\n' +
        '    <button class="submit_button" onclick="doLogin()">Submit</button>';
    let b = document.getElementById('toggle_button');
    b.innerHTML = '<button class="toggle_button" onclick="toRegister()">Register</button>';
}

function checkUUID() {
    let uuid = getStoredUUID();
    let info_div = document.getElementById('info_div');
    if (uuid === null) {
        info_div.innerHTML = '<p>You need to obtain uuid first</p>\n' +
            '    <p>Please visit this page:</p>\n' +
            '    <button class="submit_button" onclick="window.location.href = \'main.html\';">Obtain uuid</button>';
        return null;
    } else {
        clearNotification();
        return uuid;
    }
}

function notify(text) {
    let info_div = document.getElementById('info_div');
    info_div.innerHTML = '<p>' + text + '</p>'
        + '<button class="submit_button" onclick="clearNotification()">OK</button>';
}

function clearNotification() {
    let info_div = document.getElementById('info_div');
    info_div.innerHTML = '';
}

function doLogin() {
    let uuid = checkUUID()
    if (uuid === null) {
        return null;
    }
    startSpinning();
    let pass1 = document.getElementById('first_password').value;
    const rq = createRequest("/web/login", 'POST', function (xmlHttpRequest) {
            const data = xmlHttpRequest.responseText;
            let jsonData = JSON.parse(data);
            storeTokenDataString(data);
            stopSpinning()
            successGreeting('logged in')

        }, function (statusCode) {
            if (statusCode === 403) {
                notify('Something went wrong with cors!')
            } else if (statusCode === 409) {
                notify("This this combination of uuid and password was not found")
            } else if (statusCode >= 500) {
                notify("Server is unavailable")
            } else if (statusCode === 404) {
                notify("Could not find requested web page")
            }
            stopSpinning()
        }
    );
    addHeader(rq, 'UUID', uuid)
    addHeader(rq, 'password', pass1)
    sendRequest(rq, null)

}

async function doRegister() {
    let uuid = checkUUID()
    if (uuid === null) {
        return null;
    }

    let pass1 = document.getElementById('first_password').value;
    let pass2 = document.getElementById('second_password').value;

    if (pass1 === pass2) {
        if (pass1.length > 5) {
            startSpinning()
            const rq = createRequest("/web/register", 'POST', function (xmlHttpRequest) {
                    const data = xmlHttpRequest.responseText;
                    let jsonData = JSON.parse(data);
                    storeTokenDataString(data);
                    successGreeting('registered')
                     stopSpinning()
                }, function (statusCode) {
                    if (statusCode === 403) {
                        notify('Something went wrong with cors!')
                    } else if (statusCode === 409) {
                        notify("This uuid is already registered")
                    } else if (statusCode >= 500) {
                        notify("Server is unavailable")
                    } else if (statusCode === 404) {
                        notify("Could not find requested web page")
                    }
                    stopSpinning()
                }
            );

            addHeader(rq, 'UUID', uuid)
            addHeader(rq, 'password', pass1)
            sendRequest(rq, null)
        } else {
            notify('Password should be at least 6 characters');
        }
    } else {
        notify('Passwords does not match');
    }
}

function sign_out() {
    window.localStorage.clear();
    window.location.href = "main.html";
}

function successGreeting(type = "registered") {
    let complete_div = document.getElementById('complete_div');
    complete_div.innerHTML = '<p>You have successfully ' + type + '!</p>\n' +
        '    <p>You may now proceed to the Manager Hub</p>\n' +
        '    <button class="home_button" onclick="window.location.href = \'index.html\'"> HomePage</button>'
}



function startSpinning() {
    const loader = document.getElementById('progress-loader');
    loader.hidden = false;
}

function stopSpinning() {
    const loader = document.getElementById('progress-loader');
    loader.hidden = true;
}