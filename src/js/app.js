//TODO--strip all jQuery out. Promise-ify everything. Modernizr the shit out of it. 

// Namespace
var myApp = {};
myApp.key = 'mbVHEypGaMdeyTMrYYHn'
myApp.secret = 'riOpCutFddLUkrxCftUkCWNKekDbpVpL'

//we could use query selector all. but, i mean, for this? naw
//myApp.artistBoxes = [].slice.call(document.getElementsByClassName("artistBox"));

myApp.albumWrapper = document.getElementById("album-wrapper");
myApp.artistBox = document.getElementById("artist-box");
myApp.slidingModal = document.getElementById("sliding-modal")

// User inputs band they want to know more about
myApp.init = function(){
	
	document.getElementById("discogs_search").addEventListener('submit', function(e){
		e.preventDefault();
		myApp.searchTerm = document.getElementById("artist-search").value;
		myApp.getArtists(myApp.searchTerm);
	})

	document.getElementById("close-btn").addEventListener("click", function(e) {
		myApp.slidingModal.style.right = "-50vw"
	});

};

myApp.searchURL = "https://api.discogs.com/database/search";
myApp.artistURL = "https://api.discogs.com/artists/";
myApp.releaseURL = "https://api.discogs.com/releases/";

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
			myApp.albumArray = [];
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
			// console.log(artistres)
		}
	});

}

// Get artist info and put it in the HTML
myApp.displayArtists = function(response) {
	myApp.artistBox.innerHTML = "";
	myApp.albumWrapper.innerHTML = "";
	var artistDiv = "<article class='artist-name'><h1>"+response.name+"</h1></article>"
	myApp.artistBox.innerHTML = artistDiv;
};

// Get album releases - needs to have /releases concated to the getArtistInfo to successfully make the call. 
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
myApp.getReleaseInfo = function getReleaseInfo(album, index, arr) {
	// console.log(album)
	if (album.main_release /*|| album.role === "Main"*/) {
		var release = null;
		/*album.main_release ?*/ release = album.main_release /*: release = album.id*/
		
		$.ajax ({
			url: myApp.releaseURL + release,
			type: "GET",
			dataType: "json",
			success : function (releaseInfo) {
				myApp.albumArray.push(releaseInfo)
				myApp.displayAlbums(releaseInfo)
			}
		});

	} else {
		//console.log("not a main release")
		//console.log(album);
	}
}

// Get album info and put it in the HTML

myApp.displayAlbums = function(response) {
	var index_value = (myApp.albumArray.length-1)
	var rating = response.community.rating;
	
	var albumDiv = "<article id='album-info-box_"+index_value+"' class='album-info-box' data-index="+ (index_value) +">";
	albumDiv += "<h3 class='album-year'>"+response.title+"</h3>";
	albumDiv += "<p class='album-rating'>Rating: "+ rating.average+"/5 ("+ rating.count +" votes)</p>";
	albumDiv += "<p class='album-year'>"+response.year+"</p>";
	albumDiv += "<button id='learn-more-btn_"+ index_value +"' data-index="+index_value+" class='learn-more-btn btn'>learn more</button></article>"
	myApp.albumWrapper.innerHTML += albumDiv;

}

myApp.sortReleases = function(a,b) {
	return a.year - b.year;
}

myApp.makeVideoGallery = function(ele, ind, arr) {
	var embed_url = ele.uri.split("v=");
	document.getElementById("video-gallery").innerHTML += "<div class='gallery-item gallery-item-"+ind+"' style='left:"+(ind*100)+"%'><div class='video_wrapper'><span class='left-arrow'></span><iframe src='https://www.youtube.com/embed/"+ embed_url[1] +"' frameborder='0' allowfullscreen></iframe><span class='right-arrow'></span></div><h2 class='video_title'>"+ele.title+"</h2></div>"
}

myApp.fillTracklist = function(ele, ind, arr) {
	document.getElementById("album-tracklist").innerHTML += "<li>"+ele.title+"</li>"
}

myApp.showMoreinfo = function(album) {
	myApp.modal = myApp.slidingModal.children[0]
	console.log(album)
	
	if (album.videos) {
		album.videos.forEach(myApp.makeVideoGallery)
	}
	
	document.getElementById("album-title").textContent = album.title
	document.getElementById("album-label").textContent = album.labels[0].name
	album.tracklist.forEach(myApp.fillTracklist)
	myApp.slidingModal.style.right = "0";
}

// event delegation strategy from this Stack Overflow thread http://stackoverflow.com/questions/14258787/add-event-listener-on-elements-created-dynamically
document.querySelector('body').addEventListener("click", function(e) {
	// console.log(e);
	var target = event.target;
	if ( target.className.match("learn-more-btn") ) {
		myApp.showMoreinfo(myApp.albumArray[target.dataset.index])
	}
})

document.addEventListener("DOMContentLoaded", function(e) {
	(function() {
		myApp.init();
	})();
});