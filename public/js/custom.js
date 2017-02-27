$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip(); 


$('.form_date').datetimepicker({
	orientation: 'auto top',
        weekStart: 1,
        todayBtn:  1,
		autoclose: 1,
		todayHighlight: 1,
		startView: 2,
		minView: 2,
		forceParse: 0
    }); 

});

$('.chkdd.dropdown-menu').click(function(event){
     event.stopPropagation();
 });

$( function() {
  $('.panel-clr').click( function() {
      
      $('.panel-clr').removeClass('on');
      
      $(this).toggleClass('on');
  });
});

(function($){
    $(window).on("load",function(){				
        $("#myModal .modal-body").mCustomScrollbar({
            setHeight:340,
            theme:"minimal-dark"
        });

        $("#accordion .panel-body").mCustomScrollbar({
            setHeight:300,
            theme:"dark-3"
        });

        $("#myTab .tab-pane").mCustomScrollbar({
            setHeight:280,
            theme:"inset-2-dark"
        });

    });
})(jQuery);



// Prevent dropdown to be closed when we click on an accordion link
$('.dropdown-accordion').on('click', 'a[data-toggle="collapse"]', function (event) {
  event.preventDefault();
  event.stopPropagation();
  $($(this).data('parent')).find('.panel-collapse.in').collapse('hide');
  $($(this).attr('href')).collapse('show');
  $($(this)).removeClass('fa-angle-right fa-angle-down');
});
    
jQuery(function ($) {
    var $active = $('#accordion .panel-collapse.in').prev().addClass('active');
    $active.find('a').prepend('<i class="fa fa-angle-down"></i>');
    $('#accordion .panel-heading').not($active).find('a').prepend('<i class="fa fa-angle-right"></i>');
    $('#accordion').on('show.bs.collapse', function (e) {
        $('#accordion .panel-heading.active').removeClass('active').find('.fa').toggleClass('fa-angle-right fa-angle-down');
        $(e.target).prev().addClass('active').find('.fa').toggleClass('fa-angle-right fa-angle-down');
    });
    $('#accordion').on('hidden.bs.collapse', function (e) {
   $('#accordion .panel-heading.active').removeClass('active').find('.fa').toggleClass('fa-angle-down fa-angle-right');
})
    
    var $active = $('#countryaccordion .panel-collapse.in').prev().addClass('active');
    $active.find('a').prepend('<i class="fa fa-angle-down"></i>');
    $('#countryaccordion .panel-heading').not($active).find('a').prepend('<i class="fa fa-angle-right"></i>');
    $('#countryaccordion').on('show.bs.collapse', function (e) {
        $('#countryaccordion .panel-heading.active').removeClass('active').find('.fa').toggleClass('fa-angle-right fa-angle-down');
        $(e.target).prev().addClass('active').find('.fa').toggleClass('fa-angle-right fa-angle-down');
    });
        
});