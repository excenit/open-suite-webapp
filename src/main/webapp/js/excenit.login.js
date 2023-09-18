$(function(){
    function loginSettings(){
        return settings = {
            "url": URL+"/login.jsp",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify({
                "username": "<%= restApiUsername %>",
                "password": "<%= restApiPassword %>"
            }),
        };
    }

    async function login(){
        return $.ajax(loginSettings())
            .then((data, statusText, xhr) => xhr.status);
    }

    function logout(){
        var settings = {
            "url": URL+"/logout",
            "method": "GET",
            "timeout": 0
        };

        $.ajax(settings).done(function (response) {
            console.log(response);
        });
    }

    function searchByEmailSettings(emailAddress){
        const cookies = getCookies();
        return settings = {
            "url": URL+"/ws/rest/com.axelor.auth.db.User/search",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json",
                'X-CSRF-Token': cookies['CSRF-TOKEN']
            },
            "data": JSON.stringify({
                "offset": 0,
                "limit": 1,
                "fields": [
                    "fullName",
                    "email",
                    "id",
                    "version"
                ],
                "data": {
                    "_domain": "self.email like :email",
                    "_domainContext": {
                        "email": emailAddress
                    },
                    "_archived": true
                }
            })
        };
    }

    async function searchByEmail(email){
        return  $.ajax(searchByEmailSettings(email))
            .then(response => response);
    }

    function searchByUsernameSettings(username){
        const cookies = getCookies();
        return settings = {
            "url": URL+"/ws/rest/com.axelor.auth.db.User/search",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json",
                'X-CSRF-Token': cookies['CSRF-TOKEN']
            },
            "data": JSON.stringify({
                "offset": 0,
                "limit": 1,
                "fields": [
                    "fullName",
                    "email",
                    "id",
                    "version"
                ],
                "data": {
                    "_domain": "self.code like :code",
                    "_domainContext": {
                        "code": username
                    },
                    "_archived": true
                }
            })
        };
    }

    async function searchByUsername(username){
        return $.ajax(searchByUsernameSettings(username))
            .then(response => response);
    }

    function showErrorMessage(message){
        if($('#error-msg').hasClass('alert-success')){
            $('#error-msg').removeClass('alert-success');
            $('#error-msg').addClass('alert-error');
        }
        $('#main-error-msg').text(message);
        $('#error-msg').removeClass('hidden');
        $('#error-msg').show();
    }

    function showSuccessMessage(message){
        if($('#error-msg').hasClass('alert-error')){
            $('#error-msg').removeClass('alert-error');
            $('#error-msg').addClass('alert-success');
        }
        $('#main-error-msg').text(message);
        $('#error-msg').removeClass('hidden');
        $('#error-msg').show();
    }

    function encryptEmail(emailAddress){
        var encryptedEmail = null;
        if(emailAddress != null){
            var firstSplit = emailAddress.split("@");
            var secondSplit = firstSplit[1].split(".");
            var firstEmailPartToEncrypt = firstSplit[0].substring(3);
            var secondEmailPartToEncrypt = secondSplit[0].substring(4);
            var firstEmailPartEncrypted = firstEmailPartToEncrypt.replace(/[-\+~\w]/g,'*');
            var secondEmailPartEncrypted = secondEmailPartToEncrypt.replace(/[-\+~\w]/g,'*');
            var thirdEmailPartEncryped = secondSplit[1].replace(/[-\+~\w]/g,'*');
            encryptedEmail = firstSplit[0].substring(0,3)+firstEmailPartEncrypted+"@"+
            secondSplit[0].substring(0,4)+secondEmailPartEncrypted+"."+thirdEmailPartEncryped;
        }

        return encryptedEmail;
    }

    function handleSearchResults(resultsCode,searchResults){

        if(resultsCode === 1){
            userId = searchResults.id;
            emailAddress = encryptEmail(searchResults.email);
            if(emailAddress != null){
                $('#emailAddress').text(emailAddress);
                $('#fullName').text(searchResults.fullName);
                $('#search-form').hide();
                $('#error-msg').hide();
                $('#emailConfirmationBox').show();
            }else{
                showErrorMessage("An email address has not been configured for this account. Contact your administrator");
            }

        }else{
            showErrorMessage("The username or email you entered does not exit. Contact your administrator");
        }
        $('#searchLoading').addClass('hidden');
        $('#searchPassword').show();
        logout();
    }

    function sendTempPasswordToUserSettings(userId){
        const cookies = getCookies();
        return settings = {
            "url": URL+"/ws/action/",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json",
                'X-CSRF-Token': cookies['CSRF-TOKEN']
            },
            "data": JSON.stringify({
                "model": "com.axelor.auth.db.User",
                "action": "com.axelor.apps.base.web.UserController:sendTemporaryPasswordToUser",
                "data": {
                    "context": {
                        "_model": "com.axelor.auth.db.User",
                        "id": userId
                    }
                }
            })
        };
    }

    $('#notYouButton').on('click',function(){
        $("#emailConfirmationBox").hide();
        $("#search-form").show();
    })

    $('#sendEmailButton').on('click',function(){
        $('#notYouButton').hide();
        $('#sendEmailButton').hide();
        $('#sendLoading').removeClass('hidden');
        $.ajax(loginSettings()).done(function (response) {

            $.ajax(sendTempPasswordToUserSettings(userId)).done(function (response) {
                var values = response['data'][0]['values'];
                if(values.message === 'successful'){
                    $("#passwordReceivedEmailAddress").text(emailAddress);
                    $("#emailConfirmationBox").hide();
                    $("#passwordReceivedBox").show();
                }
                logout();
            }).fail(function(){
                $('#notYouButton').show();
                $('#sendEmailButton').show();
                $('#sendLoading').addClass('hidden');
                showErrorMessage('Something went wrong. Please try again');
                logout();
            });
        }).fail(function(){
            $('#notYouButton').show();
            $('#sendEmailButton').show();
            $('#sendLoading').addClass('hidden');
            showErrorMessage('Something went wrong. Please try again');
            logout();
        })
    })

    $('#resendButton').on('click',function(){
        $('#resendButton').hide();
        $('#loginButton').hide();
        $('#resendLoading').removeClass('hidden')
        $.ajax(loginSettings()).done(function (response) {

            $.ajax(sendTempPasswordToUserSettings(userId)).done(function (response) {
                var values = response['data'][0]['values'];
                if(values.message === 'successful'){
                    $('#resendButton').show();
                    $('#loginButton').show();
                    $('#resendLoading').addClass('hidden');
                    showSuccessMessage('The password has been resent to your mail');
                }
                logout();
            }).fail(function(){
                $('#resendButton').show();
                $('#loginButton').show();
                $('#resendLoading').addClass('hidden');
                showErrorMessage('Something went wrong. Please try again');
                logout();
            });
        }).fail(function(){
            $('#resendButton').show();
            $('#loginButton').show();
            $('#resendLoading').addClass('hidden');
            showErrorMessage('Something went wrong. Please try again');
            logout();
        })
    })

    $('#loginButton').on('click',function(){
        window.location.href = URL+"/login.jsp";
    })



    $('#login-form').submit(function(e) {
        document.getElementById("hash-location").value = window.location.hash;
    });

    $('#iconShowPassword').on("click",function(){
        $('#iconShowPassword').hide();
        $('#iconHidePassword').show();
        $('#passwordId').attr("type","text");
    });

    $('#iconHidePassword').on("click",function(){
        $('#iconHidePassword').hide();
        $('#iconShowPassword').show();
        $('#passwordId').attr("type","password");
    })

    $('#forgotPasswordBtn').on('click',function(){
        $('#login-form').hide();
        $('#social-buttons').hide();
        $('#error-msg').hide();
        $('#search-form').show();
    })

    $('#search-form').submit(async function(event){
        event.preventDefault();
        $('#searchLoading').removeClass('hidden');
        $('#searchPassword').hide()
        let formValue = $('#usernameOrEmail').val();
        let statusCode = await login();
        let resultsCode = -1;
        let searchResults = {};
        if( statusCode === 200){//API login sucessful
            response = await searchByUsername(formValue); //Search by username
            resultsCode = response['total'];
            searchResults = resultsCode === 1 ? response['data'][0] : {};
            if(resultsCode !== 1){//Username has not found
                // Assume email and was entered and search by email
                response = await searchByEmail(formValue); //Search by email
                //Update resultsCode and searchResults
                resultsCode = response['total'];
                searchResults = resultsCode === 1 ? response['data'][0] : {};
            }
            handleSearchResults(resultsCode,searchResults);

        }else{
            showErrorMessage("Something went wrong. Please try again");
            $('#searchLoading').addClass('hidden');
            $('#searchPassword').show();
            logout();
        }
    })
})