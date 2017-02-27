$(document).ready(function() {

	$(".pwdSignupprogress").keyup(function(e) {
		// alert("hi");
		var pwdval = $(this).val();
		if (pwdval.length < 1) {
			$('.progressSignup').removeClass("progress");
			$('.progressSignup').html('');
		} else if (pwdval.length > 0 && pwdval.length < 5) {
			$('.progressSignup').addClass("progress");
			$('.progressSignup').html('<div class="progress-bar progress-bar-danger" role="progressbar" style="width:10%"> Weak </div>');
		} else if (pwdval.length > 4 && pwdval.length < 10) {
			$('.progressSignup').html('');
			$('.progressSignup').addClass("progress");
			$('.progressSignup').html('<div class="progress-bar progress-bar-danger" role="progressbar" style="width:10%"></div><div class="progress-bar progress-bar-success" role="progressbar" style="width:30%"> Medium </div>');
		} else if (pwdval.length > 9) {
			$('.progressSignup').html('');
			$('.progressSignup').addClass("progress");
			$('.progressSignup').html('<div class="progress-bar progress-bar-danger" role="progressbar" style="width:10%"></div><div class="progress-bar progress-bar-success" role="progressbar" style="width:30%"></div><div class="progress-bar progress-bar-warning" role="progressbar" style="width:60%"> Good </div>');
		}
	});

	$("#frmsign").validate({

		rules: {

			fname: "required",
			lname: "required",
			pwd: {
				required: true,
				minlength: 8,
				regx: /^.*(?=.{8,})(?=.*[a-z]).*$/,
				regx: /^.*(?=.*\d)|(?=.*[@#$%!_]).*$/,
				regx: /^.*(?=.{8,})(?=.*[A-Z]).*$/
			}

		},
		onfocusout: function(element) {
			$(element).valid();
		},
		messages: {
			fname: "First Name is required",
			lname: "Last Name is required",
			pwd: {
				required: "Please provide a password",
				minlength: "Your password must be at least 8 characters long",
				regx: "Password should have at least one lower and one upper case character. Include at least one numeric or special character."
			},

		},
		errorElement: 'div'

	});

	$('.clsSignup').click(function() {
		$(this).attr("disabled", true);
		signup();
	});

	$("input[name='fname'], input[name='lname'], input[name='pwd']").keypress(function(event) {
		if (event.which == 13) {
			event.preventDefault();
			signup();
		}
	});

	$('button.ok').click(function() {
		window.location = '/';
	});

});

function signup() {
	if (!$("form[id=frmsign]").valid()) {
		$('.clsSignup').attr("disabled", false);
		return;
	}
	var firstName = $("input[name='fname']").val();
	var lastName = $("input[name='lname']").val();
	var password = $("input[name='pwd']").val();
	var invitedby = $(".invitedby").val();
	var titles = $(".titles").val();
	var email = $('.pemail').text();
	var organization = $('.porg').text();

	$.ajax({
		url: "/api/signup",
		method: "post",
		data: JSON.stringify({
			"email": email,
			"firstName": firstName,
			"lastName": lastName,
			"phone": '',
			"password": password,
			"invitedby": invitedby,
			"organization": organization,
			"titles": titles
		}),
		type: 'post',
		contentType: "application/json; charset=utf-8",
		dataType: "json",
	}).success(function(data) {
		$('#ThanksRegistration').modal('show');
		$('.clsSignup').attr("disabled", false);

	}).error(function(xhr, status, err) {
		$("input[name=fname]").val("").focus();
		$("input[name=lname]").val("");
		$("input[name=pwd]").val("");
		$('.progressSignup').html('');

		$(".register_form_error").text($.parseJSON(xhr.responseText).message);
		$(".register_form_error").show();
		$('.clsSignup').attr("disabled", false);
	});
}