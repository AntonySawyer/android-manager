//Check user & session
var localDB = null;
check_session();
//Login-form
function check_user(){
    var username = document.login_form.username.value;
    var password = document.login_form.password.value;
    var query = "SELECT * FROM operators where username=?;";
    try {
        localDB.transaction(function(transaction){
            transaction.executeSql(query, [username], function(transaction, results){
            var row = results.rows.item(0);
            var true_password = row['password'];
                if (true_password == password) {
                    alert('Success!');
                    sessionStorage.setItem("current_user", username);
                } else {
                    alert('Wrong password!');
                }                
                }, function(transaction, error){
                    updateStatus("Error: " + error.code + "<br>Message: " + error.message);
                });
            });
        } 
        catch (e) {
            updateStatus("Error: Unable to select data from the db " + e + ".");
        }
}
//current session, to fix the data when the page is reloaded
function check_session(){
    if (sessionStorage.getItem("current_user") != '') {
        var x = sessionStorage.getItem("current_user");
        document.getElementById('profile').innerHTML = "Current user: <b>" + x + "</b> <a href=\"\" onclick=\"clear_session()\">(Log out)</a>";
    } else {
        document.getElementById('profile').innerHTML = "You must login";
    }
}
//Initialization webSQL db
function onInit(){
    check_session(); 
    try {
        if (!window.openDatabase) {
            updateStatus("Error: DB not supported");
        }
        else {
            initDB();
            createTables();
            queryAndUpdateOverview();
            queryAndUpdateOverviewAndroid();
        }
    } 
    catch (e) {
        if (e == 2) {
            updateStatus("Error: Invalid database version.");
        }
        else {
            updateStatus("Error: Unknown error " + e + ".");
        }
        return;
    }
}

function initDB(){
    var shortName = 'AndroidManagerDB';
    var version = '1.0';
    var displayName = 'AndroidManagerDB';
    var maxSize = 5*1024*1024; // in bytes
    localDB = window.openDatabase(shortName, version, displayName, maxSize);
}

function createTables(){
    try {
        localDB.transaction(function(transaction){
            transaction.executeSql('CREATE TABLE IF NOT EXISTS operators (operator_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)');
            updateStatus("You can Log In.");
        });
    } 
    catch (e) {
        updateStatus("Error: Unable to login: " + e + ".");
        return;
    }    
    try {
        localDB.transaction(function(transaction){
            transaction.executeSql('CREATE TABLE IF NOT EXISTS jobs (job_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, job_name TEXT, job_complexity INTEGER, job_description TEXT)');
            updateStatus("Table 'jobs' is ready");
        });
    } 
    catch (e) {
        updateStatus("Error: Unable to create table 'jobs' " + e + ".");
        return;
    }    
    try {
        localDB.transaction(function(transaction){
            transaction.executeSql('CREATE TABLE IF NOT EXISTS androids (android_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, android_name TEXT, android_avatar TEXT, android_skills TEXT, android_reliability INTEGER, android_status INTEGER, job_id INTEGER)');
            updateStatus("Table 'jobs and androids' is ready");
        });
    } 
    catch (e) {
        updateStatus("Error: Unable to create table 'androids' " + e + ".");
        return;
    }
}
//function to log out
function clear_session(){
    sessionStorage.setItem("current_user", '');
    check_session();
}
//to add new operator
function registration(){
    var username = prompt("Please enter your username", "");
    var password = prompt("Please enter your password", "");
    if (username == "" || password == "" || username == undefined || password == undefined) {
        alert("It's can't be empty.");        
    } else {
        localDB.transaction(function(transaction) {
            transaction.executeSql('INSERT INTO operators (username, password) VALUES (?,?)', [username, password], function(transaction, result) {
                alert('Operator #' + result.insertId + ' created.');
            }, function(transaction, error) {
                alert(error);
            });
    });
}
}

//change current section (hidden another by classname)
function another_section(id){
    if (sessionStorage.getItem("current_user") != '') {
        var parentDOM = document.getElementById("main");
        var Target = parentDOM.getElementsByClassName("active")[0];
        if (Target != undefined) {
            Target.setAttribute('class', 'deactivate');            
            }
        document.getElementById(id).setAttribute('class', 'active');
    } else {
        alert("You must login");
    }
}

