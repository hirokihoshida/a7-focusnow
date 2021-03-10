

//convert seconds to H:M:S
function secondsToTime(s) {
    var h = Math.floor(s / 3600);
    s -= h * 3600;
    var m = Math.floor(s / 60);
    s -= m * 60;
    return (m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s);
}



//0 = stopped, 1 = focus, 2 = short break, 3 = long break
var timerState = 0;

function buttonClicked() {
    if (timerState == 0) {
        $('#start-stop-btn').text("Stop Focus");
        startFocus();
    } else if (timerState == 1) {
        timerState == 0;
        $('#start-stop-btn').text("Start Focus");
        stopTimer();
    } else if (timerState == 2) {
        $('#start-stop-btn').text("Start Focus");
        timerState == 0;
        stopTimer();
    } else if (timerState == 3) {
        $('#start-stop-btn').text("Start Focus");
        timerState == 0;
        stopTimer();
    }
}

var timerID;
var timer = 0;
var timeNeeded;
var timeCompleted;

function startFocus() {
    $('.menu-btn').addClass("disabled");
    var focusTime = localStorage.getItem("focusTime");
    $('#start-stop-btn').text("Stop Focus");
    //if tasks list is empty
    var tasks = JSON.parse(localStorage.getItem("tasks"));
    if (tasks['tasks'].length == 0) {
        $('#start-stop-btn').removeClass("green").addClass("red");
        $('#start-stop-btn').text("No Tasks!");
        $('.menu-btn').removeClass("disabled");
        return;
    }
    $('#info-banner').text("Currently Focused on " + tasks['tasks'][0]['taskName']);
    timerState = 1;
    var taskID = tasks['tasks'][0]['taskID'];
    timeNeeded = parseInt(tasks['tasks'][0]['minutes']) * 60;
    //if time needed is less than focustime, set the timer to time needed
    if (timer == 0) {
        if (timeNeeded < focusTime) {
            timer = timeNeeded;
        } else {
            timer = focusTime;
        }
    }

    timeCompleted = timer;
    //start focus timer
    timerID = setInterval(function () {
        //write time
        $('#time').html(secondsToTime(timer));
        timer -= 1
        //if timer is done, delete timer
        if (timer < 0) {
            timer = 0;
            clearInterval(timerID);
            //if time needed is 0, delete the task. otherwise, subtract the time completed from time needed on task
            timeNeeded = timeNeeded - timeCompleted;
            if (timeNeeded <= 0) {
                $('#info-banner').text("Taking a Break After Finishing " + tasks['tasks'][0]['taskName']);
                deleteTask(taskID.toString());
                var tasksRemaining = JSON.parse(localStorage.getItem("tasks"));
                if (tasksRemaining['tasks'].length == 0) {
                    $('#info-banner').text("You Finished All Your Tasks!");
                    return;
                }
                startBreakLong();
            } else {
                tasks['tasks'][0]['minutes'] = Math.floor(timeNeeded / 60);
                localStorage.setItem("tasks", JSON.stringify(tasks));
                $('#info-banner').text("Taking a Short Break From " + tasks['tasks'][0]['taskName']);
                startBreakShort();
            }
        }
    }, 1000)
}

function startBreakShort() {
    timerState = 2;
    $('#start-stop-btn').text("Stop Short Break");
    var breakShortTime = localStorage.getItem("breakShortTime");
    timer = breakShortTime;
    console.log(timer);
    timerID = setInterval(function () {
        //write time
        $('#time').html(secondsToTime(timer));
        timer -= 1
        //if timer is done, delete timer
        if (timer < 0) {
            clearInterval(timerID);
            startFocus();
        }
    }, 1000)
}

function startBreakLong() {
    timerState = 3;
    $('#start-stop-btn').text("Stop Long Break");
    var breakLongTime = localStorage.getItem("breakLongTime");
    timer = breakLongTime
    timerID = setInterval(function () {
        //write time
        $('#time').html(secondsToTime(timer));
        timer -= 1
        //if timer is done, delete timer
        if (timer < 0) {
            clearInterval(timerID);
            startFocus();
        }
    }, 1000)
}

