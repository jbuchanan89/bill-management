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

  $('#myForm').submit(function(){
    var rules = {
      "date-input": {
        default: "mm/dd/yyyy",
        name: "Date"
      },
      "type-input": {
        default: "",
        name: "Type"
      },
      "company-input": {
        default: "",
        name: "Company"
      },
      "amount-due-input": {
        default: "",
        name: "Amount Due"
      }
    };
    return validateForm(rules);
  });

  $('#signupForm').submit(function(){
    var rules = {
      "first-name-input":{
        default: "",
        name: "First Name"
      },
      "last-name-input": {
        default: "",
        name: "Last Name"
      },
      "email-input": {
        default: "",
        name: "Email"
      }
    };
    return validateForm(rules);
  });


  $('.login-btn').submit(function(){
    var rules = {
      "email-input": {
        default: "",
        name: "Email"
      },
      "password-input": {
        default: "",
        name: "Password"
      }
    };
    return validateForm(rules);
  });

  function validateForm(rules){
    $('.error').removeClass('error');
    var ValidationException = {};
    try{
      Object.keys(rules).forEach(function(input,index){
        var $el = $('input.'+input);
        if($el.val()=="" || $el.val()==rules[input].default){
          alert('You cannot leave the '+rules[input].name+" field blank");
          $el.addClass('error').focus();
          throw ValidationException;
        }
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  $(".login-link").click(function(){
    $(".signup-form").css("display", "none");
    $(".signup-form").removeClass("col-3");
      $(".login-form").addClass("col-3");
    $(".login-form").css("display", "block");

  });
  $(".signup-link").click(function(){
      $(".login-form").css("display", "none");
      $(".login-form").removeClass("col-3");
      $(".signup-form").css("display", "block");
      $(".signup-form").addClass("col-3");
  });

  $(".demo").click(function(){
    $(".signup-form").css("display", "none");
    $(".signup-form").removeClass("col-3");
    $(".login-form").addClass("col-3");
    $(".login-form").css("display", "block");
    $(".demo-info").css("display", "block");
  });

});
