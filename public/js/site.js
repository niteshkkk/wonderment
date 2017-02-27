$(document).ready(function() {

  //show dashboardGrid
  // if($("#tbldashboardapifilterdata"))
  // {
  //  showDashboardData();
  // }

  $('.tos').on('click', function() {
    window.location = '/tos';
  });

  $('.privacypolicy').on('click', function() {
    window.location = '/privacy-policy';
  });

  $('.contactus').on('click', function() {
    window.location = '/contact-us';
  });


  $(document).ajaxStart(function() {
    // $( ".overlay" ).text( "Triggered ajaxStart handler." );
    $(".overlay").show();
  });

  $(document).ajaxStop(function() {
    // $( ".overlay" ).text( "Triggered ajaxStop handler." );
    $(".overlay").hide();
  });


  jQuery.validator.addMethod("matchcurrentpassword", function(value, element) {
    var email = $("#emailchangepwd").text();
    var oldpwd = value;
    var password = oldpwd;
    var isSuccess = false;
    if (oldpwd.trim().length > 0) {
      $.ajax({
        url: "/api/auth/",
        method: "post",
        data: JSON.stringify({
          "email": email,
          "password": password
        }),
        type: 'post',
        async: false,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
      }).success(function(data) {
        isSuccess = true;
      }).error(function(xhr, status, err) {
        isSuccess = false;
      });
    }
    return isSuccess;
  }, "Does not match current password");

  $("#saveReport").click(function(e) {
    if (!$("#saveReport").hasClass("disabled") && issaveenabled) {
      if ($("#reportName").val() == "") {
        $("#message").html("Enter report name");
        setTimeout(function() {
          $("#message").html("");
        }, 3000);
        return false;
      }
      if (validationCheckbeforeSave()) {
        saveReporttoDb(true, "#message");
      }
    }
  });

  function exportcsv() {
    $(".export-csv").click(function(e) {
      var mindategrid = dateformat($("#dtp_input3").val());
      var maxdategrid = dateformat($("#dtp_input2").val());
      var reportDatanew = {};
      reportDatanew.cohortstartdate = maxdategrid;
      reportDatanew.cohortendtdate = mindategrid;
      reportDatanew.platforms = [];
      reportDatanew.sources = [];
      reportDatanew.horizon = [];
      
      if ($("#dropdownMenu4").val() == "") {
        reportDatanew.platforms.push(['All']);
      } else {
        var platformslist = $("#dropdownMenu4").val().split(',');
        for (var i = 0; i < platformslist.length - 1; i++) {
          reportDatanew.platforms.push(platformslist[i]);
        }
      }

      //save sources
      if ($("#dropdownMenu1").val() == "") {
        reportDatanew.sources.push(['All']);
      } else {
        var sourceslist = $("#dropdownMenu1").val().split(',');
        for (var i = 0; i < sourceslist.length - 1; i++) {
          reportDatanew.sources.push(sourceslist[i]);
        }
      }

      //save country
      if ($("#dropdownMenuCountry").val() == "") {
        reportDatanew.country = "All";
      } else {
        reportDatanew.country = $.trim($("#dropdownMenuCountry").val());
      }

      //save horizon
      if ($("#90days").is(':checked') == true) {
        reportDatanew.horizon = 90;
      }
      if ($("#180days").is(':checked') == true) {
        reportDatanew.horizon = 180;
      }
      if ($("#365days").is(':checked') == true) {
        reportDatanew.horizon = 365;
      }

      if ($("#organicLift").is(':checked')) {
        reportDatanew.organiclift = true;
      } else {
        reportDatanew.organiclift = false;
      }

      var platformArray = JSON.stringify(reportDatanew.platforms);
      var sourcesArray = JSON.stringify(reportDatanew.sources);

      $.ajax({
        url: "/ua_dashboard/expfile?mindate=" + reportDatanew.cohortstartdate + "&maxdate=" + reportDatanew.cohortendtdate + "&platform=" + platformArray + "&sources=" + sourcesArray + "&horizon=" + reportDatanew.horizon + "&country=" + reportDatanew.country + "&organiclift=" + reportDatanew.organiclift,
        method: "get",
        type: 'get'
      }).success(function(data) {
        window.open('/download/' + data + '.csv');
      });
    });
  }


  $(".errorindexhide").hide();


  $(".cleartextbox").keyup(function(e) {
    if (event.which != 13) {
      $(".login_form_errormessage").text("");
      $(".login_form_errormessage").hide();
    }
  });

  $(".clearpasswordbox").keyup(function(e) {

    if (event.which != 13) {
      $(".login_form_errormessage").text("");
      $(".login_form_errormessage").hide();
    }

  });


  $(".changepwdprogress").keyup(function(e) {        
    var pwdval  = $(this).val();
    if (pwdval.length < 1) {
      $('.progressChangepwd').removeClass("progress");
      $('.progressChangepwd').html('');

    } else if (pwdval.length > 0 && pwdval.length < 5) {
      $('.progressChangepwd').addClass("progress");
      $('.progressChangepwd').html('<div class="progress-bar progress-bar-danger" role="progressbar" style="width:10%"> Weak </div>');

    } else if (pwdval.length > 4 && pwdval.length < 10) {
      $('.progressChangepwd').html('');
      $('.progressChangepwd').addClass("progress");
      $('.progressChangepwd').html('<div class="progress-bar progress-bar-danger" role="progressbar" style="width:10%"></div><div class="progress-bar progress-bar-success" role="progressbar" style="width:30%"> Medium </div>');
    } else if (pwdval.length > 9) {
      $('.progressChangepwd').html('');
      $('.progressChangepwd').addClass("progress");
      $('.progressChangepwd').html('<div class="progress-bar progress-bar-danger" role="progressbar" style="width:10%"></div><div class="progress-bar progress-bar-success" role="progressbar" style="width:30%"></div><div class="progress-bar progress-bar-warning" role="progressbar" style="width:60%"> Good </div>');
    }    
  });

  $(".forgetpwdprogress").keyup(function(e) {        
    var pwdval  = $(this).val();
    if (pwdval.length < 1) {
      $('.progressforgetpwd').removeClass("progress");
      $('.progressforgetpwd').html('');

    } else if (pwdval.length > 0 && pwdval.length < 5) {
      $('.progressforgetpwd').addClass("progress");
      $('.progressforgetpwd').html('<div class="progress-bar progress-bar-danger" role="progressbar" style="width:10%"> Weak </div>');

    } else if (pwdval.length > 4 && pwdval.length < 10) {
      $('.progressforgetpwd').html('');
      $('.progressChangepwd').addClass("progress");
      $('.progressforgetpwd').html('<div class="progress-bar progress-bar-danger" role="progressbar" style="width:10%"></div><div class="progress-bar progress-bar-success" role="progressbar" style="width:30%"> Medium </div>');
    } else if (pwdval.length > 9) {
      $('.progressforgetpwd').html('');
      $('.progressChangepwd').addClass("progress");
      $('.progressforgetpwd').html('<div class="progress-bar progress-bar-danger" role="progressbar" style="width:10%"></div><div class="progress-bar progress-bar-success" role="progressbar" style="width:30%"></div><div class="progress-bar progress-bar-warning" role="progressbar" style="width:60%"> Good </div>');
    }    
  });

  $("#frmchangepwd").validate({
    rules: {
      oldpwd: {
        required: true,
        matchcurrentpassword: true
      },
      newpwd: {
        required: true,
        minlength: 8,
        regx: /^.*(?=.{8,})(?=.*[a-z]).*$/,
        regx: /^.*(?=.*\d)|(?=.*[@#$%!_]).*$/,
        regx: /^.*(?=.{8,})(?=.*[A-Z]).*$/
      },
      confirmpwd: {
        required: true,
        minlength: 8,
        equalTo: "#password"
      }
    },
    onfocusout: function(element) {
      $(element).valid();
    },
    messages: {
      oldpwd: {
        required: "Please provide a password"
      },
      newpwd: {
        required: "Please provide a password",
        minlength: "Your password must be at least 8 characters long",
        regx: "Password should have at least one lower and one upper case character. Include at least one numeric or special character."
      },
      confirmpwd: {
        required: "Please provide a password",
        minlength: "Your password must be at least 8 characters long",
        equalTo: "Please enter the same password as above"
      }
    },
    errorElement: 'div'
  });


  $.validator.addMethod("regx", function(value, element, regexpr) {

var regexpr1 = /^.*(?=.{8,})(?=.*[a-z]).*$/;
    if(regexpr1.test(value))
    {
      var regexpr2 = /^.*(?=.*\d)|(?=.*[@#$%!_]).*$/;
      if(regexpr2.test(value))
      {
var regexpr3 = /^.*(?=.{8,})(?=.*[A-Z]).*$/;
      if(regexpr3.test(value))
      {
return true;
      }
      }

    }
    return false;
  }, "Please enter a valid password.");

  $("#forgotpassword").validate({
    rules: {
      newPassword: {
        required: true,
       
        regx: /^.*(?=.{8,})(?=.*[A-Z]).*$/
      },
      confirmpassword: {
        required: true,
        equalTo: "#pwdfrgt"
      }
    },
    onfocusout: function(element) {
      $(element).valid();
    },
    messages: {
      newPassword: {
        required: "Please provide a password"
      },
      confirmpassword: {
        required: "Please provide a password"
      }
    },
    errorElement: 'div'
  });


  $("#frmContact").validate({
    rules: {
      contactname: "required",
      contactemail: {
        required: true,
        email: true
      },
      msg: "required"
    },
    onfocusout: function(element) {
      $(element).valid();
    },
    messages: {
      contactname: "Name is required",
      contactemail: {
        required: "Email is required",
        email: "Please enter a valid email"
      },
      msg: "Message is required"
    },
    errorElement: 'div',
    errorPlacement: function(error, element) {
  if(element.attr("name") == "msg") {
    error.appendTo( $("#error-msg-index") );
  } else {
    error.insertAfter(element);
  }
}
  });


  $("#frmlogin").validate({
    rules: {
      email: {
        required: true,
        email: true
      },
      password: "required"
    },
    onfocusout: function(element) {
      $(element).valid();
    },
    messages: {
      password: "Password is required",
      email: {
        required: "Email is required",
        email: "Please enter a valid email"
      }
    },
    errorElement: 'div',
    errorLabelContainer: '.login_form_error',
    highlight: function(element, errorClass, validClass) {
      $(element).addClass('inputerror');
    }
  });


  $("#frmforgetpwd").validate({
    rules: {
      forgetpwdemailid: {
        required: true,
        email: true
      }
    },
    onfocusout: function(element) {
      $(element).valid();
    },
    messages: {
      forgetpwdemailid: {
        required: "Email is required",
        email: "Please enter a valid email"
      }
    },
    errorElement: 'div',
    errorLabelContainer: '.login_form_error',
    highlight: function(element, errorClass, validClass) {
      $(element).addClass('inputerror');
    }
  });

  $("form[name=createusersettingspwd]").validate({      
    rules: {
      password: {
        required: true,
        minlength: 8
      },
      newpassword: {
        required: true,
        minlength: 8
      }      
    },
    onfocusout: function(element) {          
      $(element).valid();      
    },
    messages: {
      password: {
        required: "Please provide a password",
        minlength: "Your password must be at least 8 characters long"
      },
      newpassword: {
        required: "Please provide a password",
        minlength: "Your mobile number must be at least 8 characters long"
      }      
    },
    errorElement: 'div',
    errorLabelContainer: '.change_form_error'      
  });
  
  //Button Clicks
  //Login page login button click
  $('.clsLogin').click(function() {
    //console.log("mouse clicked login");
    userLogin();
  });

  $('.forgetbtnclick').click(function() {
    resetPassword();
  });


  $("input[name='email'], input[name='password']").keypress(function(event) {
    if (event.which == 13) {
      event.preventDefault();
      //console.log("enter key clicked login");
      userLogin();
    }
  });


  $('.clschangepwd').click(function() {
    //console.log("clicked change password");
    changepassword();
  });

  $("input[name='oldpwd'], input[name='newpwd'], input[name='confirmpwd']").keypress(function(event) {
    if (event.which == 13) {
      event.preventDefault();
      changepassword();
    }
  });

  // index page forget pop up button click
  $('.clsforget').click(function() {
    forgotpassword();
  });

  // index page forget pop up email id input key press
  $("input[name='forgetpwdemailid']").keypress(function(event) {
    if (event.which == 13) {
      event.preventDefault();
      forgotpassword();
    }
  });


  $(".clearmodel").click(function() {
    $("#frmContact").find("input[type=text], textarea").val("");
  });

  $(".forgetclrmodel").click(function() {
    $("#frmforgetpwd").find("input[type=text]").val("");
    $(".login_form_err").text("");
  });

  $(".changepwdclrmodel").click(function() {
    $("#frmchangepwd").find("input[type=password]").val("");
    $('.progressChangepwd').html('');

  });

  $('.btnsmplereg').on('click', function() {
    window.location = '/registration';
  });

  $('.clsSignUp').on('click', function() {
    window.location = '/register';
  });

  $('.his_arpi').on('click', function() {
    //console.log("historical line chart button clicked");
    window.location = '/historical_source_arpi';
  });

  $('.dashboard_click').on('click', function() {
    //console.log("Dashboard button clicked");
    window.location = '/ua_dashboard';
  });
  
  $('#userType').click(function() {
    usertypeallcheck();
  });

  $('#checkAllStatus').click(function() {
    var role = $("#userType").val();
    var status = $("#checkAllStatus").val();
    var registrationDate = $("#startregdate").val();
    var tokenExpiryDate = $("#endregdate").val();
    var organization = $("#checkAllorganization").val();
    var titles = $("#checkAllorganizationnext").val();
    //console.log("checkAllStatus");
    checkAllStatus();
  });

  $('#startregdate').click(function() {
    //console.log("startregdate");
    startregdate();
  });
  $('#endregdate').click(function() {
    //console.log("endregdate");
    endregdate();
  });
  $('#checkAllorganization').click(function() {
    //console.log("checkAllorganization");
    checkAllorganization();
  });
  $('#checkAllorganizationnext').click(function() {
    //console.log("checkAllorganizationnext");
    checkAllorganizationnext();
  });

  $('.logout').click(function() {
    $.removeCookie("authtoken");
    $.removeCookie("authuser");
    window.location = '/';
  });

  $('.manageacc').click(function() {
    window.location = '/manageaccounts';
  });

  $('.userset').click(function() {
    window.location = '/createusersetting';
  });

  $('.btnSend').click(function() {
    sendMessage();
  });

}); //document ready end

function sendMessage() {
  if (!$("#frmContact").valid()) return;
  var email = $("input[name='contactemail']").val();
  var name = $("input[name='contactname']").val();
  var msg = $("textarea[name='msg']").val();
  //console.log(email);
  //console.log(name);
  //console.log(msg);

  $.ajax({
    url: "/sendmessage",
    method: "post",
    data: JSON.stringify({
      "email": email,
      "name": name,
      "message": msg
    }),
    type: 'post',
    contentType: "application/json; charset=utf-8",
    dataType: "json"
  }).success(function(data) {
    $("#ContactusModal #frmContact").css("display", "none");
    $("#ContactusModal .modal-footer button").css("display", "none");
    $('#ContactusModal #sentmesg').html("Thank you for contacting us, we will be in touch shortly.").css("display", "");
    setTimeout(function(){ 
      $("#ContactusModal").modal('hide');
  }, 3000);

    setTimeout(function(){ 
      
      $("#ContactusModal #frmContact").css("display", "");
      $("#ContactusModal .modal-footer button").css("display", "");
      $('#ContactusModal #sentmesg').html("").css("display", "none");

  }, 4000);
    
  }).error(function(xhr, status, err) {
    //console.log(err);
  });
}

function resetPassword() {
  if (!$("#forgotpassword").valid()) return;
  var newPassword = $("input[name='newPassword']").val();
  var confirmpassword = $("input[name='confirmpassword']").val();
  var resetpased_token = $("#resetToken").val();
  var datamodel = {
    "newPassword": newPassword,
      "token": resetpased_token
  };
  $.ajax({
    url: "/forgot/reset",
    data: datamodel,
    method: "post",
    type: 'post'
  }).success(function(data) {
    if (data.isSuccessfull) {
      getloggedin(data.email, newPassword);
    } else {
      $(".login_form_errormessage").html(data.err);
    }
  }).error(function(xhr, status, err) {
    $(".login_form_errormessage").text($.parseJSON(xhr.responseText).message);
    $(".login_form_errormessage").show();
  });
}

function getloggedin(email, password) {
  $.ajax({
    url: "/api/auth/",
    method: "post",
    data: JSON.stringify({
      "email": email,
      "password": password
    }),
    type: 'post',
    contentType: "application/json; charset=utf-8",
    dataType: "json",
  }).success(function(data) {
    if (data.token) {
      //console.log(data);
      var date = new Date();
      date.setTime(date.getTime() + (data.expirationTimeInSecs * 1000));
      var expires = date;
      $.cookie("authtoken", data.token, {
        "path": "/",
        "expires": expires
      });
      $.cookie("authuser", data.user.email, {
        "path": "/",
        "expires": expires
      });
      $.cookie("authfirstname", data.user.firstName);
      $.cookie("authname", data.user.firstName + ' ' + data.user.lastName, {
        "path": "/",
        "expires": expires
      });
      $.cookie("utype", data.user.role, {
        "path": "/",
        "expires": expires
      });
      if (data.user.role == "Team Member") {
        window.location = '/historical_source_arpi';
      } else {
        window.location = '/historical_source_arpi';
      }
    }

  }).error(function(xhr, status, err) {
    if($.parseJSON(xhr.responseText).message)
      {
        $(".login_form_errormessage").text($.parseJSON(xhr.responseText).message);
    $(".login_form_errormessage").show();
      }

  });
}

function userLogin() {
  if (!$("form[id=frmlogin]").valid()) {
    return
  };

  var email = $("input[name='email']").val();
  var password = $("input[name='password']").val();

  $.ajax({
    url: "/api/auth/",
    method: "post",
    data: JSON.stringify({
      "email": email,
      "password": password
    }),
    type: 'post',
    contentType: "application/json; charset=utf-8",
    dataType: "json",
  }).success(function(data) {
    if (data.token) {
      //console.log(data);
      var date = new Date();
      date.setTime(date.getTime() + (data.expirationTimeInSecs * 1000));
      var expires = date;

      $.cookie("authtoken", data.token, {
        "path": "/",
        "expires": expires
      });
      
      $.cookie("authuser", data.user.email, {
        "path": "/",
        "expires": expires
      });
      
      $.cookie("authfirstname", data.user.firstName);
      
      $.cookie("authname", data.user.firstName + ' ' + data.user.lastName, {
        "path": "/",
        "expires": expires
      });
      
      $.cookie("utype", data.user.role, {
        "path": "/",
        "expires": expires
      });
      
      if (data.user.role == "Team Member") {
        window.location = '/historical_source_arpi';
      } else {
        window.location = '/historical_source_arpi';
      }
    }
  }).error(function(xhr, status, err) {
    $(".errorindexhide").show();
    $("input[name=email]").val("").focus();
    $("#password").val("");
    $(".login_form_errormessage").text($.parseJSON(xhr.responseText).message);
    $(".login_form_errormessage").show();
  });
}

function forgotpassword() {
  if (!$("#frmforgetpwd").valid()) return;
  
  var email = $("input[name='forgetpwdemailid']").val();

  $.ajax({
    url: "/for",
    method: "post",
    data: JSON.stringify({
      "email": email
    }),
    type: 'post',
    contentType: "application/json; charset=utf-8",
    dataType: "json",
  }).success(function(data) {
    $('#ForgotPwdModal').modal('hide');
    $(".login_form_err").text("");
    // window.location.reload();
  }).error(function(xhr, status, err) {
    $(".login_form_err").text($.parseJSON(xhr.responseText).message);
    $(".login_form_err").show();
  });
}

function invite() {
  if (!$("form[name=inviteaccman]").valid()) return;
  $(".register_form_error").text('');
  var email = $("input[name='email']").val();
  var organization = $("input[name='organization']").val();
  $.ajax({
    url: "/api/inviteaccman",
    method: "post",
    data: JSON.stringify({
      "email": email,
      "organization": organization
    }),
    type: 'post',
    contentType: "application/json; charset=utf-8",
    dataType: "json",
  }).success(function(data) {
    //console.log("success");
  }).error(function(xhr, status, err) {
    $(".register_form_error").text($.parseJSON(xhr.responseText).message);
    $(".register_form_error").show();
    $(window).scrollTop($('.register_form_error').offset().top - 50);
  });
}

function changepassword() {

  if (!$("#frmchangepwd").valid()) return;
  //console.log("changepassword function called");
  var email = $("#emailchangepwd").text();
  var oldpwd = $("input[name='oldpwd']").val();
  var newpwd = $("input[name='newpwd']").val();
  var confirmpwd = $("input[name='confirmpwd']").val();
  //console.log("newpwd-->>", newpwd);

  var password = oldpwd;
  $.ajax({
    url: "/api/auth/",
    method: "post",
    data: JSON.stringify({
      "email": email,
      "password": password
    }),
    type: 'post',
    contentType: "application/json; charset=utf-8",
    dataType: "json",
  }).success(function(data) {

    $.ajax({
      url: "/api/changepwd",
      method: "post",
      data: JSON.stringify({
        "email": email,
        "oldpwd": oldpwd,
        "newPassword": newpwd
      }),
      type: 'post',
      contentType: "application/json; charset=utf-8",
      dataType: "json",
    }).success(function(data) {
      //console.log("data.status", data.status);
      if (data.status == false) {
        //$(".changepwd_form_error").text("Does not match current password");
      } else {
        $(".changepwd_form_error").html("Password Changed Successfully");
        $('#ChangePwdModal').modal('hide');
      }
    }).error(function(xhr, status, err) {
      $(".changepwd_form_error").text("Does not match current password");
      $(".changepwd_form_error").show();
      $(window).scrollTop($('.changepwd_form_error').offset().top - 50);
    });

  }).error(function(xhr, status, err) {
    $(".changepwd_form_error").text("Does not match current password");
  });
}

function onsaveas() {
  if (!$("button#saveasbtn").is(":disabled")) {
    //$("#hdnreportid").val("");
    if ($("#reportnameSaveas").val() == "") {
      $("#saveasmessage").html("Enter report name");
      setTimeout(function() {
        $("#message").html("");
      }, 3000);
      return false;
    }
    if (validationCheckbeforeSave()) {
      saveReporttoDb(false, "#saveasmessage");
    }
  }
}

function validationCheckbeforeSave() {
  if ($("#txtcohortStartDate").val() == "") {
    $("#message").html("Select Cohort Start Date");
    setTimeout(function() {
      $("#message").html("");
    }, 3000);
    return false;
  }
  if ($("#txtcohortEndDate").val() == "") {
    $("#message").html("Select Cohort End Date");
    setTimeout(function() {
      $("#message").html("");
    }, 3000);
    return false;
  }

  if ($("#cohortStartDate").data("datetimepicker").getDate() > $("#cohortEndDate").data("datetimepicker").getDate()) {
    $("#message").html("Cohort End Date should be greater than start date");

    setTimeout(function() {
      $("#message").html("");
    }, 3000);
    return false;
  }

  if ($("#90days").is(':checked') == false && $("#180days").is(':checked') == false && $("#365days").is(':checked') == false) {
    $("#message").html("Select Horizon");
    setTimeout(function() {
      $("#message").html("");
    }, 3000);

    return false;
  }

  if (($("#90days").is(':checked') == true && $("#180days").is(':checked') == true) || ($("#180days").is(':checked') == true && $("#365days").is(':checked') == true) || ($("#90days").is(':checked') == true && $("#365days").is(':checked') == true)) {
    $("#message").html("Select Single Horizon");
    setTimeout(function() {
      $("#message").html("");
    }, 3000);
    return false;
  }

  return true;
}

function saveReporttoDb(isSave, errormessage) {
  var cohortSdate = $("#cohortStartDate").data("datetimepicker").getDate();
  cohortStartDateformatted = cohortSdate.getFullYear() + "-" + (cohortSdate.getMonth() + 1) + "-" + cohortSdate.getDate();

  var cohortEdate = $("#cohortEndDate").data("datetimepicker").getDate();
  cohortEndDateformatted = cohortEdate.getFullYear() + "-" + (cohortEdate.getMonth() + 1) + "-" + cohortEdate.getDate();
  var newdate = new Date();
  newdate = newdate.getFullYear() + "-" + (newdate.getMonth() + 1) + "-" + newdate.getDate();
  cohortStartDate = cohortStartDateformatted;
  cohortEndDate = cohortEndDateformatted;
  reportName = $("#reportName").val();
  if (!isSave) {
    reportName = $("#reportnameSaveas").val();
  }

  var reportData = {};
  reportData.reporttitlename = reportName;
  reportData.cohortstartdate = cohortStartDate;
  reportData.cohortenddate = cohortEndDate;
  reportData.platforms = [];
  reportData.sources = [];
  reportData.createddate = new Date();
  reportData.modifieddate = new Date();
  reportData.horizon = [];
  reportData.isSave = isSave;
  //save platforms
  if ($("#dropdownMenu4").val() == "") {
    reportData.platforms.push({
      name: "All"
    });
  } else {
    var platformslist = $("#dropdownMenu4").val().split(',');
    for (var i = 0; i < platformslist.length; i++) {
      reportData.platforms.push({
        name: platformslist[i]
      });
    }
  }

  //save sources
  if ($("#dropdownMenu1").val() == "") {
    reportData.sources.push({
      name: "All"
    });;
  } else {
    var sourceslist = $("#dropdownMenu1").val().split(',');
    for (var i = 0; i < sourceslist.length; i++) {
      reportData.sources.push({
        name: sourceslist[i]
      });
    }
  }

  //save country
  if ($("#dropdownMenuCountry").val() == "") {
    reportData.country = "All";
  } else {
    reportData.country = $.trim($("#dropdownMenuCountry").val());
  }

  //save horizon
  if ($("#90days").is(':checked') == true) {
    reportData.horizon = 90;
  }
  if ($("#180days").is(':checked') == true) {
    reportData.horizon = 180;
  }
  if ($("#365days").is(':checked') == true) {
    reportData.horizon = 365;
  }

  reportData.organiclift = true;

  reportData.email = $("#hdnemail").val();
  reportData.organization = $("#hdnorganization").val();
  reportData.title = $("#hdntitle").val();


  //save report id if report already exits.
  if (isSave) {
    if ($("#hdnreportid").val() != "") {

      reportData.reportid = $("#hdnreportid").val();
    }
    // since reporttile is already populated in the textbox
    //reportData.reporttitlename=$("#hdnReportTitle").val();
  }

  $.ajax({
    url: "/api/reporttitlesave",
    method: "post",
    data: JSON.stringify(reportData),
    type: 'post',
    contentType: "application/json; charset=utf-8",
    dataType: "json"
  }).success(function(data) {
    var title = $('#dropdownMenu2 span.ea-hd').text();
    $("#dropdownMenu3").val(reportData.reporttitlename);
    $("#dropdownMenu3").html('<span class="fa fa-angle-down pull-right mt-3"></span>' + reportData.reporttitlename);
    $("#reportName").val(reportData.reporttitlename);
    if (isSave) {
      $($('ul.reporttitle div').find('li').last()).remove();
      $(".save-btns a.saveas").removeAttr('disabled');
      $(".save-btns a.saveas").removeClass("disabled");
    }
    $($('ul.reporttitle div').find('li').last()).after('<li><a class="column_chart_title" reporttitlename="' + reportData.reporttitlename + '" title="' + title + '" href="javascript:void(0)" data-id="' + data.data.reportid + '" data-name="' + reportData.reporttitlename + '" onclick="populatereportid(this)">' + reportData.reporttitlename + '</a></li>')
    issaveenabled = false;
    $(".save-btns a#saveReport").attr('disabled');
    $(".save-btns a#saveReport").addClass("disabled");
    $("#hdnreportid").val(data.data.reportid);
    $("#hdnReportTitle").val(reportData.reporttitlename);
    setvalue4Hiddenfields();
    afterrevertdone();

    sourceplatform_click = false;
    ReportClickEvent();
    if ($("#hdnpagetype").val() == "historical") {
      onReportClick('historical_source_arpi');
    } else {
      onReportClick("ua_dashboard");
    }

    $('#saveasModal').modal('hide');
  }).error(function(xhr, status, err) {

    if (err == "Conflict") {
      $(errormessage).html("This report title is already being used.");
      setTimeout(function() {
        $(errormessage).html("");
      }, 3000);


    } else {
      $(errormessage).html("Problem to save report");
      setTimeout(function() {
        $(errormessage).html("");
      }, 3000);

    }
  });
}


function reportnameOnSaveas() {
  $('#saveasbtn').prop('disabled', true);
  $('#saveasbtn').addClass('saveasbtn', true);

  $('#reportnameSaveas').keyup(function() {
    $('#saveasbtn').prop('disabled', this.value == "" ? true : false);
    $('#saveasbtn').toggleClass('saveasbtn', this.value == "" ? true : false);
    $('#saveasbtn').attr('onclick', this.value == "" ? '' : 'onsaveas()');
  });
}

function actionaftertypingonReportTile() {
  $('#reportName').keyup(function() {
    if (this.value) {
      if (this.value.trim() == $("#hdnReportTitle").val()) {
        issaveenabled = false;
        $(".save-btns a#saveReport").attr('disabled');
        $(".save-btns a#saveReport").addClass("disabled");
        isreverted = true;
        torevertback();
        return;
      }
    }

    issaveenabled = true;
    $(".save-btns a#saveReport").removeAttr('disabled');
    $(".save-btns a#saveReport").removeClass("disabled");
    isreverted = false;
    torevertback();
  });

}
