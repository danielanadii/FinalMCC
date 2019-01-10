$(function(){
    $("#formLogin").submit(login);
})

function login(e){
    e.preventDefault();
    let email = $("#email").val();
    let password = $("#password").val();

    let option = {
        url: '/doLogin',
        type: 'POST',
        data: {
            email: email,
            password: password
        }
    }

    let request = $.ajax(option);

    request.done(function(r){
        if(r.status === "SUCCESS"){
            let data = JSON.stringify(r.user.id);
            sessionStorage.setItem('userId', data);
            window.location.href = '/home';
        } else{
            alert(r.message);
            window.location.href = '/home';
        }
    });
}