$(document).ready(function() {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
		if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
		  var target = $(this.hash);
		  target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
		  if (target.length) {
			$('html, body').animate({
			  scrollTop: (target.offset().top - 48)
			}, 1000, "easeInOutExpo");
			return false;
		  }
		}
  });
  
  $('input[type="range"]').on('input change', function() {
	  var input = $(this);  
	  input.next().text(input.val());
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 54
  });
  
  // Collapse the navbar when page is scrolled
  $(window).scroll(function() {
    if ($("#mainNav").offset().top > 100) {
      $("#mainNav").addClass("navbar-shrink");
    } else {
      $("#mainNav").removeClass("navbar-shrink");
    }
  });
});

var scrollToSection = function(id, offset) {
	target = $(id);
	if (target.length) {
		$('html, body').animate({
			scrollTop: (target.offset().top - offset)
			}, 1000, "easeInOutExpo");
		return false;
	}
}

var showErrorMessage = function(message) {
	alert("Oh, no! Something went wrong!\n" + message);
}
