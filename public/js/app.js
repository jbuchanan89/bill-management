$(document).ready(function(){

  if($('.paid-check').length){
    $('.paid-check').click(function(e){
      var billID = $(this).attr('data-bill');
      var bool = $(this).prop('checked');
      $(this).parent().siblings('.minimum').attr('class','minimum minimum-'+bool);
      $.ajax({
        method: "PUT",
        url: "/paid/"+billID+"/"+bool
      });
    });




    $('.amount').change(function(e){
      var billID = $(this).attr('data-bill');
      var amountPaid = $(this).val();
      var total = 0;
      var val = $('.due').val();
      var sum = 0;
      $('.amount').each(function(){
        total += parseFloat($(this).val());
      });
      $('.totalPaid strong').text("$"+total);
      setTimeout(location.reload.bind(location), 500);

      $.ajax({
        method: "PUT",
        url: "/amount-paid/"+billID+"/"+amountPaid
      });
    });
  }

});
