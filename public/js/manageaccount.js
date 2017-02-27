$(document).ready(function() {

  $('.tos').on('click', function() {
    window.location = '/TOS';
  });

  $('.privacypolicy').on('click', function() {
    window.location = '/PrivacyPolicy';
  });

  $('.clsinvite').click(function() {
    inviteaccmannager();
  });

  $("div.inviteorg").keyup(function(e) {
    if (event.which != 13) {
      $(".invite_form_error").text("");
    }
  });

  $("div.inviteadmintitle").keyup(function(e) {
    if (event.which != 13) {
      $(".invite_form_error").text("");
    }
  });

  $("div.invitetitle").keyup(function(e) {
    if (event.which != 13) {
      $(".invite_form_error").text("");
    }
  });

  $(".invitemembermodel").click(function() {
    $("#frmInvite").find("input[type=email]").val("");
  });

  $('ul.pagination a').click(function() {
    var pagenumber = this.text;
    var total = $(this).parents('div').find('span[name=total]').text();
    //console.log(total);
    var pagecount = (total <= 10) ? 1 : (total / 10);

    $(this).parents('ul').find('a').each(function() {
      //console.log(this.text);
      $(this).removeClass('active');
      if (this.text === pagenumber) {
        $(this).addClass('active');
      }
    });
  });

  //----------------------
  // User Type Filter Click
  $("a.usertype").click(function() {
    var userType = $(this).text();
    $("#dropdownMenu1").val(userType);
    $("#dropdownMenu1").html('<span class="fa fa-angle-down pull-right pt-2"></span><span class="drop-text">' + userType + '</span>');
    var usertype = $("#dropdownMenu1").val();
    var userstatus = $("#dropdownMenu2").val();
    var organization = $("#dropdownMenu3").val();
    var title = $("#dropdownMenu4").val();
    var registrationStartDate = $("#startdate").val();
    var registrationEndDate = $("#enddate").val();
    if (usertype === '') {
      usertype = $("#dropdownMenu1").text();
    }
    if (userstatus === '') {
      userstatus = $("#dropdownMenu2").text();
    }
    if (organization === '') {
      organization = $("#dropdownMenu3").text();
    }
    if (title === '') {
      title = $("#dropdownMenu4").text();
    }

    getgriddatabyfilters(usertype, userstatus, registrationStartDate, registrationEndDate, organization, title);
  });

  // User Status Filter Click
  $('ul.status-dd input[type=checkbox]').click(function() {
    var checkedItems = [];
    var allChecked = true;
    var checkedValues = '';

    if (this.id === 'all-status') {
      checkedValues = $(this).next('label').text();
      $(this).closest('ul').find('li input[type=checkbox]').each(function(indx, item) {
        $(item).prop('checked', false);
      });
      $(this).prop('checked', true);
    } else {
      $(this).closest('ul').find('li input[type=checkbox]').each(function(indx, item) {
        if (indx > 0) {
          if ($(this).is(':checked')) {
            checkedItems.push($(this).next('label').text());
          } else {
            allChecked = false;
          }
        }
      });

      checkedValues = checkedItems.join();
      $('#all-status').prop('checked', false);
    }

    $("#dropdownMenu2").val(checkedValues);
    if (checkedValues.length > 13) checkedValues = checkedValues.substring(0, 13) + '...';
    $("#dropdownMenu2").text();
    $("#dropdownMenu2").html('<span class="fa fa-angle-down pull-right pt-2"></span></span><span class="drop-text">' + checkedValues);

    var usertype = $("#dropdownMenu1").val();
    var userstatus = $("#dropdownMenu2").val();
    var organization = $("#dropdownMenu3").val();
    var title = $("#dropdownMenu4").val();
    var registrationStartDate = $("#startdate").val();
    var registrationEndDate = $("#enddate").val();
    if (usertype === '') {
      usertype = $("#dropdownMenu1").text();
    }
    if (userstatus === '') {
      userstatus = $("#dropdownMenu2").text();
    }
    if (organization === '') {
      organization = $("#dropdownMenu3").text();
    }
    if (title === '') {
      title = $("#dropdownMenu4").text();
    }
    //console.log("organization0--------------", organization);

    getgriddatabyfilters(usertype, userstatus, registrationStartDate, registrationEndDate, organization, title);
  });

  $('.startdate').change(function(e) {
    //alert(e);
    var startDate = $(".startdate").data("datetimepicker").getDate();
    var endDate = $(".enddate").data("datetimepicker").getDate();
    if (startDate > endDate) {
      $(".error-ma").html("Start Date should be less than end date");
      return false;
    } else {
      $(".error-ma").html("");
    }

    var usertype = $("#dropdownMenu1").val();
    var userstatus = $("#dropdownMenu2").val();
    var organization = $("#dropdownMenu3").val();
    var title = $("#dropdownMenu4").val();
    var registrationStartDate = $("#startdate").val();
    var registrationEndDate = $("#enddate").val();
    if (usertype === '') {
      usertype = $("#dropdownMenu1").text();
    }
    if (userstatus === '') {
      userstatus = $("#dropdownMenu2").text();
    }
    if (organization === '') {
      organization = $("#dropdownMenu3").text();
    }
    if (title === '') {
      title = $("#dropdownMenu4").text();
    }
    getgriddatabyfilters(usertype, userstatus, registrationStartDate, registrationEndDate, organization, title);
  });

  $('.enddate').change(function(e) {
    //alert(e);
    var startDate = $(".startdate").data("datetimepicker").getDate();
    var endDate = $(".enddate").data("datetimepicker").getDate();
    if (startDate > endDate) {
      $(".error-ma").html("End Date should be greater than start date");
      return false;
    } else {
      $(".error-ma").html("");
    }

    var usertype = $("#dropdownMenu1").val();
    var userstatus = $("#dropdownMenu2").val();
    var organization = $("#dropdownMenu3").val();
    var title = $("#dropdownMenu4").val();
    var registrationStartDate = $("#startdate").val();
    var registrationEndDate = $("#enddate").val();
    if (usertype === '') {
      usertype = $("#dropdownMenu1").text();
    }
    if (userstatus === '') {
      userstatus = $("#dropdownMenu2").text();
    }
    if (organization === '') {
      organization = $("#dropdownMenu3").text();
    }
    if (title === '') {
      title = $("#dropdownMenu4").text();
    }
    getgriddatabyfilters(usertype, userstatus, registrationStartDate, registrationEndDate, organization, title);
  });


  // Organization Filter Click
  $('ul.org-dd input[type=checkbox]').click(function() {
    var checkedItems = [];
    var allChecked = true;
    var checkedValues = '';

    if (this.id === 'all-org') {
      checkedValues = $(this).next('label').text();
      $(this).closest('ul').find('li input[type=checkbox]').each(function(indx, item) {
        $(item).prop('checked', false);
      });
      $(this).prop('checked', true);
    } else {
      $(this).closest('ul').find('li input[type=checkbox]').each(function(indx, item) {
        if (indx > 0) {
          if ($(this).is(':checked')) {
            checkedItems.push($(this).next('label').text());
          } else {
            allChecked = false;
          }
        }
      });

      checkedValues = checkedItems.join();
      $('#all-org').prop('checked', false);
    }

    $("#dropdownMenu3").val(checkedValues);
    if (checkedValues.length > 10) checkedValues = checkedValues.substring(0, 10) + '...';
    $("#dropdownMenu3").text();
    $("#dropdownMenu3").html('<span class="fa fa-angle-down pull-right pt-2"></span></span><span class="drop-text">' + checkedValues);

    var usertype = $("#dropdownMenu1").val();
    var userstatus = $("#dropdownMenu2").val();
    var organization = $("#dropdownMenu3").val();
    var title = $("#dropdownMenu4").val();
    var registrationStartDate = $("#startdate").val();
    var registrationEndDate = $("#enddate").val();
    if (usertype === '') {
      usertype = $("#dropdownMenu1").text();
    }
    if (userstatus === '') {
      userstatus = $("#dropdownMenu2").text();
    }
    if (organization === '') {
      organization = $("#dropdownMenu3").text();
    }
    if (title === '') {
      title = $("#dropdownMenu4").text();
    }
    if (isSuperAdmin) {
      onselectionofOrganization(checkedItems);
    }
    getgriddatabyfilters(usertype, userstatus, registrationStartDate, registrationEndDate, organization, title);
  });

  // Title Filter Click
  $('#all-title').click(function() {
    var checkedValues = $(this).next('label').text();
    $('li.all-check').next('div').find('ul.title-dd li input[type=checkbox]').each(function(indx, item) {
      $(item).prop('checked', false);
    });
    $(this).prop('checked', true);
    $("#dropdownMenu4").val(checkedValues);
    if (checkedValues.length > 9) checkedValues = checkedValues.substring(0, 9) + '...';
    $("#dropdownMenu4").text();
    $("#dropdownMenu4").html('<span class="fa fa-angle-down pull-right pt-2"></span></span><span class="drop-text">' + checkedValues);

    var usertype = $("#dropdownMenu1").val();
    var userstatus = $("#dropdownMenu2").val();
    var organization = $("#dropdownMenu3").val();
    var title = $("#dropdownMenu4").val();
    var registrationStartDate = $("#startdate").val();
    var registrationEndDate = $("#enddate").val();
    if (usertype === '') {
      usertype = $("#dropdownMenu1").text();
    }
    if (userstatus === '') {
      userstatus = $("#dropdownMenu2").text();
    }
    if (organization === '') {
      organization = $("#dropdownMenu3").text();
    }
    if (title === '') {
      title = $("#dropdownMenu4").text();
    }
    getgriddatabyfilters(usertype, userstatus, registrationStartDate, registrationEndDate, organization, title);
  });

  OnTitleCheck();

  //On Status Change
  $("a.status").click(function() {
    var status = this.text;
    var email = $(this).closest('tr').find('td.email a').text();
    var updated = updatestatus(email, status, this);
  });

  //Search Items in Dropdowns
  $('ul.status-dd input[type=text]').keyup(function() {
    var searchText = $(this).val();
    $('ul.status-dd li').each(function() {
      var currentLiText = $(this).find('label').text();
      if (currentLiText && currentLiText !== '' && currentLiText.trim() !== 'All') {
        var showCurrentLi = currentLiText.toLowerCase().indexOf(searchText) !== -1;
        $(this).toggle(showCurrentLi);
      }
    });
  });

  $('ul.org-dd input[type=text]').keyup(function() {
    var searchText = $(this).val();
    $('ul.org-dd li').each(function() {
      var currentLiText = $(this).find('label').text();
      if (currentLiText && currentLiText !== '' && currentLiText.trim() !== 'All') {
        var showCurrentLi = currentLiText.toLowerCase().indexOf(searchText) !== -1;
        $(this).toggle(showCurrentLi);
      }
    });
  });

  $('.title-search').keyup(function() {
    var searchText = $(this).val();
    $('li.all-check').next('div').find('ul.title-dd li').each(function(indx, item) {
      var currentLiText = $(this).find('label').text();
      if (currentLiText && currentLiText !== '' && currentLiText.trim() !== 'All') {
        var showCurrentLi = currentLiText.toLowerCase().indexOf(searchText) !== -1;
        $(this).toggle(showCurrentLi);
      }
    });
  });
}); // end document .ready

