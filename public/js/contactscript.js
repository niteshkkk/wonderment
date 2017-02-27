$(document).ready(function() {

  jQuery.validator.addMethod("contactmobileoptional", function(value, element, regexpr) {

    if (value) {
      return regexpr.test(value);
    }
    return true;
  }, "Your phone number must be at least 9 characters long");
});

$("#contactform").validate({

  rules: {

    Fname: "required",
    Lname: "required",
    contactemail: {
      required: true,
      email: true
    },

    comapnyname: "required",
    msg: "required",
    mobnumber: {

      number: function(element) {
        return $(element).val() != "";
      },
      contactmobileoptional: /^.*(?=.{9,15})(?=.*\d).*$/
    }

  },
  onfocusout: function(element) {
    $(element).valid();
  },

  messages: {
    Fname: "Please enter your first name.",
    Lname: "Please enter your last name",
    contactemail: {
      required: "Please enter your email.",
      email: "Please enter a valid email address."
    },
    comapnyname: "Please enter your company name.",
    msg: "Please tell us what you are inquiring about.",

    mobnumber: {

      number: "Your phone number must be numeric",
      pattern: "Please write Phone number in correct formet"
    }
  },
  errorElement: 'div',
  errorPlacement: function(error, element) {
  if(element.attr("name") == "msg") {
    error.appendTo( $("#error-msg") );
  } else {
    error.insertAfter(element);
  }
}
});

$("#contactbutton").click(function() {
  contact();
});

function contact() {

  if (!$("form[id=contactform]").valid()) {
    return
  };
  var fname = $("input[name='Fname']").val();
  var lname = $("input[name='Lname']").val();
  var contactemail = $("input[name='contactemail']").val();
  var mobnumber = $("input[name='mobnumber']").val();
  var comapnyname = $("input[name='comapnyname']").val();
  var radio = $('input[name=optionsContact]:checked', '#contactform').val();
  var textarea = $('#message').val();

  $.ajax({
    url: "api/contactsendmail/",
    method: "post",
    data: JSON.stringify({
      "fname": fname,
      "lname": lname,
      "contactemail": contactemail,
      "mobnumber": mobnumber,
      "comapnyname": comapnyname,
      "radio": radio,
      "textarea": textarea
    }),
    type: 'post',
    contentType: "application/json; charset=utf-8",
    dataType: "json",
  }).success(function(data) {

    $("#contacthide").hide();
    $(".contact-thanku").show();
  }).error(function(xhr, status, err) {
    console.log("Error");
    $(".contact_form_errormessage").text($.parseJSON(xhr.responseText).message);
  });
}