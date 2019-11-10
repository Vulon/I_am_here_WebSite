
function getActivePage() {
    if(document.getElementById('navHome').className === 'navActive'){
        return 'navHome';
    }
    if(document.getElementById('navSubjects').className === 'navActive'){
        return 'navSubjects';
    }
    if(document.getElementById('navGroups').className === 'navActive'){
        return 'navGroups';
    }
    return null;
}

function changeActivePage(pageName) {
    const navHome = document.getElementById('navHome');
    const navSubjects = document.getElementById('navSubjects');
    const navGroups = document.getElementById('navGroups');
    const navAuth = document.getElementById('navAuth');

    navHome.className = 'navInActive';
    navGroups.className = 'navInActive';
    navSubjects.className = 'navInActive';
    navAuth.className = 'navInActive';

    if(pageName === 'Home'){
        navHome.className = 'navActive';
    }else if(pageName === 'Groups'){
        navGroups.className = 'navActive';
    }else if(pageName === 'Subjects'){
        navSubjects.className = 'navActive';
    }else if(pageName === 'Auth'){
        navAuth.className = 'navActive';
    }
}

function loadHub() {
    changeActivePage('Home')
    if (isAccessTokenExpired()) {
        refresh_token(loadHub)
        return;
    }
    hubLoadSettings()
}

let party_list = null;
let edited_object = null;

function hubLoadSettings() {
    changeActivePage('Home');
    hubHideEditPanel();
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

function hubLoadSubjects() {
    changeActivePage('Subjects')
    edited_object = null;
    startSpinning()
    if (isAccessTokenExpired()) {
        refresh_token(hubLoadSettings);
        return
    }
    const container = document.getElementById("container")
    container.innerHTML = '<table id="subject_container">\n' +
        '        <tr>\n' +
        '            <th>Id</th>\n' +
        '            <th>Name</th>\n' +
        '            <th>Description</th>\n' +
        '            <th>Code</th>\n' +
        '            <th>Subjects</th>\n' +
        '            <th>Participators</th>\n' +
        '        </tr>\n' +
        '        <div id="subject_table">            \n' +
        '        </div>        \n' +
        '    </table>';

    hubHideEditPanel();
    const request = createRequest("/web/parties", "GET", function (xmlHttpRequest) {
        console.log(xmlHttpRequest.responseText)
        const json = JSON.parse(xmlHttpRequest.responseText)
        const table = document.getElementById("subject_table")
        party_list = json;
        for(i in json){
            table.innerHTML = table.innerHTML +
                '<tr onclick="hubExpandEditPanel('+i+')" id="tr"'+json[i].id+'>\n' +
                '    <th id="Id'+i+'">'+json[i].id+'</th>\n' +
                '    <th id="Name'+i+'">'+json[i].name+'</th>\n' +
                '    <th id="Description'+i+'">'+json[i].description+'</th>\n' +
                '    <th id="Code'+i+'">'+json[i].code+'</th>\n' +
                '    <th id="Subjects'+i+'">'+json[i].subjects+'</th>\n' +
                '    <th id="Participators'+i+'">'+json[i].participators+'</th>\n' +
                '</tr>';
        }

        stopSpinning()
    }, function (statusCode) {
        notify("Something went wrong");
        console.error(statusCode)
        stopSpinning();
    });
    addHeader(request, "access_token", getAccessToken());
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
    crypto.subtle.encrypt()
}



function startSpinning() {
    const loader = document.getElementById('progress-loader');
    loader.hidden = false;
}

function stopSpinning() {
    const loader = document.getElementById('progress-loader');
    loader.hidden = true;
}
function hubHideEditPanel() {
    const page = getActivePage();
    const editPanel = document.getElementById('edit_panel');
    console.log("Current page " + page)
    if(page === 'navHome'){
        editPanel.innerHTML='';
    }else if(page==='navSubjects'){
        editPanel.innerHTML='<button class="add_button" id="add_button" onclick="hubExpandEditPanel(null)">+</button>';
    }else if(page==='navGroups'){
        editPanel.innerHTML='<button class="add_button" id="add_button" onclick="hubExpandEditPanel(null)">+</button>';
    }else{
        editPanel.innerHTML='';
    }
}

function hubExpandEditPanel(id) {
    const page = getActivePage();
    const editPanel = document.getElementById('edit_panel');
    if(page === 'navHome'){
        editPanel.innerHTML='';
    }else if(page==='navSubjects'){
        if(id === null){
            const jsonText = '{' +
                '"id": "0", ' +
                '"name": " ", ' +
                '"description": " " , ' +
                '"code": " ", ' +
                '"subjects": " ", ' +
                '"participators": " "' +
                '}';
            console.log(jsonText)
            edited_object = JSON.parse(jsonText);
        }else{
            edited_object = party_list[id];
        }
        editPanel.innerHTML = '<table id="edit_table">\n' +
            '        <tr>\n' +
            '            <td id="edit_id">'+edited_object.id+'</td>\n' +
            '            <td >\n' +
            '                <input type="text" id="edit_name" placeholder="Name">\n' +
            '            </td>\n' +
            '            <td >\n' +
            '                <textarea id="edit_description" placeholder="Description"></textarea>\n' +
            '            </td>\n' +
            '            <td >\n' +
            '                <input type="text" id="edit_code" placeholder="Code">\n' +
            '            </td>\n' +
            '            <td >\n' +
            '                <button id="edit_subjects" class="serviceButton">Subjects</button>\n' +
            '            </td>\n' +
            '            <td >\n' +
            '                <button id="edit_participators" class="serviceButton">Participators</button>\n' +
            '            </td>\n' +
            '        </tr>\n' +
            '    </table>\n' +
            '    <button id="edit_save_button" class="serviceButton">Save</button>\n' +
            '    <button id="edit_cancel_button" class="serviceButton">Cancel</button>' +
            '    <button class="add_button" onclick="hubHideEditPanel()">-</button>';
        const edit_id = document.getElementById('edit_id');
        const edit_name = document.getElementById('edit_name');
        const edit_description = document.getElementById('edit_description');
        const edit_code = document.getElementById('edit_code');
        const edit_subjects = document.getElementById('edit_subjects');
        const edit_participators = document.getElementById('edit_participators');
        edit_name.value=edited_object.name;
        edit_description.value=edited_object.description;
        edit_code.value=edited_object.code;

    }else if(page==='navGroups'){

    }else{
        editPanel.innerHTML='';
    }
}