function OnTitleCheck() {
  $('ul.title-dd input[type=checkbox]').click(function() {
    var checkedItems = [];
    var allChecked = true;
    var checkedValues = '';

    $('li.all-check').next('div').find('ul.title-dd li input[type=checkbox]').each(function(indx, item) {
      if ($(this).is(':checked')) {
        checkedItems.push($(this).next('label').text());
      } else {
        allChecked = false;
      }
    });

    checkedValues = checkedItems.join();

    $('#all-title').prop('checked', false);

    $("#dropdownMenu4").val(checkedValues);
    if (checkedValues.length > 9) checkedValues = checkedValues.substring(0, 9) + '...';
    $("#dropdownMenu4").text();
    $("#dropdownMenu4").html('<span class="fa fa-angle-down pull-right pt-2"></span></span><span class="drop-text">' + checkedValues);

    var usertype = $("#dropdownMenu1").val();
    var userstatus = $("#dropdownMenu2").val();
    var organization = $("#dropdownMenu3").val();
    var title = $("#dropdownMenu4").val();
    var registrationStartDate = $("#startdate").val();
    var registrationEndDate = $("#enddate").val();
    if (usertype === '') {
      usertype = $("#dropdownMenu1").text();
    }
    if (userstatus === '') {
      userstatus = $("#dropdownMenu2").text();
    }
    if (organization === '') {
      organization = $("#dropdownMenu3").text();
    }
    if (title === '') {
      title = $("#dropdownMenu4").text();
    }
    getgriddatabyfilters(usertype, userstatus, registrationStartDate, registrationEndDate, organization, title);
  });
}

