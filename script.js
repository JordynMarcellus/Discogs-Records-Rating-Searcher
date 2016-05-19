// Namespace

var myApp = {};
myApp.key = 'mbVHEypGaMdeyTMrYYHn'
myApp.secret = 'riOpCutFddLUkrxCftUkCWNKekDbpVpL'

// User inputs band they want to know more about

myApp.init = function(){
	$('.search').on('submit',function(e){
		e.preventDefault();
		var searchTerm = $('.artistSearch').val();
		myApp.getArtists(searchTerm);
	});
};

myApp.searchURL = {}

	myApp.searchURL.url = "https://api.discogs.com/database/search"

myApp.artistURL = {}
	
	myApp.artistURL.url = "https://api.discogs.com/artists/"

myApp.releaseURL = {}

	myApp.releaseURL = "https://api.discogs.com/releases/"

// This does a search query for an artist and returns the artist ID.

myApp.getArtists = function getArtists(searchTerm) {
$.ajax ({
	url: myApp.searchURL.url,
	type: "GET",
	dataType: "json",
	data : {		
		key: myApp.key,
		secret: myApp.secret,
		q: searchTerm,
	},
	success : function (res) {
		myApp.getArtistInfo(res.results[0].id)
		myApp.getReleases(res.results[0].id)
		}
	});	
}
// Once we can figure out how to access the artist ID, run another API call to grab that info
myApp.getArtistInfo = function getArtistInfo(id) {
	$.ajax ({
		url: myApp.artistURL.url + id,
		type: "GET",
		dataType: "json",
		success : function(artistres) {
			myApp.displayArtists(artistres)
		}
	});
}

// Get album releases - needs to have /releases concated to the getArtistInfo to successfully make the call. 

myApp.getReleases = function getArtistReleases(id) {
	$.ajax ({
		url: myApp.artistURL.url + id + "/releases",
		type: "GET",
		dataType: "json",
		success : function (artistAlbums) {
			for(var i = 0; i < artistAlbums.releases.length; i++) {
				if(artistAlbums.releases[i] && artistAlbums.releases[i].main_release) {
					myApp.getReleaseInfo(artistAlbums.releases[i].main_release)
				}
			} //end for loop
		} // end success function
	}); // end AJAX request
} // end get releases
// Grab release info (need for community rating)

myApp.getReleaseInfo = function getReleaseInfo(id) {
	$.ajax ({
		url: myApp.releaseURL + id,
		type: "GET",
		dataType: "json",
		success : function (releaseInfo) {
			console.log(releaseInfo);
			myApp.displayAlbums(releaseInfo)
		}
	});
}

// Get artist info and put it in the HTML

myApp.displayArtists = function(response) {
	$('.artistBox').html('')
	var artistDiv = $('<div>').addClass('artistInfo');
	var artistName = $('<h2>').text(response.name);
	artistDiv.append(artistName);
	$('.artistBox').append(artistDiv);
	$('.albumWrapper').html('');
};

// Get album info and put it in the HTML

myApp.displayAlbums = function(response) {
	var rating = response.community.rating.average;
	var albumDiv = $('<div>').addClass('albumInfoBox');
	var albumTitle = $('<h3>').text(response.title);
	var albumRating = $('<p>').addClass('rating').text('Rating: ' +rating+'/5')
	var albumRatingCount = $('<p>').text(' Users who voted: ' + response.community.rating.count);
	var albumReleaseYear = $('<p>').text(response.year);
	albumDiv.append(albumTitle,albumRating,albumRatingCount,albumReleaseYear);
	$('.albumWrapper').append(albumDiv);
	console.log(rating)
	$('.contentWrapper').css('padding-bottom','1%');
	$('footer').css('display','block');
}

$(function() {
	myApp.init(); 
});