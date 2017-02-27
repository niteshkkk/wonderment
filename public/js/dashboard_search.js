var isreverted = false;
var issaveenabled = false;
var totolNumberofRecords = 0;
var recordsToShow = 10;
var gridCurrentIndex = 1;
var totalPages = 0;
var sourceplatform_click = false;

$(document).ready(function() {

  $("a.gametitle").attr("href", function(i, href) {
    var org = $("#orgna").text().trim();
    return href + '&org=' + org;
  });


  $("a.clsorg").on("click", function(e) {
    $('#orgna').text(this.text);
    $("#dropdownMenu8").val(this.text);
    return true;
  });

  $("a.gametitle").on("click", function(e) {
    $('#game').text(this.text);
    $("#dropdownMenu2").val(this.text);
    return true;
  });

  $('.form_date').datetimepicker({
    orientation: 'auto top',
    weekStart: 1,
    todayBtn: 1,
    autoclose: 1,
    todayHighlight: 1,
    startView: 2,
    minView: 2,
    forceParse: 0,
    pickTime: false
  });


  onReportClick("ua_dashboard");
  reportnameOnSaveas();
  actionaftertypingonReportTile();
  //pagingrid();


  //-------------------ORGANIZATION DD-----------------------------------

  $('ul.organization input[type=text]').keyup(function() {
    var searchText = $(this).val();
    $('ul.organization li').each(function() {
      var currentLiText = $(this).find('a').text();
      if (currentLiText && currentLiText !== '' && currentLiText.trim() !== 'All') {
        var showCurrentLi = currentLiText.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
        $(this).toggle(showCurrentLi);
      }
    });
  });

  //-------------------GAME TITLE --------------------------------------
  $('ul.gametitle input[type=text]').keyup(function() {
    var searchText = $(this).val();
    $('ul.gametitle li').each(function() {
      var currentLiText = $(this).find('a').text();
      if (currentLiText && currentLiText !== '' && currentLiText.trim() !== 'All') {
        var showCurrentLi = currentLiText.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
        $(this).toggle(showCurrentLi);
      }
    });
  });

  //-------------------REPORT TITLE --------------------------------------
  ReportClickEvent()


  //-------------------END OF REPORT TITLE --------------------------------------



  //-------------------PLATFORM --------------------------------------

  Platformdropdown();
  //-------------------END OF PlATFORM--------------------------------------



  //-------------------SOURCE --------------------------------------
  Sourcedropdown();

  //-------------------END OF SOURCE--------------------------------------



  //-------------------COUNTRY --------------------------------------
  Countrydropdown();

  //-------------------END OF COUNTRY--------------------------------------


  //------------------------Horizon check----------------------------
  Horizoncheck();

  //------------------------End of Horizon check----------------


  //-----------------Ondatechange-----------------------------
  OnstartDatechange();

  //--------------END of Ondatechange------------------------


  //-------Set the date
  SetdateOnload();
  //-------End of set the date
  

  //------------ activate paging of grid
  //OnPagingNumberclick();


  //export csv
  exportcsv();


  // when report id select make save disable

  if ($("#dropdownMenu3").val()) {
    issaveenabled = false;
    $(".save-btns a#saveReport").attr('disabled');
    $(".save-btns a#saveReport").addClass("disabled");
    $("#reportName").val($("#dropdownMenu3").val());

  } else {
    issaveenabled = true;
    $(".save-btns a.saveas").attr('disabled');
    $(".save-btns a.saveas").addClass("disabled");
  }

   // get the grid data via ajax call after the page is ready-----------------------

getGridData(true);

//---END

});


function ReportClickEvent() {
  $('ul.reporttitle input[type=text]').keyup(function() {
    var searchText = $(this).val();
    $('ul.reporttitle li').each(function() {
      var currentLiText = $(this).find('a').text();
      if (currentLiText && currentLiText !== '' && currentLiText.trim() !== 'All') {
        var showCurrentLi = currentLiText.toLowerCase().indexOf(searchText) !== -1;
        $(this).toggle(showCurrentLi);
      }
    });
  });


  //$('ul.reporttitle li a').click(
  $("ul.reporttitle li").on("click", "a.column_chart_title", function() {
    var checkedValues = $(this).text();
    $("#dropdownMenu3").val(checkedValues);
    $("#dropdownMenu3").html('<span class="fa fa-angle-down pull-right mt-3"></span>' + checkedValues);
    $("#reportName").val(checkedValues);
    afterrevertdone();
  });
}


