var map; //Global variable


function Main() {	var self = this;
	this.query = ko.observable('');
	this.locations = ko.observableArray([]);

	mylocations.forEach(function(location){
		self.locations.push( new Location(location));
	});

// Setting Up centre and zoom
    map = new google.maps.Map(
        document.getElementById('map'), {
	        zoom: 13,
	        center: new google.maps.LatLng(28.612912, 77.229510),
	        disableDefaultUI: false,
	        mapTypeControl: true
		});

	// Keyword filter and list all locations by default
	this.filteredLocations = ko.computed(
		function(){
			var search = self.query().toLowerCase();
			if (!search){
				self.locations().forEach(
					function(location){
						location.visible(true);
					});
				return self.locations();
			} else {
				return ko.utils.arrayFilter(self.locations(),
					function(location) {
						var isVisble = location.title.toLowerCase().indexOf(search) >= 0;
						location.visible(isVisble);
						return isVisble;
				});
			}
		}, self);
}

function Location(att) 
{
	var self = this;
	this.visible = ko.observable(false);
	this.lng = att.long;
	this.lat = att.lat;
	this.title = att.name;
	this.Infowindow = new google.maps.InfoWindow();
	
	// Wiki API
	this.get = function() {
		var links = [];
		var wUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + self.title + '&format=json&callback=wikiCallback';

		$.getJSON({	url: wUrl,
			dataType: "jsonp",}).done(function(response)
		{
				var result = response[1];
				for (var x=0; x < result.length; x++)
				{
					var resultString = result[x];
					var wikilink = 'https://en.wikipedia.org/wiki/' + resultString;
					links.push('<li><a href="' + wikilink + '" target="_blank">' + resultString + '</a></li>');
		
		}
				if (links.length > 0)
				{
					self.content = '<h2>' + self.title + '</h2>' + links;
				} else 
				{
					self.content = '<h2>' + self.title + '</h2>' + '<h4>Content Could Not Be Found</h4>';
				}
			}
			).fail(function() 
				{
				self.content = '<h2>' + self.title + '</h2>' + '<h4>Something went wrong...</h4>';
				console.log('getJSON request failed to load');
				}
			);
	}();
	

	// Marker Setup
	this.marker = new google.maps.Marker({
		position: new google.maps.LatLng(att.lat, att.long),
		title: att.name,
		map: map,
	});

	
	this.showMarker = ko.computed(
		function() 
		{
			if(this.visible() === true) 
			{
				this.marker.setMap(map);
			} else 
			{
				this.marker.setMap(null);
			}
			return true;
		}, this);
	
	//OpenWindow

	this.openInfowindow = function() 
	{
		map.panTo(self.marker.getPosition());
		self.Infowindow.setContent(self.content);
		self.Infowindow.open(map, self.marker);
		self.marker.setAnimation(google.maps.Animation.DROP); //Marker Animation
      	setTimeout(
			function() 
			{
				self.Infowindow.close();
	      		self.marker.setAnimation(null);
	     	}, 3200
		);
	};

	this.addListener = google.maps.event.addListener(
		self.marker,'click', this.openInfowindow
	);
}



function error()
{
	alert("Google Maps were unable to load. Please Refresh the page!");
}


function initMap()
{
	ko.applyBindings(new Main());
}
