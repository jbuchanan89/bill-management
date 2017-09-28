$(document).ready(function(){

  if($('.paid-check').length){
    $('.paid-check').click(function(e){
      var billID = $(this).attr('data-bill');
      var bool = $(this).prop('checked');
      $.ajax({
        method: "PUT",
        url: "/paid/"+billID+"/"+bool
      });
    });
  }


});