//return target page to another function
function current_page(){
    var current_page = location.hash;
    if (current_page == "#job") {
        another_section('job_container');
        return 'job';
    } else if (current_page == "#android"){
        another_section('android_container');        
        return 'android';
    } else if (current_page == "#about"){
        another_section('about');
        return 'about';
    } else {
        another_section('login_section'); 
        return 'login';
    }
    check_session(); 
}
//validate data and check target page and purpose of buttons
function check_fields(target, button) {
    switch (target) {
        case 'job':
    var job_name =        document.job_list_input.job_name.value;
    var job_complexity =  document.job_list_input.job_complexity.value;
    alert(job_complexity);
    var job_description = document.job_list_input.job_description.value;
        if (job_name == "" || job_name.length < 2 || job_name.length > 16 || job_complexity =="" || job_description == "" || job_description.length < 0 || job_description.length > 255 ){
            alert('Check fields!');
            break;
        } else {
            switch (button) {
                case 'create':
                    onCreate();
                break;
                case 'update':
                    onUpdate();
                break;
                case 'delete':
                    onDelete();
                break;
            }            
        }
        break;
        case 'android':
    var android_name    = document.android_list_input.android_name.value;
        if (android_name == "" || android_name.length < 5 || android_name.length > 24) {
            break;
        } else {
            switch (button) {
                case 'create':
                    onCreate();
                break;
                case 'update':
                    onUpdate();
                break;
                case 'delete':
                    onDelete();
                break;
            }        
        }
        break;
}
}
//Fill in the drop-down list for asign androids to job
function option_list(){
    var query = "SELECT jobs.job_id, jobs.job_name FROM jobs"
    try {
        localDB.transaction(function(transaction){
            transaction.executeSql(query, [], function(transaction, results){
                for (var i = 0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    var option = document.createElement("option");
                    option.setAttribute("value", row['job_id']);
                    option.innerHTML =  row['job_name'];
                    document.getElementById("android_in_job").appendChild(option);
                }
            }, function(transaction, error){
                updateStatus("Error: " + error.code + "<br>Message: " + error.message);
            });
        });
    } 
    catch (e) {
        updateStatus("Error: Unable to select data from the db " + e + ".");
    }
    list_of_free_androids();
    list_of_assigned_androids();
}

//List of androids + job on sidebar in 'job' page
function list_of_assigned_androids(){
    var query = "SELECT jobs.job_id, jobs.job_name, androids.android_name, androids.android_id FROM jobs INNER JOIN androids ON androids.job_id = jobs.job_id ORDER BY androids.android_id ASC"
    try {
        localDB.transaction(function(transaction){
            transaction.executeSql(query, [], function(transaction, results){
                for (var i = 0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    var tr = document.createElement("tr");
                    tr.innerHTML =  "<td>#"
                                    + row['android_id']
                                    + '</td><td>'
                                    + row['android_name']
                                    + '</td><td>'
                                    + row['job_name']
                                    + '</td>';
                    document.getElementById("list_of_assigned_androids").appendChild(tr);
                }
            }, function(transaction, error){
                updateStatus("Error: " + error.code + "<br>Message: " + error.message);
            });
        });
    } 
    catch (e) {
        updateStatus("Error: Unable to select data from the db " + e + ".");
    }    
}

//List of free androids on sidebar in 'android' page
function list_of_free_androids(){
    var query = "SELECT androids.android_name, androids.android_id FROM androids WHERE job_id = 0 ORDER BY android_id ASC"
    try {
        localDB.transaction(function(transaction){
            transaction.executeSql(query, [], function(transaction, results){
                for (var i = 0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    var tr = document.createElement("tr");
                    tr.innerHTML =  "<td>#"
                                    + row['android_id']
                                    + '</td><td>'
                                    + row['android_name']
                                    + '</td><td>';
                    document.getElementById("list_of_free_androids").appendChild(tr);

                }
            }, function(transaction, error){
                updateStatus("Error: " + error.code + "<br>Message: " + error.message);
            });
        });
    } 
    catch (e) {
        updateStatus("Error: Unable to select data from the db " + e + ".");
    }
}

