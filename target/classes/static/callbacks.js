function ModalButtonCallback(button) {
    if(button.id.includes('subject_modal_button')){
        const id = parseInt(button.id.replace("subject_modal_button", ""));
        const name = button.value;
        const jsonText = '{"id":'+id+',"name":"'+name+'"}'
        const jsonObject = JSON.parse(jsonText)
        if(button.className === 'modal_button_up'){
            edited_object.subjects.push(jsonObject);
            button.className = 'modal_button_down'
        }else if(button.className === 'modal_button_down'){
            const index = edited_object.subjects.indexOf(jsonObject);
            edited_object.subjects.splice(index, 1)
            button.className = 'modal_button_up'
        }
    }
}