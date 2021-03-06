Year = 109
Semester = 1
AllCourse = {}
CourseSelectedList = []

function save(){
    localStorage.setItem("CourseSelectedList",JSON.stringify(CourseSelectedList));
}

function load(){
    CourseSelectedList = localStorage.getItem("CourseSelectedList");
    CourseSelectedList = JSON.parse(CourseSelectedList);
    if(CourseSelectedList==null){
        CourseSelectedList = []
    }
}

function gentable(){
    TimeList = ["M","N","A","B","C","D","X","E","F","G","H","Y","I","J","K","L"];
    TimeStatement = ["6:00 ~ 6:50","7:00 ~ 7:50","8:00 ~ 8:50","9:00 ~ 9:50","10:10 ~ 11:00","11:10 ~ 12:00","12:20 ~ 13:10","13:20 ~ 14:10","14:20 ~ 15:10","15:30 ~ 16:20","16:30 ~ 17:20","17:30 ~ 18:20","18:30 ~ 19:20","19:30 ~ 20:20","20:30 ~ 21:20","21:30 ~ 22:20"]
    Tid=0;
    TimeList.forEach(T => {
        //console.log(T);
        tr = `<tr id="R-${T}"><td scope="row">${T}-(${TimeStatement[Tid++]})</td>`;
        for(D=1;D<=7;D++){
            tr += `<td id="E-${D}${T}" class="TableElement" align='center' style="vertical-align: middle;"></td>`;
        }
        tr += `</tr>`;
        $("#timetable tbody").append(tr);
    });
}

function parseTime(timeCode){
    re = /[1-7][A-Z]+/g;
    timelist = timeCode.match(re);
    res = [];
    timelist.forEach(T => {
        for(i=1;i<T.length;i++){
            res.push(T[0]+T[i]);
        }
    });
    return res;
}

function getCourseData(CourseID){
    id = `${Year}${Semester}_${CourseID}`;
    if(! (id in AllCourse)){
        alert(`Course ID ${CourseID} not found`);
        return false;
    }
    return AllCourse[id];
}

function showTable(CourseList = CourseSelectedList){
    $("#timetable tbody").empty();
    gentable();
    CourseList.forEach(CourseID => {
        Course = getCourseData(CourseID);
        timelist = parseTime(Course['time']);
        for(i=0;i<timelist.length;i++){
            //close = `<button type="button" class="close" aria-label="Close" name="${Course['id']}"><span aria-hidden="true">&times;</span></button>`
            html = `<button type="button" class="btn btn-outline-secondary course" name="${Course['id']}">${Course['name']}</button><br>`
            $(`#E-${timelist[i]}`).append(html);
        }
    });
}

function AddCourse(CourseID){
    if(CourseSelectedList.includes(CourseID)){
        alert("The course had been added.");
        return ;
    }
    CourseSelectedList.push(CourseID);
    save();
    showTable();
}

function DeleteCourse(CourseID){
    if(!CourseSelectedList.includes(CourseID)){
        alert("The course hadn'd been added.");
        return ;
    }
    CourseSelectedList.splice(CourseSelectedList.indexOf(CourseID),1);
    save();
    showTable();
}

function setCourseInfoModal(CourseID){
    Course = getCourseData(CourseID);
    $("#CourseInfoModal-Title").html(Course["name"]);
    $("#CourseInfoModal-info ul").empty();
    $("#CourseInfoModal-info ul").append(`<li>當期課號： ${Course["id"]}</li>`);
    $("#CourseInfoModal-info ul").append(`<li>授課教師： ${Course["teacher"]}</li>`);
    $("#CourseInfoModal-info ul").append(`<li>時段教室： ${Course["time"]}</li>`);
    $("#CourseInfoModal-info ul").append(`<li>學　　分： ${Course["credit"]}</li>`);
    $("#CourseInfoModal-Delete").attr("name",CourseID);
}

$( document ).ready(function() {
    jQuery.ajaxSetup({async:false});
    $.get(`${Year}${Semester}-data.json`,function(data,status){
        if(status != "success"){
            alert("Couldn't get course data!!");
        }
        //console.log(data);
        AllCourse = data;
    });
    jQuery.ajaxSetup({async:true});
    gentable();
    load();
    showTable();
    $("#timetable").on("mouseenter",".course",function(){
        id = $(this).attr("name");
        $(`button[name=${id}]`).addClass("active");
    });
    $("#timetable").on("mouseleave",".course",function(){
        id = $(this).attr("name");
        $(`button[name=${id}]`).removeClass("active");
    });

    $("#timetable").on("click",".course",function(){
        id = $(this).attr("name");
        id = parseInt(id);
        setCourseInfoModal(id);
        $('#CourseInfoModal').modal('show');
    });
    
    $("#AddCourseID").keypress(function(e){
        code = (e.keycode ? e.keycode : e.which);
        if (code==13){
            $("#AddCourseButton").click();
        }
    });

    $("#AddCourseButton").click(function(){
        id = $("#AddCourseID").val();
        if(id==""){
            alert("Please enter a course id");
            return ;
        }
        id = parseInt(id);
        $("#AddCourseID").val("");
        AddCourse(id);
    });

    $("#CourseInfoModal-Delete").click(function(){
        id = $(this).attr("name");
        id = parseInt(id);
        DeleteCourse(id);
        $('#CourseInfoModal').modal('hide');
    });
});
