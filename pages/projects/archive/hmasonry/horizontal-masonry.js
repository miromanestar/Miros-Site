  
jQuery(document).ready(function() {
	createElements();
});

$(window).on('resize', function() { doMasonry() });

function createElements() {
  for(let i = 0; i < 10; i++) {
  	let div = $("<div>", { id: "masonry-div-" + i, "class": "masonry-div", "text": (i + 1)});
	$('.masonry').append(div);	
  }
  doMasonry();
}

function doMasonry() {
	$('.masonry').attr("style", "");
	$('.masonry-div').attr("style", "");

	var divHeight = $('.masonry').outerHeight();
	
	var heights = $('.masonry-div').map(function() {
		return $(this).height();
	}).get();
	
	var maxHeight = Math.max.apply(null, heights);
	
	$('.masonry').height(divHeight+(maxHeight/3) + 100);
 
 if($(window).width() > 768) {
 	 $('.masonry').css({
	 	"display": "flex",
	 	"width": "100%",
	 	"flex-flow": "column wrap",
	 });
	 
	 $('.masonry-div').css({
	 	"display": "initial",
	 	"margin": "10px 1%",
	 });
	 
 	if($(window).width() <= 1024) {
 		$('.masonry-div').css("width", "48%");
 	} else { //If greater than 1024px
  		$('.masonry-div').css("width", "31%");
 	}
 }	
}