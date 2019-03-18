$(document).ready(function() {
    // Ajax favorite
    console.log('coucou1');
    $(".icon-favorit").click(function() {
        console.log("coucou2");
        var offerId = $("#link-offer").data('offerid');
        console.log('offerid : ', offerId);
        if ($('.icon-favorit').hasClass('icon-active')) {
            console.log('oui');
            url = "/remove/favorites/" + offerId;
            console.log('url ', url);
        } else {
            console.log('non');
            url = "/add/favorites/" + offerId;
            console.log('url ', url);
        }
        $.ajax(url, {
            dataType: "json",
            success: function(data) {
                console.log("le retoure : ", data);
                if (data.isFavorite === false) {
                    $('.icon-favorit').removeClass('icon-active');
                } else {
                    $('.icon-favorit').addClass('icon-active');
                }
            }
        });

    });
    // $('#btn').click(function(){
    //     console.log("coucou");
    //     $.ajax("http://digitous.konexio.eu/exercises/sidekick/api", {
    //         dataType: "jsonp",
    //         success: function(data){

    //             $('.Belgique').text(data.belgium);
    //             $('.Canada').text(data.canada);
    //             $('.Congo').text(data.congo);
    //             $('.France').text(data.france);
    //         }

    //     });
    // });
    console.log('coucou3')
});