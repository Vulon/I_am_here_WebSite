
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
let subjects_list = null;
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
    changeActivePage("Subjects");


    const container = document.getElementById("container")
    container.innerHTML = '<table id="subjects_container"></table>'

    hubHideEditPanel();
    startSpinning()
    if (isAccessTokenExpired()) {
        refresh_token(hubLoadSettings);
        return
    }
    const request = createRequest("/web/subjects", "GET", function (xmlHttpRequest) {
        const text = xmlHttpRequest.responseText;
        console.log("Response from server: " + text);
        const json = JSON.parse(text);
        subjects_list = json;
        const table = document.getElementById("subjects_container");
        for(i in json){
            //json[i].start_date = Date(json[i].start_date)
            //json[i].finish_date = Date(json[i].finish_date)

            console.log("Load subjects: parsing json" + i + " - " + JSON.stringify(json[i]))
            const row = table.insertRow(i);
            const cell_id = row.insertCell(0)
            const cell_name = row.insertCell(1)
            const cell_plan = row.insertCell(2)
            const cell_description = row.insertCell(3)
            const cell_code = row.insertCell(4)
            const cell_start_date = row.insertCell(5)
            const cell_finish_date = row.insertCell(6)

            cell_id.innerHTML = json[i].id;
            cell_name.innerHTML = json[i].name
            cell_plan.innerHTML = json[i].plan
            cell_description.innerHTML = json[i].description
            cell_code.innerHTML = json[i].code

            let start_date = new Date(json[i].start_date)
            let finish_date = new Date(json[i].finish_date)

            cell_start_date.innerHTML = start_date.getDate() + "." + start_date.getMonth() + "." + start_date.getFullYear();
            cell_finish_date.innerHTML = finish_date.getDate() + "." + finish_date.getMonth() + "." + finish_date.getFullYear();

            cell_id.id = "id"+ json[i].id;
            cell_name.id = "name"+ json[i].id;
            cell_plan.id = "plan"+ json[i].id;
            cell_description.id = "description"+ json[i].id;
            cell_code.id = "code"+ json[i].id;
            cell_start_date.id = "start_date"+ json[i].id;
            cell_finish_date.id = "finish_date"+ json[i].id;

            row.id = "table_row" + i;

            row.onclick=function(){
                console.log("Row callback for i " + this.id)
                const id = parseInt(this.id.replace("table_row", ""))
                hubExpandEditPanel(id)
            }
        }
        const row = table.insertRow(0);
        row.insertCell(0).innerHTML = "ID"
        row.insertCell(1).innerHTML = "Name"
        row.insertCell(2).innerHTML = "Plan"
        row.insertCell(3).innerHTML = "Description"
        row.insertCell(4).innerHTML = "Code"
        row.insertCell(5).innerHTML = "Start date"
        row.insertCell(6).innerHTML = "Finish date"

        stopSpinning();

    }, function (statusCode) {
        notify("Something went wrong with subjects loading. Status code: " + statusCode);
        stopSpinning()
    });
    addHeader(request, 'access_token', getAccessToken());
    sendRequest(request, null);
}

