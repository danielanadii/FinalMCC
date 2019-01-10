function logout(){
    sessionStorage.removeItem('userId');
    window.location.replace('/');
}

function homepage(){
    window.location.replace('/home');
}

function mycourse(){
    window.location.replace('/mycourse');
}

function getCourse(courseId) {
    let URL = "/detail_course";
    let userId = sessionStorage.getItem('userId');

    let option = {
        url: URL,
        type: "POST",
        data: {
            courseId: courseId
        }
    };

    let request = $.ajax(option);
    request.done(function (r) {
        $('#maincourse_name').text(r.course.Main_course);
        $('#course_name').text(r.course.Course_name);
        $('#video').attr('src', r.course.link);
        $('#course_description_name').text(r.course.Description);   

        let add = `<a onClick="save()" data-role="button" id="add">Add Course</a>`;
        let URL = '/searchCourse';

        let option = {
            url: URL,
            type: "POST",
            data: {
                userId: userId,
                courseId: courseId
            }
        }

        let request = $.ajax(option);
        request.done(function(r){
            if(r.message != "Found"){
                $("#Detail").append(add);
                $("#Detail").trigger("create");
            }
        });
    });
}

function save() {
    let para = window.location.search;
    let search = new URLSearchParams(para);
    let courseId = search.get('courseId');
    let userId = sessionStorage.getItem('userId');
    
    let url = '/assign_course'
    let option = {
        url: url,
        type: "POST",
        data: {
            courseId: courseId,
            userId: userId
        }
    }

    $.ajax(option);
    
    $("#add").hide();
}

$(function () {
    let para = window.location.search;
    let search = new URLSearchParams(para);
    let id = search.get('courseId');

    getCourse(id);
});