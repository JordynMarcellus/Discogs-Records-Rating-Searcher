// Namespace
var myApp = {};
myApp.key = 'mbVHEypGaMdeyTMrYYHn'
myApp.secret = 'riOpCutFddLUkrxCftUkCWNKekDbpVpL'

//we could use query selector all. but, i mean, for this? naw
myApp.artistBoxes = [].slice.call(document.getElementsByClassName("artistBox"));
// User inputs band they want to know more about

myApp.init = function(){
	
	$('.search').on('submit',function(e){
		e.preventDefault();
		var searchTerm = $('.artistSearch').val();
		myApp.getArtists(searchTerm);
	});

};

myApp.searchURL = "https://api.discogs.com/database/search"	
myApp.artistURL = "https://api.discogs.com/artists/"
myApp.releaseURL = "https://api.discogs.com/releases/"

// This does a search query for an artist and returns the artist ID.

myApp.getArtists = function getArtists(searchTerm) {

	$.ajax ({
		url: myApp.searchURL,
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
		url: myApp.artistURL + id,
		type: "GET",
		dataType: "json",
		success : function(artistres) {
			myApp.displayArtists(artistres)
			console.log(artistres)
		}
	});

}

// Get album releases - needs to have /releases concated to the getArtistInfo to successfully make the call. 

myApp.sortReleases = function(a,b) {
	return a.year - b.year;
}

myApp.getReleases = function getArtistReleases(id) {

	$.ajax ({
		url: myApp.artistURL + id + "/releases",
		type: "GET",
		dataType: "json",
		success : function (artistAlbums) {
			console.log(artistAlbums);
			//error handling
			if(artistAlbums.releases) {
				artistAlbums.releases.sort(myApp.sortReleases);
				artistAlbums.releases.forEach(myApp.getReleaseInfo);
			} else {
				console.log("hey we got an error here...", artistAlbums)
			}
			// } //end for loop
		} // end success function
	}); // end AJAX request
} // end get releases
// Grab release info (need for community rating)

myApp.getReleaseInfo = function getReleaseInfo(album) {
	// console.log(album)
	if (album.main_release) {

		$.ajax ({
			url: myApp.releaseURL + album.main_release,
			type: "GET",
			dataType: "json",
			success : function (releaseInfo) {
				console.log(releaseInfo);
				myApp.displayAlbums(releaseInfo)
			}
		});

	} else {
		console.log("not a main release")
		console.log(album);
	}
}

// Get artist info and put it in the HTML

myApp.displayArtists = function(response) {
	$('.artistBox').empty.append();
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
	//wtf? marcellus no.
	$('.contentWrapper').css('padding-bottom','1%');
	$('footer').css('display','block');
}

$(function() {
	myApp.init(); 
});