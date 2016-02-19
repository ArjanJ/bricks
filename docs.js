(function(window, document) {

	//
	// Init Bricks Demo
	//

	var demoElement = document.querySelector('#demo');
	var demoBricks = new Bricks(demoElement);

	//
	// Add Images
	//

	var addImagesBtn = document.querySelector('#add-images-btn');
	var srcs = [
		'https://unsplash.it/500/300?image=210',
		'https://unsplash.it/400/350?image=118',
		'https://unsplash.it/465/290?image=115',
		'https://unsplash.it/665/330?image=125',
		'https://unsplash.it/500/250?image=400',
		'https://unsplash.it/490/310?image=340',
		'https://unsplash.it/650/340?image=533',
		'https://unsplash.it/525/330?image=677'
	];

	function selectRandomValue(arr) {
		var value = arr[Math.floor(Math.random() * arr.length)];
		return value;
	}

	addImagesBtn.addEventListener('click', function() {
		var val = selectRandomValue(srcs);
		var index = srcs.indexOf(val);
		if (index === 0) index = 1;
		var images = [];

		for (var i = 0; i < index; i++) {
			if (images.indexOf(selectRandomValue(srcs)) === -1)
				images.push(selectRandomValue(srcs));
		}

		demoBricks.addNewImages(images, true);
	});

	//
	// Reload Images
	//

	var reloadImagesBtn = document.querySelector('#reload-images-btn');

	reloadImagesBtn.addEventListener('click', function() {
		demoBricks.reloadImages();
	});

	//
	// Remove Image
	//

	var removeImageBtn = document.querySelector('#remove-images-btn');
	

	removeImageBtn.addEventListener('click', function() {
		var allImages = demoElement.querySelectorAll('.bricks__img');
		var allImagesArr = [].slice.call(allImages);
		var randomValue = selectRandomValue(allImagesArr);
		var randomIndex = allImagesArr.indexOf(randomValue);
		var imagesToRemove = [
			allImages[randomIndex]
		];
		demoBricks.removeImages(imagesToRemove);
	});




}(window, document));