function stopTimer() {
    $('.menu-btn').removeClass("disabled");
    if (timerState == 1) {
        var tasks = JSON.parse(localStorage.getItem("tasks"));
        if (timeNeeded - (timeCompleted - timer) >= 0) {
            timeNeeded = timeNeeded - (timeCompleted - timer);
            tasks['tasks'][0]['minutes'] = Math.floor(timeNeeded / 60);
            localStorage.setItem("tasks", JSON.stringify(tasks));
        } else {
            tasks['tasks'][0]['minutes'] = Math.floor(timeNeeded / 60);
            localStorage.setItem("tasks", JSON.stringify(tasks));
        }
    } else if (timerState == 2 || timerState == 3) {
        timer = 0;
    }
    clearInterval(timerID);
    timerState = 0;
}

function saveTiming() {
    var timings = $('#settings-form').serializeArray();
    timings = timings.reduce(function (acc, cur, i) {
        acc[cur.name] = cur.value;
        return acc;
    }, {});
    localStorage.setItem("focusTime", timings['focusTime'] * 60);
    localStorage.setItem("breakShortTime", timings['breakShortTime'] * 60);
    localStorage.setItem("breakLongTime", timings['breakLongTime'] * 60);
}

function resetTiming() {
    localStorage.setItem("focusTime", 60 * 25);
    localStorage.setItem("breakShortTime", 60 * 5);
    localStorage.setItem("breakLongTime", 60 * 10);
    location.reload();
}

function addTask() {
    // get task ID
    if (localStorage.getItem("taskID") == null) {
        localStorage.setItem("taskID", 0);
    }
    var taskID = localStorage.getItem("taskID");

    //read new task, JSONify and add task ID
    var task = $('#addTaskForm').serializeArray();
    task = task.reduce(function (acc, cur, i) {
        acc[cur.name] = cur.value;
        return acc;
    }, {});
    task['taskID'] = taskID
    //read task list, push new task, sort list by prio
    var tasks = JSON.parse(localStorage.getItem("tasks"));
    tasks['tasks'].push(task);
    tasks['tasks'] = tasks['tasks'].sort(function (obj1, obj2) {
        return obj2.priority - obj1.priority;
    });
    //set new task list, iterate task ID
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("taskID", parseInt(taskID) + 1);
}

function editTask(taskID) {
    //read new task, JSONify and add task ID
    var task = $('#' + taskID + "-form").serializeArray();
    console.log(task);
    task = task.reduce(function (acc, cur, i) {
        acc[cur.name] = cur.value;
        return acc;
    }, {});
    console.log(task);
    task['taskID'] = taskID;
    //delete old task with same ID, push new task, sort list by prio
    deleteTask(taskID);
    var tasks = JSON.parse(localStorage.getItem("tasks"));
    tasks['tasks'].push(task);
    tasks['tasks'] = tasks['tasks'].sort(function (obj1, obj2) {
        return obj2.priority - obj1.priority;
    });
    //set new task list
    localStorage.setItem("tasks", JSON.stringify(tasks));
    location.reload();
}

function deleteTask(taskID) {
    //remove task from collection as well as modal html
    $("." + taskID).remove();
    //pull local storage tasks, iterate and find task to delete by ID, splice it out
    var tasks = JSON.parse(localStorage.getItem("tasks"));
    for (let [i, task] of tasks['tasks'].entries()) {
        if (task.taskID == taskID) {
            tasks['tasks'].splice(i, 1);
        }
    }
    //push new tasks to local storage
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


$(document).ready(function () {
    M.AutoInit();
    timerState = 0;
    //first initialization add focus and break times
    if (localStorage.getItem("focusTime") == null) {
        localStorage.setItem("focusTime", 60 * 25);
        localStorage.setItem("breakShortTime", 60 * 5);
        localStorage.setItem("breakLongTime", 60 * 10);
    }
    $('#time').html(secondsToTime(localStorage.getItem("focusTime")));
    // if task list is empty create task list
    if (localStorage.getItem("tasks") == null) {
        localStorage.setItem("tasks", JSON.stringify({ tasks: [] }));
    }
});
