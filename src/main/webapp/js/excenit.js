//Add Roboto fonts to be used by the web app
$("head > link").after("<link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet'>");

//Change the search to use customized search
$(window).on('load',function(){
    $(".nav-search-toggle").remove(); //removes the down-caret
    //makes the input search visible
    $(".nav-search").removeAttr("ng-show");
    $(".nav-search").removeClass("ng-hide");
})