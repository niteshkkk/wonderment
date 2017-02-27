


var $grid_title =  function(){
  $('.grid-title').selectize({
    plugins: ['remove_button'],
    persist: false,
    maxItems: null,
    options:[],
    render: {
        item: function(data, escape) {               
            return '<div>"' + escape(data.text) + '"</div>';
        }
    },
    create: function(input) {
      if($('.loginuserrole').val() === 'su'){
        return {
            value: input,
            text: input
        };
      }else{
        return false;
      }
    },
    onDelete: function(values) {
        var cnfrm = confirm(values.length > 1 ? 'Are you sure you want to remove these ' + values.length + ' items?' : 'Are you sure you want to remove "' + values[0] + '"?');
        if(cnfrm){
            var idfordelete= values[0];
            var idemail= $(this.$input).parents('tr').find(".email").text();
            var isInvite = ($(this.$input).parents('tr').find('.invite').text() === 'Invited') ? true : false;
            deletetitle(idfordelete,idemail, isInvite);
        }
        return cnfrm;
    },
    onItemAdd: function(input){
        var email= $(this.$input).parents('tr').find('.email').text();
        if(email){
          var organization = '';
          if($('.loginuserrole').val() === 'su'){
            organization = $(this.$input).parents('tr').find('.org').text();
          }else{
             organization = $('.loginuserorg').text();
          }
          var isInvite = ($(this.$input).parents('tr').find('.invite').text() === 'Invited') ? true : false;
          addtitle(email, input, organization, isInvite);
        }
    },
    onInitialize:function(){
        var self = this;
        var organization = '';
        if($('.loginuserrole').val() === 'su'){
          organization = $(self.$input).parents('tr').find('.org').text();
        }else{
           organization = $('.loginuserorg').text();
        }
        var titles = [];
        $.each(optns,function(indx, item){
           if(organization === item.key){
              if(item.value.indexOf(',') > 0){
                 titles = item.value.split(',');
              }
              else{
                    titles.push(item.value);
                  }
           }
        });
        if(titles.length > 0){
           $.each(titles,function(indx, title){
              self.addOption({'text': title, 'value': title});                  
           });               
        }

        this.onMouseDown = (function() {
            var original = self.onMouseDown;
            return function() {
                self.isOpen ? self.close() : self.open();
                self.isOpen ? setTimeout(function(){$('.selectize-input.input-active').css('cssText', 'background: url(../images/input-arw-up.png) no-repeat right top #fff !important');}, 100) : $('.selectize-input').css('cssText', 'background: url(../images/input-arw.png) no-repeat right top #fff !important');
                return original.apply(this, arguments);
            };
        })();
    },
      onFocus:function(){          
        setTimeout(function(){ 
            $('.selectize-input.input-active').css('cssText', 'background: url(../images/input-arw-up.png) no-repeat right top #fff !important');
        }, 100);        
      },
      onBlur:function(){
       $('.selectize-input').css('cssText', 'background: url(../images/input-arw.png) no-repeat right top #fff !important');
      }
      
  });
}

var $modal_admin_title = function(){ 
  $('.modal-admin-title').selectize({
        plugins: ['remove_button'],
        placeholder: 'Enter game titles for this member.',
        render: {
            item: function(data, escape) {               
                return '<div>"' + escape(data.text) + '"</div>';
            }
        },
        create: function(input) {
            return {
                value: input,
                text: input
            };
        }
    });
}

    var $modal_org = function(){
      $('.modal-org').selectize({
        persist: false,
        maxItems: 1,
        options: orgs,
        placeholder: 'Organization',
        render: {
            item: function(data, escape) {               
                return '<div>"' + escape(data.text) + '"</div>';
            }
        },
        create: function(input) {
            return {
                value: input,
                text: input
            };
        },
        onItemAdd: function(organization){
            var self = this;
            var titleControl = $(".modal-admin-title")[0].selectize;
            var titles = [];
            $("input[name='inviteorg']").val(organization);
            $.each(optns,function(indx, item){
               if(organization === item.key){
                  if(item.value.indexOf(',') > 0){
                     titles = item.value.split(',');
                  }
                  else{
                    titles.push(item.value);
                  }
               }
            });
            titleControl.clearOptions();               
            if(titles.length > 0){
               $.each(titles,function(indx, title){
                  titleControl.addOption({'text': title, 'value': title});                  
               });               
            }
        }
    });
}




    var $modal_title = function(){ $('.modal-title').selectize({
        plugins: ['remove_button'],
        placeholder: 'Enter game titles for this member.',
        render: {
            item: function(data, escape) {               
                return '<div>"' + escape(data.text) + '"</div>';
            }
        },
        create: false,
        onInitialize:function(){
            var self = this;
            var organization = $('.loginuserorg').text();
            var titles = [];
            $.each(optns,function(indx, item){
               if(organization === item.key){
                  if(item.value.indexOf(',') > 0){
                     titles = item.value.split(',');
                  }
                  else{
                    titles.push(item.value);
                  }
               }
            });
            if(titles.length > 0){
               $.each(titles,function(indx, title){
                  self.addOption({'text': title, 'value': title});                  
               });               
            }

            this.onMouseDown = (function() {
                var original = self.onMouseDown;
                return function() {
                    self.isOpen ? self.close() : self.open();
                    self.isOpen ? setTimeout(function(){$('.selectize-input.input-active').css('cssText', 'background: url(../images/input-arw-up.png) no-repeat right top #fff !important');}, 100) : $('.selectize-input').css('cssText', 'background: url(../images/input-arw.png) no-repeat right top #fff !important');
                    return original.apply(this, arguments);
                };
            })();
        },
        onFocus:function(){          
          setTimeout(function(){ 
              $('.selectize-input.input-active').css('cssText', 'background: url(../images/input-arw-up.png) no-repeat right top #fff !important');
          }, 100);          
        },
        onBlur:function(){
         $('.selectize-input').css('cssText', 'background: url(../images/input-arw.png) no-repeat right top #fff !important');
        }
    });
}

$grid_title();
$('.modal-org').selectize();
$modal_org();
$modal_admin_title();
$modal_title();