function updatestatus(email, status, component) {
  $.ajax({
    url: "/updatestatus",
    method: "post",
    data: JSON.stringify({
      "email": email,
      "status": status
    }),
    type: 'post',
    contentType: "application/json; charset=utf-8",
    dataType: "json"
  }).success(function(data) {
    if (data.updated) {
      $(component).closest('td').find('a.status-dd').html(status + ' <i class="fa fa-angle-down"></i>');
      return true;
    }
  }).error(function(xhr, status, err) {
    //console.log(err);
    return false;
  });
}

function dashboardapifilter() {
  //alert("dashboard api function clicked");
  //console.log("dashboard api function clicked");

  $.ajax({
    url: "/api/dashboardapifilterdata/",
    method: "post",
    data: JSON.stringify({}),
    type: 'post',
    contentType: "application/json; charset=utf-8",
    dataType: "json",
  }).success(function(data) {
    // $('#InviteTeamMemberModal').modal('hide');
    //console.log('api success--', data);
    // window.location.reload();
  }).error(function(xhr, status, err) {
    //console.log(err);
    // $(".invite_form_error").text($.parseJSON(xhr.responseText).message);
    // $(".invite_form_error").show();              
  });
}

function inviteaccmannager() {
  var email = $("input[name='inviteemail']").val();
  var organization = '';
  var titleString = '';

  if (!email) {
    $(".invite_form_error").text('Please enter email');
    return;
  } else {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (!regex.test(email)) {
      $(".invite_form_error ").text('Please enter a valid email');
      return;
    }
  }
  if ($('.loginuserrole').val() === 'su') {
    organization = $('div.modal-org').val();
    titleString = $("input[name='invitetitle']").val();
  } else {
    organization = $(".loginuserorg").text();
    titleString = $('input.modal-title').val();
  }

  if (!organization) {
    $(".invite_form_error").text('Please enter organization');
    return;
  }
  if (!titleString) {
    $(".invite_form_error").text('Please enter title');
    return;
  }

  var titlesArray = [];
  var titles = [];
  if (titleString) {
    titlesArray = titleString.split(',');
  }
  $.each(titlesArray, function(indx, item) {
    titles.push({
      'name': item
    });
  });

  //console.log(titles);

  $.ajax({
    url: "/inviteaccman/",
    method: "post",
    data: JSON.stringify({
      "email": email,
      "organization": organization,
      "titles": titles
    }),
    type: 'post',
    contentType: "application/json; charset=utf-8",
    dataType: "json",
  }).success(function(data) {
    $('#InviteTeamMemberModal').modal('hide');
    //console.log(data.message);
    window.location.reload();
  }).error(function(xhr, status, err) {
    $(".invite_form_error").text($.parseJSON(xhr.responseText).message);
    $(".invite_form_error").show();
  });
}