function hubLoadGroups() {
    changeActivePage('Groups')
    edited_object = null;
    const container = document.getElementById("container")

    container.innerHTML = '<table id="groups_container"></table>';

    hubHideEditPanel();

    startSpinning()
    if(isAccessTokenExpired()){
        refresh_token(hubLoadGroups);
        return;
    }
    const request = createRequest("/web/parties", "GET", function (xmlHttpRequest) {
        console.log(xmlHttpRequest.responseText)
        const json = JSON.parse(xmlHttpRequest.responseText)
        const table = document.getElementById("groups_container")
        party_list = json;
        for(i in json){
            const row = table.insertRow(0);
            const cell_id = row.insertCell(0)
            const cell_name = row.insertCell(1)
            const cell_description = row.insertCell(2)
            const cell_code = row.insertCell(3)

            cell_id.innerHTML = json[i].id;
            cell_name.innerHTML = json[i].name
            cell_description.innerHTML = json[i].description
            cell_code.innerHTML = json[i].code

            cell_id.id = "id" + json[i].id;
            cell_id.name = "name" + json[i].id;
            cell_id.description = "description" + json[i].id;
            cell_id.code = "code" + json[i].id;


        }
        const row = table.insertRow(0);
        row.insertCell(0).innerHTML = "ID"
        row.insertCell(1).innerHTML = "Name"
        row.insertCell(2).innerHTML = "Description"
        row.insertCell(3).innerHTML = "Code"

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
    if(isAccessTokenExpired()){
        refresh_token(hubOpenModal(type));
        return;
    }
    modal.style.display = "none";
    const content = document.getElementById("modal-content");
    if(type === 'Subjects'){

        const request = createRequest("/web/subjects", 'GET', function (xmlHttpRequest) {
            modal.style.display = "block";
            console.log("Edited object subjects: " + edited_object.subjects);
            const text = xmlHttpRequest.responseText;
            const json = JSON.parse(text);
            let counter = 0;
            content.innerHTML = '';
            
            for(i in edited_object.subjects){
                content.innerHTML = content.innerHTML + '' +
                    '<button class="modal_button_down" onclick="ModalButtonCallback(this)" id="subject_modal_button'+edited_object.subjects[i].id+'">'+edited_object.subjects[i].name+'</button>'
                counter++;


                if(counter >= 3){
                    content.innerHTML = content.innerHTML + '<br>';
                    counter = 0;
                }
            }
            console.log("MODAL JSON: " + JSON.stringify(json))
            for(i in json){
                const jsonText = '{' +
                    '"id": 0, ' +
                    '"name": "name" ' +
                    '}';

                let item = JSON.parse(jsonText);
                item.name = json[i].name;
                item.id = json[i].id;

                if(!edited_object.subjects.includes(item)){

                    console.log("Modal trying to create button with id: " + "modal_button" + item.id + " for item " + JSON.stringify(item))
                    content.innerHTML = content.innerHTML + '' +
                        '<button id="subject_modal_button'+item.id+'" class="modal_button_up" onclick="ModalButtonCallback(this)">'+item.name+'</button>';
                    counter++;

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
        console.log("this should not work yet")
    }
}

function hubHideModal() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
}
function hubHideEditPanel() {
    const page = getActivePage();
    const editPanel = document.getElementById('edit_panel');
    edited_object = null;
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
            console.log("Edited object: " + JSON.stringify(edited_object))
        }else{
            edited_object = party_list[id];
        }
        editPanel.innerHTML='<table id="edit_table"></table>';
        const table = document.getElementById("edit_table");
        const row = table.insertRow(0);

        const edit_id = row.insertCell(0)
        const edit_name = row.insertCell(1)
        const edit_description = row.insertCell(2)
        const edit_code = row.insertCell(3)
        const edit_subjects = row.insertCell(4)
        const edit_participators = row.insertCell(5)


        edit_id.id="edit_id";

        edit_id.innerHTML = edited_object.id;
        edit_name.innerHTML = '<input type="text" id="edit_name" placeholder="Name">';
        edit_description.innerHTML = '<textarea id="edit_description" placeholder="Description"></textarea>'
        edit_code.innerHTML = '<input type="text" id="edit_code" placeholder="Code">'
        edit_subjects.innerHTML = '<button id="edit_subjects" class="serviceButton" onclick="hubOpenModal(\'Subjects\')">Subjects</button>'
        edit_participators.innerHTML = '<button id="edit_participators" class="serviceButton" onclick="hubOpenModal(\'Participators\')">Participators</button>'

        document.getElementById("edit_name").value = edited_object.name;
        document.getElementById("edit_description").value = edited_object.description;
        document.getElementById("edit_code").value = edited_object.code;

        edit_panel.innerHTML = edit_panel.innerHTML + '<div>' +
            '<button id="edit_save_button" class="serviceButton" onclick="hubEditSaveHandler()">Save</button>' +
            '<button class="add_button" onclick="hubHideEditPanel()">-</button>' +
            '<button id="edit_delete_button" class="serviceButton" onclick="hubEditDeleteHandler()">Delete</button>' +
            '</div>';

    }else if(page==='navSubjects'){
        console.log("Expand edit panel id: " + id);
        if(id === null){
            const jsonText = '{' +
                '"id": 0, ' +
                '"name": " ", ' +
                '"plan": 0, ' +
                '"description": " ", ' +
                '"start_date": " ", ' +
                '"finish_date": " ", ' +
                '"code": " " ' +
                '}';
            edited_object = JSON.parse(jsonText);
            console.log("Edited object: " + JSON.stringify(edited_object))
        }else{
            edited_object = subjects_list[id];
        }

        console.log("edit panel object: " + JSON.stringify(edited_object))


        editPanel.innerHTML='<table id="edit_table"></table>';
        const table = document.getElementById("edit_table");
        const row = table.insertRow(0)
        const edit_id = row.insertCell(0)
        const edit_name = row.insertCell(1)
        const edit_plan = row.insertCell(2)
        const edit_description = row.insertCell(3)
        const edit_code = row.insertCell(4)
        const edit_start = row.insertCell(5)
        const edit_finish = row.insertCell(6)
        const edit_parties = row.insertCell(7)
        const edit_hosts = row.insertCell(8)

        edit_id.innerHTML = edited_object.id;
        edit_name.innerHTML = '<input type="text" id="edit_name" placeholder="Name">'
        edit_plan.innerHTML = '<input type="number" id="edit_plan" placeholder="Plan">'
        edit_description.innerHTML = '<textarea id="edit_description" placeholder="Description"></textarea>'
        edit_code.innerHTML ='<input id="edit_code" type="text" placeholder="Code">'
        edit_start.innerHTML = '<input type="date" id="edit_start">'
        edit_finish.innerHTML = '<input type="date" id="edit_finish">'
        edit_parties.innerHTML = '<button id="edit_parties" class="serviceButton" onclick="hubOpenModal(\'Parties\')">Groups</button>'
        edit_hosts.innerHTML = '<button id="edit_hosts" class="serviceButton" onclick="hubOpenModal(\'Hosts\')">Hosts</button>'

        edit_panel.innerHTML = edit_panel.innerHTML + '<div>' +
            '<button id="edit_save_button" class="serviceButton" onclick="hubEditSaveHandler()">Save</button>' +
            '<button class="add_button" onclick="hubHideEditPanel()">-</button>' +
            '<button id="edit_delete_button" class="serviceButton" onclick="hubEditDeleteHandler()">Delete</button>' +
            '</div>';

        document.getElementById("edit_name").value = edited_object.name;
        document.getElementById("edit_plan").value = edited_object.plan;
        document.getElementById("edit_description").value = edited_object.description;
        document.getElementById("edit_code").value = edited_object.code;
        let start_date = new Date(edited_object.start_date)
        start_date = start_date.toISOString().substr(0, 10)
        console.log("start date " + start_date)
        document.getElementById("edit_start").value =start_date;
        let finish_date = new Date(edited_object.finish_date)
        finish_date = finish_date.toISOString().substr(0, 10)
        console.log('finish date ' + finish_date)
        document.getElementById("edit_finish").value = finish_date;
    }else{

    }
}
function hubEditDeleteHandler() {

}
function hubEditSaveHandler() {
    const page = getActivePage();
    if(page === "navGroups"){
        if(isAccessTokenExpired()){
            refresh_token(hubEditSaveHandler);
            return
        }
        startSpinning()
        edited_object.name = document.getElementById("edit_name").value.trim();
        edited_object.description = document.getElementById("edit_description").value.trim();
        edited_object.code= document.getElementById('edit_code').value.trim();

        const request = createRequest("/web/party", "POST", function (xmlHttpRequest) {
            stopSpinning()
            hubLoadGroups()
        }, function (statusCode) {
            notify("Request to upload group failed with code " + statusCode)
            stopSpinning()
        });
        addHeader(request, "access_token", getAccessToken());
        addHeader(request, "Content-Type", "application/json");
        edited_object.manager_id = -1;
        console.log("Trying to send group object: " + JSON.stringify(edited_object));
        sendRequest(request, JSON.stringify(edited_object));
    }else if(page === "navSubjects"){
        if(isAccessTokenExpired()){
            refresh_token(hubEditSaveHandler);
            return
        }
        startSpinning()

        edited_object.id = parseInt(document.getElementById("edit_id").innerText) ;
        edited_object.name = document.getElementById("edit_name").value.trim();
        edited_object.plan = parseInt(document.getElementById("edit_plan").value);
        edited_object.description = document.getElementById("edit_description").value.trim();
        edited_object.code = document.getElementById("edit_code").value.trim();
        edited_object.start_date = new Date(document.getElementById("edit_start").value);
        edited_object.start_date = edited_object.start_date.getTime()
        edited_object.finish_date = new Date(document.getElementById("edit_finish").value);
        edited_object.finish_date = edited_object.finish_date.getTime()

        const request = createRequest("/web/create_subject", "POST", function (xmlHttpRequest) {
            stopSpinning()
            hubLoadSubjects();
        }, function (statusCode) {
            stopSpinning()
            notify("Request to upload subject failed with status code: " + statusCode);
        })
        addHeader(request, "access_token", getAccessToken());
        addHeader(request, "Content-Type", "application/json");
        console.log("Trying to send group object: " + JSON.stringify(edited_object));
        sendRequest(request, JSON.stringify(edited_object));
    }
}