function torevertback() {
  var reportselectedvalue = $("#dropdownMenu3").val();
  if (reportselectedvalue) {
    if (!isreverted) {
      isreverted = true;
      $(".save-btns a#revert").removeAttr('disabled');
      $(".save-btns a#revert").removeClass("disabled").addClass("revert");
    } else {
      isreverted = false;
      $(".save-btns a#revert").attr('disabled', 'disabled');
      $(".save-btns a#revert").removeClass("revert").addClass("disabled");
    }
  } else {
    $(".save-btns a#revert").attr('disabled', 'disabled');
    $(".save-btns a#revert").removeClass("revert").addClass("disabled");
  }
}

function afterrevertdone() {
  if (isreverted) {
    isreverted = false;
    $(".save-btns a#revert").attr('disabled', 'disabled');
    $(".save-btns a#revert").removeClass("revert").addClass("disabled")
  }
}

function reverdata() {
  if (!$("#revert").attr("disabled") && $("#revert").attr("class") == "revert") {
    var reporttitlename = $("#dropdownMenu3").val();
    var title = $('#dropdownMenu2 span.ea-hd').text();
    $.ajax({
      url: "/ua_dashboard/title?title=" + title + "&reporttitlename=" + reporttitlename,
      method: "get",
      type: 'get',
    }).success(function(data) {
      // console.log('data',data);
      $("#fileterdiv").html();
      $("#fileterdiv").html(data);
      issaveenabled = false;
      $(".save-btns a#saveReport").attr('disabled');
      $(".save-btns a#saveReport").addClass("disabled");
      issaveenabled = false;
      $(".save-btns a#saveReport").attr('disabled');
      $(".save-btns a#saveReport").addClass("disabled");

      var li_inputtag = $('ul.reporttitle li a[reporttitlename= "' + reporttitlename + '"]');
      $("#reportName").val(reporttitlename);
      populatereportid(li_inputtag);
      setvalue4Hiddenfields();
      //dashboardData = JSON.parse(unescape($('input[name=gridData]').val()));
      //ongridnewbind();
      ActivateData();
      afterrevertdone();
    });
  }
}

function Sourcedropdown() { //ontoggleclass();

  $('ul#sourcemenu input[type=text]').keyup(function() {
    var searchText = $(this).val();
    $('ul#sourcemenu li').each(function() {
      var currentLiText = $(this).find('label').text();
      if (currentLiText && currentLiText !== '' && currentLiText.trim() !== 'All') {
        var showCurrentLi = currentLiText.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
        $(this).toggle(showCurrentLi);
      }
    });
  });

  $('ul#sourcemenu input[type=checkbox]').unbind().click(function() {
    var checkedItems = [];
    var checkedValues = $(this).next('label').text();
    var checkboxcount = 0;
    //var alreadycheckedvalues = $("#dropdownMenu3").val();
    if (this.id === 'all_source') {
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
            checkboxcount = checkboxcount + 1;

            allChecked = false;
          }
        }
      });

      checkedValues = checkedItems.join(", ");
      $('ul#sourcemenu #all_source').prop('checked', false);

      if (checkboxcount > 0 && checkboxcount == $('ul#sourcemenu input[type=checkbox]').length - 1) {
        checkedValues = "All";
        $('ul#sourcemenu #all_source').prop('checked', true);

      }
    }

    $("#dropdownMenu1").val(checkedValues);
    //if(checkedValues.length > 10) checkedValues = checkedValues.substring(0,10)+'...';
    $("#dropdownMenu1").text();
    $("#dropdownMenu1").html('<span class="fa fa-angle-down pull-right pt-2"></span>' + checkedValues);


    sourceplatform_click = true;
  });
}