function getgriddatabyfilters(role, status, registrationStartDate, registrationEndDate, organization, titles) {

  $(document).ajaxStart(function() {
    $(".overlay").show();
  });

  $(document).ajaxStop(function() {
    $(".overlay").hide();
  });

  var role = role.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  var status = status.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  var registrationDate = registrationStartDate;
  var registrationEndDate = registrationEndDate;
  var organization = organization.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  var titles = titles.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  var query = 'registrationDate=' + registrationDate + '&registrationEndDate=' + registrationEndDate;
  var checkedItems = [];


  //console.log(status);
  if (status === 'All') {
    $('#dropdownMenu2').next('ul').find('li input[type=checkbox]').each(function(indx, item) {
      if (indx > 0) {
        checkedItems.push($(this).next('label').text());
      }
    });

    status = checkedItems.join();
    //console.log('status--', status);
  }

  if (organization === 'All') {
    checkedItems = [];
    $('#dropdownMenu3').next('ul').find('li input[type=checkbox]').each(function(indx, item) {
      if (indx > 0) {
        checkedItems.push($(this).next('label').text());
      }
    });

    organization = checkedItems.join();
    //console.log('organization--', organization);
  }

  if (titles === 'All') {
    checkedItems = [];
    $('li.all-check').next('div').find('ul.title-dd li input[type=checkbox]').each(function(indx, item) {
      checkedItems.push($(item).next('label').text());
    });

    titles = checkedItems.join();
    //console.log('titles--', titles);
  }

  query = query + '&role=' + role;
  query = query + '&status=' + status;
  query = query + '&organization=' + organization;
  query = query + '&titles=' + titles;

  //console.log(query);
  $.ajax({
    url: "/alluserdata/?" + query,
    method: "get",
    type: 'get'
  }).success(function(data) {
    if (data) {
      $(".overlay").show();
      $('.usertable').empty();
      $('.usertable').html(data);
      $grid_title();
      // $('.modal-org').selectize();
      // $modal_org();      
      // $modal_title();      
      // $('.modal-admin-title').selectize();
      // $modal_admin_title();
      $(".overlay").hide();
    }
  }).error(function(xhr, status, err) {
    //console.log("error-->>", xhr.responseText);
  });
}