//query db and view update
function queryAndUpdateOverview(){
//remove old table rows
    var dataRows = document.getElementById("job_list_output").getElementsByClassName("data");
    
    while (dataRows.length > 0) {
        row = dataRows[0];
        document.getElementById("job_list_output").removeChild(row);
    };
//read db data and create new table rows
    var query = "SELECT jobs.job_id, jobs.job_name, jobs.job_complexity, jobs.job_description, androids.android_name, androids.android_id FROM jobs LEFT JOIN androids ON androids.job_id = jobs.job_id"
    try {
        localDB.transaction(function(transaction){
        
            transaction.executeSql(query, [], function(transaction, results){
                for (var i = 0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    var div = document.createElement("div");
                    div.setAttribute("id", 'j' + row['job_id']);
                    div.setAttribute("class", "data default_list");
                    div.setAttribute("onclick", "onSelect(this)");
                    div.innerHTML = "<h3>" 
                                    + row['job_name'] 
                                    + "</h3><p> Complexity: " 
                                    + row['job_complexity'] 
                                    + "</p><p>Description: " 
                                    + row['job_description'] 
                                    + "</p><p class=\"current_android "
                                    + row['android_name']
                                    + "\">Assigned android: "
                                    + row['android_id']
                                    + " - "
                                    + row['android_name']
                                    + "</p><hr>";
                    document.getElementById("job_list_output").appendChild(div);
                }
            }, function(transaction, error){
                updateStatus("Error: " + error.code + "<br>Message: " + error.message);
            });
        });
    } 
    catch (e) {
        updateStatus("Error: Unable to select data from the db " + e + ".");
    }
    option_list();
    current_page();
}
//the same for androids
function queryAndUpdateOverviewAndroid(){
    var dataRows = document.getElementById("android_list_output").getElementsByClassName("data");
    
    while (dataRows.length > 0) {
        row = dataRows[0];
        document.getElementById("android_list_output").removeChild(row);
    };
    var query = "SELECT * FROM androids LEFT JOIN jobs ON androids.job_id = jobs.job_id;";
    try {
        localDB.transaction(function(transaction){
        
            transaction.executeSql(query, [], function(transaction, results){
                for (var i = 0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    var div = document.createElement("div");
                    div.setAttribute("id", 'a' + row['android_id']);
                    div.setAttribute("class", "data default_list");
                    div.setAttribute("onclick", "onSelect(this)");
                    div.innerHTML = "<h3> #" 
                                    + row['android_id']
                                    + ' - '
                                    + row['android_name'] 
                                    + "</h3><p>Avatar: " 
                                    + row['android_avatar'] 
                                    + "</p><p>Skills: " 
                                    + row['android_skills'] 
                                    + "</p><p>Reliability: " 
                                    + row['android_reliability'] 
                                    + "</p><p>Status: " 
                                    + row['android_status'] 
                                    + "</p><p class = \"current_job "
                                    + row['job_name']
                                    +"\">Current job: " 
                                    + row['job_name']
                                    +"</p><hr>";
                    document.getElementById("android_list_output").appendChild(div);
                }
            }, function(transaction, error){
                updateStatus("Error: " + error.code + "<br>Message: " + error.message);
            });
        });
    } 
    catch (e) {
        updateStatus("Error: Unable to select data from the db " + e + ".");
    }
}
////query for "Create"
function onCreate(){
    var target = current_page();
    switch (target) {
        case 'job':
            var job_name = document.job_list_input.job_name.value;
            var job_complexity = document.job_list_input.job_complexity.value;
            var job_description = document.job_list_input.job_description.value;
            var query = "INSERT INTO jobs (job_name, job_complexity, job_description) VALUES (?, ?, ?);";
                try {
                    localDB.transaction(function(transaction){
                        transaction.executeSql(query, [job_name, job_complexity, job_description]);
                    });
                } 
                catch (e) {
                    updateStatus("Error: Unable to perform an INSERT " + e + ".");
                }
        break;
        case 'android':
            var android_name = document.android_list_input.android_name.value;
            var android_avatar = document.android_list_input.android_avatar.value;
            var android_skills = document.android_list_input.android_skills.value;
            var android_reliability = document.android_list_input.android_reliability.value;
            var android_status = document.android_list_input.android_status.value;
            var job_id = document.android_list_input.android_in_job.value;
                var query = "INSERT INTO androids (android_name, android_avatar, android_skills, android_reliability, android_status, job_id) VALUES (?, ?, ?, ?, ?, ?);";
                try {
                    localDB.transaction(function(transaction){
                        transaction.executeSql(query, [android_name, android_avatar, android_skills, android_reliability, android_status, job_id]);
                    });
                } 
                catch (e) {
                    updateStatus("Error: Unable to perform an INSERT " + e + ".");
                }
        break;
    }
}
//change view to default, for 'Clear' button
function clear_select() {
    var target = current_page();
        if (target == 'job') {
            var parentDOM = document.getElementById("job_list_output");
        } else if (target == 'android'){
            var parentDOM = document.getElementById("android_list_output");
          }
    var selected = parentDOM.getElementsByClassName("selected_list")[0];
        if (selected != undefined) {
            selected.setAttribute('class', 'data default_list');
        }
    document.getElementById('android_status_repair').setAttribute('class', 'hidden_button');        
}
//query for "Delete"
function onDelete(){
    var target = current_page();
    switch (target) {
        case 'job':
            var id = document.job_list_input.id.value;
            var query = "DELETE FROM jobs WHERE job_id=?;";
            try {
                localDB.transaction(function(transaction){
                    transaction.executeSql(query, [id]);
                });
            } 
            catch (e) {
                updateStatus("Error: Unable to perform an DELETE " + e + ".");
            }
        break;
        case 'android':
            var id = document.android_list_input.id.value;
            var query = "DELETE FROM androids WHERE android_id=?;";
            try {
                localDB.transaction(function(transaction){
                    transaction.executeSql(query, [id]);
                });
            } 
            catch (e) {
                updateStatus("Error: Unable to perform an DELETE " + e + ".");
            }
        break;                
    }
}
//get id of item (in page add 'j' and 'a' to unique id for jobs and androids)
function get_id(full_id){
    var id = full_id.substring(1);
    return id;
}
//fill in inputs when item is selected and change the style of selected div
function onSelect(htmlElement){
    var id = htmlElement.getAttribute("id");
    clear_select();
    document.getElementById(id).setAttribute("class", "data selected_list");
    var target = current_page();
    var id = get_id(id);
    switch (target) {
        case 'job':
            query = "SELECT * FROM jobs where job_id=?;";
            try {
                localDB.transaction(function(transaction){
                    transaction.executeSql(query, [id], function(transaction, results){
                        var row = results.rows.item(0);
                        updateForm(row['job_id'], row['job_name'], row['job_complexity'], row['job_description']);
                    }, function(transaction, error){
                        updateStatus("Error: " + error.code + "<br>Message: " + error.message);
                    });
                });
            } 
            catch (e) {
                updateStatus("Error: Unable to select data from the db " + e + ".");
            }
        break;
        case 'android':
           document.getElementById('android_status_repair').setAttribute('class', 'hidden_button');
           query = "SELECT * FROM androids where android_id=?;";
            try {
                localDB.transaction(function(transaction){
                    transaction.executeSql(query, [id], function(transaction, results){
                        var row = results.rows.item(0);
                        updateFormAndroid(row['android_id'], row['android_name'], row['android_avatar'], row['android_skills'], row['android_reliability'], row['android_status'], row['job_id'], row['job_id']);
                    }, function(transaction, error){
                        updateStatus("Error: " + error.code + "<br>Message: " + error.message);
                    });
                });
            } 
            catch (e) {
                updateStatus("Error: Unable to select data from the db " + e + ".");
            }
        break;
    }
}
//reclaim android reliability and status
function android_repair(){
    document.android_list_input.android_status.value = 1;  
    document.android_list_input.android_reliability.value = 10;  
    document.getElementById('android_status_repair').setAttribute('class', 'hidden_button');
}
//query for "Update" button
function onUpdate(){
    var target = current_page();
    switch (target) {
        case 'job':
            var id = document.job_list_input.id.value;
            var job_name = document.job_list_input.job_name.value;
            var job_complexity = document.job_list_input.job_complexity.value;
            var job_description = document.job_list_input.job_description.value;
            var query = "UPDATE jobs SET job_name=?, job_complexity=?, job_description=? WHERE job_id=?;";
                try {
                    localDB.transaction(function(transaction){
                        transaction.executeSql(query, [job_name, job_complexity, job_description, id]);
                    });
                } 
                catch (e) {
                    updateStatus("Error: Unable to perform an UPDATE " + e + ".");
                }
        break;
        case 'android':
           document.getElementById('android_status_repair').setAttribute('class', 'hidden_button');
            var id = document.android_list_input.id.value;
            var android_name = document.android_list_input.android_name.value;
            var android_avatar = document.android_list_input.android_avatar.value;
            var android_skills = document.android_list_input.android_skills.value;
            var job_id = document.android_list_input.android_in_job.value;
            var job_check = document.android_list_input.job_check.value;
            if(job_id == job_check){
                var android_reliability = document.android_list_input.android_reliability.value;
                var android_status = document.android_list_input.android_status.value;
            } else {
                var android_reliability = document.android_list_input.android_reliability.value - 1;
            }
                if (android_reliability < 0){
                    var android_status = 0;
                    var android_reliability = 0;
                    alert('Android should be reclaimed first!');
                    break;
                } else if (android_reliability == 0) {
                    var android_status = 0;
                } else {
                var android_status = 1;                    
                }
                    var default_id = '0';
                    var current_id = job_id;
                    var query = "UPDATE androids SET job_id=? WHERE job_id=?;";
                    try {
                        localDB.transaction(function(transaction){
                            transaction.executeSql(query, [default_id, current_id]);
                        });
                    } 
                    catch (e) {
                        updateStatus("Error: Unable to perform an INSERT " + e + ".");
                    }
            var query = "UPDATE androids SET android_name=?, android_avatar=?, android_skills=?, android_reliability=?, android_status=?, job_id=? WHERE android_id=?;";
                try {
                    localDB.transaction(function(transaction){
                        transaction.executeSql(query, [android_name, android_avatar, android_skills, android_reliability, android_status, job_id, id]);
                   });
                } 
                catch (e) {
                    updateStatus("Error: Unable to perform an UPDATE " + e + ".");
                }     
        break;
}
}