function Platformdropdown() {
  $('ul#platformmenu input[type=text]').keyup(function() {
    var searchText = $(this).val();
    $('ul#platformmenu li').each(function() {
      var currentLiText = $(this).find('label').text();
      if (currentLiText && currentLiText !== '' && currentLiText.trim() !== 'All') {
        var showCurrentLi = currentLiText.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
        $(this).toggle(showCurrentLi);
      }
    });
  });
  $('ul#platformmenu input[type=checkbox]').unbind().click(function() {
    var checkedItems = [];
    var checkedValues = $(this).next('label').text();
    var checkboxcount = 0;
    //var alreadycheckedvalues = $("#dropdownMenu3").val();

    if (this.id === 'all') {
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
            checkboxcount = checkboxcount + 1;
            allChecked = false;
          }
        }
      });
      checkedValues = checkedItems.join(", ");
      $('ul#platformmenu #all').prop('checked', false);
      if (checkboxcount > 0 && checkboxcount == $('ul#platformmenu input[type=checkbox]').length - 1) {
        checkedValues = "All";
        $('ul#sourcemenu #all').prop('checked', true);

      }
    }


    $("#dropdownMenu4").val(checkedValues);
    //if(checkedValues.length > 10) checkedValues = checkedValues.substring(0,10)+'...';
    $("#dropdownMenu4").text();
    $("#dropdownMenu4").html('<span class="fa fa-angle-down pull-right pt-2"></span>' + checkedValues);


    sourceplatform_click = true;
  });
}


function Countrydropdown() {
  $('ul.country-ht input[type=text]').keyup(function() {
    var searchText = $(this).val();
    $('div.country-li-width li').each(function() {
      var currentLiText = $(this).text();
      if (currentLiText && currentLiText !== '' && currentLiText.trim() !== 'All') {
        var showCurrentLi = currentLiText.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
        $(this).toggle(showCurrentLi);
      }
    });
  });
  $('div.country-li-width li').unbind().click(function() {
    var checkedValues = $(this).text();
    $("#dropdownMenuCountry").val(checkedValues);
    $("#dropdownMenuCountry").html('<span class="fa fa-angle-down pull-right pt-2"></span>' + checkedValues);

    onselectionof_Filters();
    $('div.country-li-width li').each(function(idx, item) {
      $(item).removeClass('active-country');
    });
    $(this).addClass('active-country');
  });
}

function Horizoncheck() {
  $(".horizon label input[type= 'radio']").change(function() {

    onselectionof_Filters();
  });
}

function populatereportid(e) {
  var id = $(e).attr("data-id");
  var name = $(e).attr("data-name");
  $("#hdnreportid").val(id);
  $("#hdnReportTitle").val(name);

}

function SetdateOnload() {
  if ($("#dtp_input2").val()) {
    var F_date = ($("#dtp_input2").val().indexOf('-') > 0) ? new Date($("#dtp_input2").val().substring(0, 10).replace(/\-/g, '/')) : $("#dtp_input2").val();
    $('#cohortStartDate').datetimepicker("setDate", F_date);
  }
  if ($("#dtp_input3").val()) {
    var E_date = ($("#dtp_input3").val().indexOf('-') > 0) ? new Date($("#dtp_input3").val().substring(0, 10).replace(/\-/g, '/')) : $("#dtp_input3").val();
    $('#cohortEndDate').datetimepicker("setDate", E_date);
  }
}

function ActivateData() {

  $("i.fa-info-circle").tooltip();
  //---for scrollbar activation of the dropdowns
  $(".filterDashBoard div.mCustomScrollbar").mCustomScrollbar({
    theme: "light",
    scrollButtons: {
      enable: true
    },
    scrollInertia: 0,
    advanced: {
      autoScrollOnFocus: false,
      updateOnContentResize: true
    }
  });

  Sourcedropdown();
  Countrydropdown();
  Platformdropdown();
  Horizoncheck();
  //OnPagingNumberclick();

  $('.form_date').datetimepicker({
    orientation: 'auto top',
    weekStart: 1,
    todayBtn: 1,
    autoclose: 1,
    todayHighlight: 1,
    startView: 2,
    minView: 2,
    forceParse: 0,
    pickTime: false
  });

  OnstartDatechange();
  SetdateOnload();
  //pagingrid();
  $('.chkdd.dropdown-menu').click(function(event) {
    event.stopPropagation();
  });
  exportcsv();
}



function OnstartDatechange() {
  $('.form_date').datetimepicker().on('changeDate', datechange);
}

