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

      $('.amount').each(function(){
        total += parseFloat($(this).val());
      });

      var totalDue = $('.due').text().replace("$","");
      var totalRemaining = totalDue - total;

      $('.totalPaid strong').text("$"+total);
      $('.remaining.diff').text("$"+totalRemaining);
      // setTimeout(location.reload.bind(location),800);

      $.ajax({
        method: "PUT",
        url: "/amount-paid/"+billID+"/"+amountPaid
      });
    });
  }


  $('.submit-form').click(function(){;
    $('#myForm').submit();
  });
});