// to update status information
function updateStatus(status){
    document.getElementById('status').innerHTML = "<b>Current status: </b>" + status;
}
//to update forms
function updateForm(id, job_name, job_complexity, job_description){
    document.job_list_input.id.value = id;
    document.job_list_input.job_name.value = job_name;
    document.job_list_input.job_complexity.value = job_complexity;
    document.job_list_input.job_description.value = job_description;
}

function updateFormAndroid(id, android_name, android_avatar, android_skills, android_reliability, android_status, job_id, job_check){
    document.android_list_input.id.value = id;
    document.android_list_input.android_name.value = android_name;
    document.android_list_input.android_avatar.value = android_avatar;
    document.android_list_input.android_skills.value = android_skills;
    document.android_list_input.android_reliability.value = android_reliability;
    document.android_list_input.android_status.value = android_status;
    document.android_list_input.android_in_job.value = job_id;
    document.android_list_input.job_check.value = job_id;
        if (android_status == 0) {
            document.getElementById('android_status_repair').setAttribute('class', '');
        } else {
            document.getElementById('android_status_repair').setAttribute('class', 'hidden_button');
        }
}

//add demo-data
function demo_data(){
        localDB.transaction(function(transaction) {
            transaction.executeSql('INSERT INTO operators (username, password) VALUES (\'root\',\'1111\');')
            transaction.executeSql('INSERT INTO jobs (job_name, job_complexity, job_description) VALUES (\'Jump\', \'4\', \'Job description #1\');')
            transaction.executeSql('INSERT INTO jobs (job_name, job_complexity, job_description) VALUES (\'Sleep\', \'2\', \'Job description #2\');')
            transaction.executeSql('INSERT INTO jobs (job_name, job_complexity, job_description) VALUES (\'Eat\', \'6\', \'Job description #3\');')
            transaction.executeSql('INSERT INTO jobs (job_name, job_complexity, job_description) VALUES (\'Develop-a-rocket\', \'9\', \'Job description #4\');')
            transaction.executeSql('INSERT INTO jobs (job_name, job_complexity, job_description) VALUES (\'Read-a-book\', \'8\', \'Job description #5\');')
            transaction.executeSql('INSERT INTO androids (android_name, android_avatar, android_skills, android_reliability, android_status, job_id) VALUES (\'Charlie\', \'charlie.png\', \'making a sandwich\', \'10\', \'1\', \'3\');')
            transaction.executeSql('INSERT INTO androids (android_name, android_avatar, android_skills, android_reliability, android_status, job_id) VALUES (\'Barbie\', \'barbie.png\', \'sort potatoes\', \'10\', \'1\', \'0\');')
            transaction.executeSql('INSERT INTO androids (android_name, android_avatar, android_skills, android_reliability, android_status, job_id) VALUES (\'Chester\', \'chester.png\', \'sing a song\', \'10\', \'1\', \'2\');')
            transaction.executeSql('INSERT INTO androids (android_name, android_avatar, android_skills, android_reliability, android_status, job_id) VALUES (\'Elon\', \'elon.png\', \'different things\', \'10\', \'1\', \'4\');')
        });
    alert('Done! You can login by root with pass: 1111')
}