function datechange() {

  var cohortStartDate = $("#cohortStartDate").data("datetimepicker").getDate();
  var cohortEndDate = $("#cohortEndDate").data("datetimepicker").getDate();

  if ($('#dtp_input2').val() && $('#dtp_input3').val()) {
    if (cohortStartDate > cohortEndDate) {
      $("#message").html("Cohort End Date should be greater than start date");
      return false;
    } else {
      $("#message").html("");

      var reportDatanew = getModelforFilterApplied();
      similartoreportselected();

      $.ajax({
        url: "/ua_dashboard/cohortchange",
        method: "get",
        type: 'get',
        data: reportDatanew,
        contentType: "application/json; charset=utf-8",
        dataType: "html"
      }).success(function(data) {
        $("#fileterdiv").html();
        $("#fileterdiv").html(data);

        //dashboardData = JSON.parse(unescape($('input[name=gridData]').val()));

        //ongridnewbind();
        ActivateData();
        getGridData(true);

      }).error(function(xhr, status, err) {
        if (err == "Conflict") {
          $("#message").html("Error in binding");
        } else {
          $("#message").html("Error in binding");
        }
      }).complete(function(xhr){
    $(".overlay").hide();
  });


      //dashboardgrid(reportDatanew.cohortstartdate, reportDatanew.cohortendtdate, reportDatanew.platforms,reportDatanew.sources ,reportDatanew.horizon, reportDatanew.country,reportDatanew.organiclift); 
    }
  } else {
    $("#message").html("Cohort End Date and Start date cannot be blank");
    return false;
  }
}

function dateformat(date) {
  var date = new Date(date.replace(/\-/g, '/')),
    yr = date.getFullYear(),
    month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1),
    day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
    newDate = yr + '-' + month + '-' + day;
  //console.log(newDate);
  return newDate
}

//dashboard grid method start--------------

//var dashboardData=[];


function showPageIndex(ctrl, currentIndex) {
  //dashboardData = JSON.parse(unescape($('input[name=gridData]').val()));
  gridCurrentIndex = currentIndex;

  var startDataRange = (currentIndex * recordsToShow);

  var filterData = dashboardData.slice(startDataRange, (parseInt(startDataRange) + parseInt(recordsToShow)));
  gridDataBindToTable(filterData);

}

function gridPrevious() {
  if (gridCurrentIndex == 1)
    return;

  var currentIndex = gridCurrentIndex - 1;

  var currentIndex = gridCurrentIndex - 1;
  $("#pagecount").text((currentIndex ) + " of " + totalPages);
  $(".txtpagenumber").val((currentIndex ));
  getGridData(false, currentIndex);
}

function gridNext() {

  if (gridCurrentIndex == totalPages)
    return;

  currentIndex = gridCurrentIndex + 1;
  var ctrl = "";
  $("#pagecount").text((currentIndex ) + " of " + totalPages);
  $(".txtpagenumber").val((currentIndex ));
  getGridData(false, currentIndex);
}

function pagingrid() {
  //dashboardData = JSON.parse(unescape($('input[name=gridData]').val()));
  totolNumberofRecords = dashboardData.length;
  if ($('form.table-pagination select option:selected').length > 0) {
    recordsToShow = $('form.table-pagination select').find(":selected").text();
  }
  // var filterData=[];
  // filterData=dashboardData.slice(0,recordsToShow);
  totalPages = Math.ceil(totolNumberofRecords / recordsToShow);

  if (dashboardData.length == 0) {
    $("#pagecount").text("0 of " + totalPages);
    gridCurrentIndex = 0;
    $(".txtpagenumber").val(0);
  } else {
    $("#pagecount").text("1 of " + totalPages);
    $(".txtpagenumber").val(1);
  }
}

function bindtableonclicks() {
  //dashboardData = JSON.parse(unescape($('input[name=gridData]').val()));
  recordsToShow = 10;
  gridCurrentIndex = 0;
  totalPages = 0;
  totolNumberofRecords = dashboardData.length;

  if ($('form.table-pagination select option:selected').length > 0) {
    recordsToShow = $('form.table-pagination select').find(":selected").text();
  }
  var filterData = [];
  filterData = dashboardData.slice(0, recordsToShow);
  gridDataBindToTable(filterData);
  totalPages = Math.ceil(totolNumberofRecords / recordsToShow);
  if (dashboardData.length == 0) {
    $("#pagecount").text("0 of " + totalPages);
    $(".txtpagenumber").val(0);
  } else {
    $("#pagecount").text("1 of " + totalPages);
    $(".txtpagenumber").val(1);
  }
}