function deletetitle(idfordelete, idemail, isInvite) {
  //console.log(idfordelete);
  var email = idemail;
  var name = idfordelete;

  $.ajax({
    url: "/api/dltgame",
    method: "post",
    data: JSON.stringify({
      "email": email,
      "name": name,
      "isinvite": isInvite
    }),
    type: 'post',
    contentType: "application/json; charset=utf-8",
    dataType: "json"
  }).success(function(data) {}).error(function(xhr, status, err) {
    //console.log(err);
  });
}

function addtitle(email, title, organization, isInvite) {
  $.ajax({
    url: "/api/addgame",
    method: "post",
    data: JSON.stringify({
      "email": email,
      "title": title,
      "organization": organization,
      "isinvite": isInvite
    }),
    type: 'post',
    contentType: "application/json; charset=utf-8",
    dataType: "json"
  }).success(function(data) {
    window.location.reload();
  }).error(function(xhr, status, err) {
    //console.log(err);
  });
}

//on selection of organization change in the title dropdown
function onselectionofOrganization(checkedItems) {
  var accordianHtml = "";
  if (checkedItems.length > 0) {
    for (i = 0; i < checkedItems.length; i++) {
      for (j = 0; j < titleDictionary.length; j++) {
        if (checkedItems[i] == titleDictionary[j].key) {
          accordianHtml +=
            '<div class="panel panel-default" name="' + titleDictionary[j].key + '">' +
            '<div class="panel-heading panel-clr on">' +
            '<h4 class="panel-title">' +
            '<a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#org' + i + '">' + titleDictionary[j].key + '</a></h4>' +
            '</div>' +
            '<div id="org' + i + '" class="panel-collapse collapse in">' +
            '<div class="acc-panel-body">' +
            '<ul class="citylists title-dd">';
          var titles_underorganization = titleDictionary[j].value.split(',');
          for (k = 0; k < titles_underorganization.length; k++) {
            accordianHtml += '<li>' +
              '<input type="checkbox" id="title' + titles_underorganization[k] + '" class="titles">' +
              '<label for="title' + titles_underorganization[k] + '">' + titles_underorganization[k] + '</label>' +
              '</li>';
          }
          accordianHtml += "</ul></div></div></div>";
        }
      }
    }

    if (accordianHtml) {
      $('#accordion').html(accordianHtml);
      var $active = $('#accordion .panel-collapse.in').prev().addClass('active');
      $active.find('a').prepend('<i class="fa fa-angle-down"></i>');
      $('#accordion .panel-heading').not($active).find('a').prepend('<i class="fa fa-angle-right"></i>');
      OnTitleCheck();
    }
  }
}