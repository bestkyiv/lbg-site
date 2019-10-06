/*
Template Name: Wrapkit Ui Kit
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: js
*/
$(function () {
    "use strict";
    // ============================================================== 
    //This is for preloader
    // ============================================================== 
    $(function () {
        $(".preloader").fadeOut();
    });
    // ============================================================== 
    //Tooltip
    // ============================================================== 
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
    // ============================================================== 
    //Popover
    // ============================================================== 
    $(function () {
        $('[data-toggle="popover"]').popover()
    })
    // ============================================================== 
    // For mega menu
    // ============================================================== 
    jQuery(document).on('click', '.mega-dropdown', function (e) {
        e.stopPropagation()
    }); 
     jQuery(document).on('click', '.navbar-nav > .dropdown', function(e) {
         e.stopPropagation();
    });
    $(".dropdown-submenu").click(function(){
              $(".dropdown-submenu > .dropdown-menu").toggleClass("show");                     
    }); 
    // ============================================================== 
    // Resize all elements
    // ============================================================== 
    $("body").trigger("resize");
    // ============================================================== 
    //Fix header while scroll
    // ============================================================== 
    var wind = $(window);
    wind.on("load", function() {
        var bodyScroll = wind.scrollTop(),
            navbar = $(".topbar");
        if (bodyScroll > 100) {
            navbar.addClass("fixed-header animated slideInDown")
        } else {
            navbar.removeClass("fixed-header animated slideInDown")
        }
    });
    $(window).scroll(function () {
        if ($(window).scrollTop() >= 100) {
            $('.topbar').addClass('fixed-header animated slideInDown');
            $('.bt-top').addClass('visible');
        } else {
            $('.topbar').removeClass('fixed-header animated slideInDown');
            $('.bt-top').removeClass('visible');
        }
    });
    // ============================================================== 
    // Animation initialized
    // ============================================================== 
    AOS.init();
    // ============================================================== 
    // Back to top
    // ============================================================== 
    $('.bt-top').on('click', function (e) {
        e.preventDefault();
        $('html,body').animate({
            scrollTop: 0
        }, 700);
    });
    $('.port1').owlCarousel({
        loop: true,
        margin: 30,
        nav: false,
        dots: true,
        autoplay: true,
        responsiveClass: true,
        responsive: {
            0: {
                items: 1,
                nav: false
            },
            1170: {
                items: 1
            }
        }
    })
});