//-------------------------
// function ongridnewbind() {
//   totolNumberofRecords = 0;
//   recordsToShow = 10;
//   gridCurrentIndex = 0;
//   totalPages = 0;
// }


//----------------------------------------
function OnPagingNumberclick() {
  $('form.table-pagination select').unbind().change(function() {
    if (totalPages > 0) {
      getGridData(true, 1)
    }
  });


  document.querySelector(".txtpagenumber").addEventListener("keypress", function(evt) {
    if (evt.which < 48 || evt.which > 57) {
      evt.preventDefault();
    }
  });

  //$('.txtpagenumber').on('blur', setPageNumber);
  $('.txtpagenumber').on('keypress', function(e) {
    if (e.which === 13) {
if (totalPages > 0) {
      var numbernew = $('.txtpagenumber').val().trim();
      if (numbernew) {
 if(numbernew > totalPages)
        {
          numbernew = 1;
          $(".txtpagenumber").val(numbernew);

        }
        
        $("#pagecount").text(numbernew + " of " + totalPages);
        getGridData(false, numbernew);
        
      } else {
        $(".txtpagenumber").val(" ");
      }
    }
      
    }
  });

  function setPageNumber() {
    var ctrl = "";
    var number = $('.txtpagenumber').val();

    if (number) {

      if (number == 0) {
        number = 1;
      }
      if (number > totalPages) {
        number = 1;
      }

      if (totalPages > 0) {
        showPageIndex(ctrl, number - 1);
        $("#pagecount").text(number + " of " + totalPages);
        $('.txtpagenumber').val(number);
      }
    }
  } // end setPageNumber

} // end OnPagingNumberclick


function dashboardgrid(cohortstartdate, cohortendtdate, platforms, sources, horizon, country, organiclift) {

  var reportDatanew = getModelforFilterApplied();
  similartoreportselected();

  $.ajax({
    url: "/ua_dashboard/gridviewfilterchange",
    method: "get",
    data: reportDatanew,
    type: 'get',
  }).success(function(data) {
    $("i.fa-info-circle").tooltip();
    $("#griddash").html();
    $("#griddash").html(data);
    //dashboardData = JSON.parse(unescape($('input[name=gridData]').val()));
    //ongridnewbind();
    //pagingrid();
    //OnPagingNumberclick();
    getGridData(true);
  }).error(function(xhr, status, err) {

  }).complete(function(xhr){
    $(".overlay").hide();
   });;
}

function showDashboardData() {
  $.ajax({
    url: "/api/dashboardapifilterdetaildata",
    method: "get",
    type: 'get',
  }).success(function(data) {
    $("i.fa-info-circle").tooltip();
    dashboardData = data.resultsvalues;
    totolNumberofRecords = dashboardData.length;

    var query = {
      country: "Country 1"
    };

    //query=+{Platform: "Platform 1"};

    var filterData = [];
    //filterData =_.where(dashboardData, query );

    filterData = dashboardData.slice(0, recordsToShow);

    //filterData.slice(1,10)

    $("#gridCurrentRecord").html(10);
    $("#gridTotalCount").html(totolNumberofRecords)

    gridDataBindToTable(filterData);

    totalPages = Math.ceil(totolNumberofRecords / recordsToShow);

    //prepare paging
    var paging = "";
    paging += "<li><a onclick='gridPrevious()' aria-label='Previous'> <span aria-hidden='true'>&laquo;</span> </a> </li>";

    for (var i = 0; i < totalPages; i++) {

      pagerTitle = i + 1;

      if (i == 0) {
        paging += "<li><a href='javascript:void(0);' class='active' onclick='showPageIndex(this,0);' >1</a></li>"
      } else {
        paging += "<li><a href='javascript:void(0);' onclick='showPageIndex(this," + i + ");' >" + pagerTitle + "</a></li>";
      }
    }

    paging += "<li> <a href='javascript:void(0);' onclick='gridNext()' aria-label='Next'> <span aria-hidden='true'>&raquo;</span> </a></li>"

    $(".pagination").append(paging);


  });
}

