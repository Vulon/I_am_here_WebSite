
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
        refresh_token(hubLoadSettings)
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

}

function hubLoadGroups() {
    changeActivePage('Groups')
    edited_object = null;
    startSpinning()
    if (isAccessTokenExpired()) {
        refresh_token(hubLoadSettings);
        return
    }
    const container = document.getElementById("container")
    container.innerHTML = '<table id="groups_container">\n' +
        '        <tr>\n' +
        '            <th>Id</th>\n' +
        '            <th>Name</th>\n' +
        '            <th>Description</th>\n' +
        '            <th>Code</th>\n' +
        '            <th>Subjects</th>\n' +
        '            <th>Participators</th>\n' +
        '        </tr>\n' +
        '        <div id="groups_table">            \n' +
        '        </div>        \n' +
        '    </table>';

    hubHideEditPanel();
    if(isAccessTokenExpired()){
        refresh_token(hubLoadGroups);
        return;
    }
    const request = createRequest("/web/parties", "GET", function (xmlHttpRequest) {
        console.log(xmlHttpRequest.responseText)
        const json = JSON.parse(xmlHttpRequest.responseText)
        const table = document.getElementById("groups_table")
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




function hubOpenModal(type) {
    // Get the modal
    let modal = document.getElementById("myModal");
    modal.style.display = "block";
    const content = document.getElementById("modal-content");
    if(type === 'Subjects'){
        if(isAccessTokenExpired()){
            refresh_token(hubOpenModal(type));
            return;
        }

        const request = createRequest("/web/subjects", 'GET', function (xmlHttpRequest) {
            console.log("Edited object subjects: " + edited_object.subjects);
            const text = xmlHttpRequest.responseText;
            const json = JSON.parse(text);
            let counter = 0;
            content.innerHTML = '';
            
            const buttonPressCallback = function (id) {
                let sb;
                sb.subect_id = id;
                let btn =document.getElementById("modal_button" + id);
                sb.name = btn.innerText;
                edited_object.subjects.push(sb);
                btn.className = "modal_button_down";
                const inner = function () {
                    const index = edited_object.subjects.indexOf(sb);
                    edited_object.subjects.splice(index, 1);
                    btn.className = "modal_button_up";
                    btn.onclick = function () {
                        buttonPressCallback(id);
                    };
                }
            }

            const buttonReleaseCallback = function (id) {
                let sb;
                sb.subect_id = id;
                let btn =document.getElementById("modal_button" + id);
                sb.name = btn.innerText;

                const index = edited_object.subjects.indexOf(sb);
                edited_object.subjects.splice(index, 1);
                btn.className = "modal_button_up";
                btn.onclick = function () {
                    edited_object.subjects.push(sb);
                    btn.className = "modal_button_down";
                    btn.onclick = function () {
                        buttonReleaseCallback(id);
                    };
                }
            }
            
            for(i in edited_object.subjects){
                content.innerHTML = content.innerHTML + '' +
                    '<button class="modal_button_down" id="modal_button" '+edited_object.subjects[i].subjectId+'>'+edited_object.subjects[i].name+'</button>'
                counter++;
                document.getElementById("modal_button"+ edited_object.subjects[i].subjectId).onclick=buttonReleaseCallback(edited_object.subjects[i].subjectId)

                if(counter >= 3){
                    content.innerHTML = content.innerHTML + '<br>';
                    counter = 0;
                }
            }
            for(i in json){
                let item;
                item.name = json[i].name;
                item.subjectId = json[i].subjectId;
                if(!edited_object.subjects.includes(item)){
                    content.innerHTML = content.innerHTML + '' +
                        '<button class="modal_button_up" id="modal_button" '+item.subjectId+'>'+item.name+'</button>';
                    counter++;
                    document.getElementById("modal_button" + item.subjectId).onclick=buttonPressCallback(item.subjectId)
                    if(counter >= 3){
                        content.innerHTML = content.innerHTML + '<br>';
                        counter = 0;
                    }
                }
            }

        }, function (statusCode) {
            notify("Something went wrong, when tried to load subjects");
        });
        addHeader(request, 'access_token', getAccessToken());
        sendRequest(request, null);
    }else if(type === 'Participators'){

    }
}

function hubHideModal() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
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
    }else if(page==='navGroups'){
        if(id === null){
            const jsonText = '{' +
                '"id": "0", ' +
                '"name": " ", ' +
                '"description": " " , ' +
                '"code": " ", ' +
                '"subjects": [], ' +
                '"participators": []' +
                '}';
            edited_object = JSON.parse(jsonText);
            console.log("Edited object: " + edited_object)
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
            '                <button id="edit_subjects" class="serviceButton" onclick="hubOpenModal(\'Subjects\')">Subjects</button>\n' +
            '            </td>\n' +
            '            <td >\n' +
            '                <button id="edit_participators" class="serviceButton" onclick="hubOpenModal(\'Participators\')">Participators</button>\n' +
            '            </td>\n' +
            '        </tr>\n' +
            '    </table>\n' +
            '    <button id="edit_save_button" class="serviceButton" onclick="hubEditSaveHandler()">Save</button>\n' +
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

    }else if(page==='navSubjects'){

    }else{
        editPanel.innerHTML='';
    }
}

function hubEditSaveHandler() {
    const page = getActivePage();
    if(page === "navGroups"){
        if(isAccessTokenExpired()){
            refresh_token(hubEditSaveHandler);
            return
        }
        edited_object.name = document.getElementById("edit_name").value;
        edited_object.description = document.getElementById("edit_description").value;
        edited_object.code= document.getElementById('edit_code').value;

        const request = createRequest("/web/party", "POST", function (xmlHttpRequest) {
            hubLoadGroups()
        }, function (statusCode) {
            notify("Request to upload group failed with code " + statusCode)
        });
        addHeader(request, "access_token", getAccessToken());
        addHeader(request, "Content-Type", "application/json");
        edited_object.manager_id = -1;
        console.log("Trying to send group object: " + JSON.stringify(edited_object));
        sendRequest(request, JSON.stringify(edited_object));
    }else if(page === "navSubjects"){

    }
}