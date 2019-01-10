var id = 1;
jQuery(document).ready(function($){
    let para = window.location.search;
    let search = new URLSearchParams(para);
    
    if(search.has("userData")){
        let data = search.get('userData');
        data = JSON.parse(data);
        let facebookId = data.facebookId;
        let displayName = data.displayName;
        let email = data.email[0].value;
        $('#facebookID').val(facebookId);
        $('#Name').val(displayName);
        $('#Email').val(email);
    }

    $("#formRegister").submit(register);
});

function register(e){
    e.preventDefault();
    let para = window.location.search;
    let search = new URLSearchParams(para);
    
    if(search.has("userData")){
        let facebookId = $("#facebookID").val();
        let nama = $("#Name").val();
        let email = $("#Email").val();
        let password = $("#Password").val();
        let phone = $("#phoneNumber").val();

        let option = {
            url: '/doRegisterFb',
            type: 'POST',
            data: {
                id: facebookId,
                nama: nama,
                email: email,
                password: password,
                phonenumber: phone
            }
        }

        let request = $.ajax(option);
        request.done(function(r){
            if (r.status === "SUCCESS") { 
                let data = JSON.stringify(r.user.id);
                sessionStorage.setItem('userId', data);
                window.location.href = '/home';
            } else {
                alert(r.message);
            }
        })
    }else{
        let nama = $("#Name").val();
        let email = $("#Email").val();
        let password = $("#Password").val();
        let phone = $("#phoneNumber").val();

        let option = {
            url: '/doRegister',
            type: 'POST',
                data: {
                    nama: nama, 
                    password: password,
                    email: email,
                    phonenumber: phone
                }
        };

        let request = $.ajax(option);
        request.done(function (r) {
            if (r.status === "SUCCESS") { 
                id++;
                let data = JSON.stringify(r.user.id);
                sessionStorage.setItem('userId', data);
                window.location.href = '/home';
            }   else {
                alert(r.message);
            }
        });
    }   
}