function gridDataBindToTable(filterData) {
  $("#tbldashboardapifilterdata").html("");

  var content = "";

  for (var i = 0; i < filterData.length; i++) {
    content += '<tr>';
    content += '<td>' + filterData[i].Platform + '</td>';
    content += '<td>' + filterData[i].source + '</td>';
    content += '<td>' + filterData[i].window + ' Days </td>';
    content += '<td>' + filterData[i].country + '</td>';
    content += '<td>$' + filterData[i].ProjectedARPI + '</td>';
    content += '<td>' + filterData[i].PlayerCount + '</td>';
    content += '<td>' + filterData[i].PayerCount + '</td>';
    content += '<td>' + filterData[i].Cohort_Date + '</td>';
    content += '</tr>';
  }

  $("#tbldashboardapifilterdata").html(content);

}

//dashboard grid method end --------------


function getModelforFilterApplied() {

  var mindategrid = dateformat($("#dtp_input3").val());
  var maxdategrid = dateformat($("#dtp_input2").val());
  var reportDatanew = {};
  reportDatanew.cohortstartdate = maxdategrid;
  reportDatanew.cohortendtdate = mindategrid;
  reportDatanew.platforms = [];
  reportDatanew.sources = [];
  reportDatanew.horizon = [];

  //save platforms
  if ($("#dropdownMenu4").val() == "") {
    reportDatanew.platforms.push("All");
  } else {
    var platformslist = $("#dropdownMenu4").val().split(',');
    for (var i = 0; i < platformslist.length; i++) {
      if (platformslist[i]) {
        reportDatanew.platforms.push(platformslist[i].trim());
      }
    }
  }

  //save sources
  if ($("#dropdownMenu1").val() == "") {
    reportDatanew.sources.push("All");;
  } else {
    var sourceslist = $("#dropdownMenu1").val().split(',');
    for (var i = 0; i < sourceslist.length; i++) {
      if (sourceslist[i]) {
        reportDatanew.sources.push(sourceslist[i].trim());
      }
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

  reportDatanew.organiclift = true;
  reportDatanew.gameTitle = $("#hdntitle").val();
  reportDatanew.org = $("#hdnorganization").val();
  return reportDatanew;
}

function onselectionof_Filters() {
  sourceplatform_click = false;
  var reportDatanew = getModelforFilterApplied();
  dashboardgrid(reportDatanew.cohortstartdate, reportDatanew.cohortendtdate, reportDatanew.platforms, reportDatanew.sources, reportDatanew.horizon, reportDatanew.country, reportDatanew.organiclift);

}

$('body').click(function(e) {
  if (sourceplatform_click) {
    onselectionof_Filters();
  }
});

function exportcsv() {
  $(".export-csv").click(function(e) {

    var reportDatanew = getModelforFilterApplied();


    $.ajax({
      url: "/ua_dashboard/expfile",
      data: reportDatanew,
      method: "get",
      type: 'get'
    }).success(function(data) {

      // window.open('/download/'+data+'.csv');
      location.assign('/download/' + data + '.csv');

    });

  });
}

function onReportClick(url) {

  $(".column_chart_title").on("click", function(e) {

    var id = this.attributes['data-id'].value;
    var name = this.attributes['data-name'].value;

    var reporttitlename = $(this).attr("reporttitlename");
    var title = $(this).attr("title");
    var organization = $("#orgna").text().trim();

    $.ajax({
      url: "/" + url + "/title?title=" + title + "&reporttitlename=" + reporttitlename + "&organization=" + organization + "&rid=" + id,
      method: "get",
      type: 'get',
    }).success(function(data) {
      // console.log('data',data);
      $("#fileterdiv").html();
      $("#fileterdiv").html(data);
      issaveenabled = false;
      $(".save-btns a#saveReport").attr('disabled');
      $(".save-btns a#saveReport").addClass("disabled");
      var li_inputtag = $('ul.reporttitle li a[reporttitlename= "' + reporttitlename + '"]');
      $("#reportName").val(reporttitlename);
      populatereportid(li_inputtag);
      setvalue4Hiddenfields();
      //dashboardData = JSON.parse(unescape($('input[name=gridData]').val()));
      //ongridnewbind();
      ActivateData();
      afterrevertdone();
getGridData(true);

    }).complete(function(xhr){
    $(".overlay").hide();
  });;

  });
}

//to check the changes are similar to report selected
function similartoreportselected() {

  if ($("#dropdownMenu3").val()) {
    var arr_platform = $("#hdnplatform").val().split(',');
    var arr_source = $("#hdnsource").val().split(',');
    var country = $("#hdncountry").val();
    var cohortstartdate = $("#hdnstartdate").val();
    var cohortenddate = $("#hdnenddate").val();
    var horizon = $("#hdnhorizon").val();


    var platformslist = [];
    if ($("#dropdownMenu4").val() == "") {
      platformslist.push("All");
    } else {
      platformslist = $("#dropdownMenu4").val().split(',');
    }
    var arr_platformCount = 0;

    for (var i = 0; i < platformslist.length; i++) {
      for (var j = 0; j < arr_platform.length; j++) {
        if (arr_platform[j].trim() == platformslist[i].trim()) {
          arr_platformCount += 1;
        }
      }
    }

    if (arr_platformCount == arr_platform.length && arr_platformCount == platformslist.length) {


      var sourcelist = [];
      if ($("#dropdownMenu1").val() == "") {
        sourcelist.push("All");
      } else {
        sourcelist = $("#dropdownMenu1").val().split(',');
      }

      var arr_sourceCount = 0;

      for (var i = 0; i < sourcelist.length; i++) {
        for (var j = 0; j < arr_source.length; j++) {
          if (arr_source[j].trim() == sourcelist[i].trim()) {
            arr_sourceCount += 1;
          }
        }
      }

      if (arr_sourceCount == arr_source.length && arr_sourceCount == sourcelist.length) {

        if (country == $("#dropdownMenuCountry").val()) {

          if ($("#dtp_input3").val() == cohortenddate) {
            if ($("#dtp_input2").val() == cohortstartdate) {
              if ($(".btn-group input[type='radio']:checked").val().split(' ')[0] == horizon) {

                if ($("#reportName").val().trim() == $("#hdnReportTitle").val()) {
                  issaveenabled = false;
                  $(".save-btns a#saveReport").attr('disabled');
                  $(".save-btns a#saveReport").addClass("disabled");
                  isreverted = true;
                  torevertback();
                  return;
                }
              }
            }
          }
        }
      }
    }
    issaveenabled = true;
    $(".save-btns a#saveReport").removeAttr('disabled');
    $(".save-btns a#saveReport").removeClass("disabled");
    isreverted = false;
    torevertback();
    return false;
  }

}

function setvalue4Hiddenfields() {
  $("#hdnplatform").val($("#dropdownMenu4").val());
  $("#hdnsource").val($("#dropdownMenu1").val());
  $("#hdncountry").val($("#dropdownMenuCountry").val());
  $("#hdnstartdate").val($("#dtp_input2").val());
  $("#hdnenddate").val($("#dtp_input3").val());
}

function getGridData(ispageload, pageindex){

  $(document).unbind("ajaxStart ajaxStop");
  

var reportDatanew = getModelforFilterApplied();
reportDatanew.pageload = ispageload;
if(!ispageload)
{
  reportDatanew.pagesize = $('form.table-pagination select').find(":selected").text();
  if(pageindex)
  {
    reportDatanew.pageindex = pageindex;
    gridCurrentIndex =parseInt(pageindex);
  }
}
else
{
  reportDatanew.pagesize = $('form.table-pagination select').find(":selected").text();
 
}

$.ajax({
        url: "/ua_dashboard/getGriddata",
        method: "get",
        type: 'get',
        data: reportDatanew,
        contentType: "application/json; charset=utf-8",
        dataType: "html"
      }).success(function(data) {
        // $("#fileterdiv").html();
        // $("#fileterdiv").html(data);
        // historicalData = JSON.parse(unescape($('input[name=gridData]').val()));
        // ongridnewbind();
        // ActivateData();
          if(ispageload)
          {
          $("#dashgridmain").html();
          $("#dashgridmain").html(data);
          OnPagingNumberclick();
          }
          else{
          $('table.manage-accounts-table tbody').remove();
          $('table.manage-accounts-table').append(data);

          }

          $("i.fa-info-circle").tooltip();

      }).error(function(xhr, status, err) {
        if (err == "Conflict") {
          $("#message").html("Error in binding");
        } else {
          $("#message").html("Error in binding");
        }
      }).complete(function(xhr){
        $(document).ajaxStart(function() {
          // $( ".overlay" ).text( "Triggered ajaxStart handler." );
          $(".overlay").show();
        });

        $(document).ajaxStop(function() {
          // $( ".overlay" ).text( "Triggered ajaxStop handler." );
          $(".overlay").hide();
        });
      });

}