import imagesLoaded from 'imagesloaded';


/**
 *
 * Bricks - A responsive, justified image layout plugin written in
 * JavaScript, and inspired by Google Images.
 * v0.0.1
 * Arjan Jassal <hello@arjanjassal.com>
 * MIT License
 *
 */

const Bricks = ((imagesLoaded) => {

	const defaults = {
		animation: true,
		animationDelay: 50,
		imageClassName: 'bricks__img',
		imageContainer: 'div',
		imageContainerClassName: 'bricks__item',
		imageLoadedClassName: 'bricks__img--loaded',
		margin: 0,
		maxHeight: 250
	};

	/**
	 *
	 * CLASS DEFINITION
	 *
	 */

	class Bricks {

		constructor(elem, opts) {
			this._elem = elem;
			this._opts = Object.assign(defaults, opts);
			this._images = Array.from(this._elem.querySelectorAll(`.${this._opts.imageClassName}`));
			this._init();
		}

		/**
		 *
		 * PRIVATE METHODS
		 *
		 */

		_init() {
			this._checkOptions();
			this._addEventListeners();
			this._loadImages();
		}

		_checkOptions() {
			if (typeof this._opts.maxHeight !== 'number') {
				console.error(`maxHeight must be a number not a ${typeof this._opts.maxHeight}.`);
			}

			if (this._opts.hasOwnProperty('beforeLoad')) {
				if (typeof this._opts.beforeLoad !== 'function') {
					console.error(`beforeLoad must be a function not a ${typeof this._opts.beforeLoad}.`);
				}
			}

			if (this._opts.hasOwnProperty('afterLoad')) {
				if (typeof this._opts.afterLoad !== 'function') {
					console.error(`afterLoad must be a function not a ${typeof this._opts.afterLoad}.`);
				}
			}

			if (this._opts.hasOwnProperty('imageContainer')) {
				if (typeof this._opts.imageContainer !== 'string') {
					console.error(`imageContainer must be a string not a ${typeof this._opts.imageContainer}.`);
				}
			}
		}

		_addEventListeners() {

			// Re-calculate image dimensions when the window is resized.
			window.addEventListener('resize', this._createRows.bind(this, this._images));
		}

		_loadImages() {

			// Call beforeLoad().
			if (this._opts.beforeLoad) this._opts.beforeLoad();
			
			const imgLoad = imagesLoaded(this._elem);

			imgLoad.on('always', (instance) => {

				// Create rows of images.
				this._createRows(this._images);

				// Stagger animation of each image.
				this._showImages(instance.images);

				// Call afterLoad().
				if (this._opts.afterLoad) this._opts.afterLoad();

				// If the Bricks container has a height set on it, remove it after the images are loaded.
				this._elem.style.removeProperty('height');
			});

			imgLoad.on('progress', (instance, image) => {
				let img = image.img;
				img.setAttribute('data-width', img.offsetWidth);
				img.setAttribute('data-height', img.offsetHeight);
			});
		}

		_createRows(images) {
			const containerWidth = this._elem.clientWidth;
			let imgs = this._images;
			let slice, height;

			loop: while (imgs.length > 0) {

				for (let i = 1; i <= imgs.length; i++) {
					slice = imgs.slice(0, i);
					height = this._getHeight(slice, containerWidth);

					if (height < this._opts.maxHeight) {
						this._setDimensions(slice, height);

						if (this._opts.margin > 0) this._setMargins(slice);

						for (let i = 0; i < slice.length; i++) {

							if (!(slice[i].parentNode.classList.contains(this._opts.imageContainerClassName))) {
								this._makeImageContainer(slice);
							}

						}

						imgs = imgs.slice(i);
						continue loop;
					}
				}

				this._setDimensions(slice, Math.min(this._opts.maxHeight, height));
				if (this._opts.margin > 0) this._setMargins(slice);

				for (let i = 0; i < slice.length; i++) {

					if (!(slice[i].parentNode.classList.contains(this._opts.imageContainerClassName))) {
						this._makeImageContainer(slice);
					}
				}
				
				break;
			}
		}

		_showImages(images) {
			let delay = 0;
			images.forEach((image) => {
				let img = image.img;
			
				if (this._opts.animation && !(img.classList.contains(this._opts.imageLoadedClassName))) {

					if (typeof this._opts.animationDelay !== 'number') {
						delay += parseInt(defaults.animationDelay);
						console.error('animationDelay must be a valid number.');
					} else {
						delay += parseInt(this._opts.animationDelay);
					}

					img.style.animationDelay = `${delay}ms`;
					img.classList.add(this._opts.imageLoadedClassName);
				} else {
					img.style.animationDuration = '0ms';
					img.classList.add(this._opts.imageLoadedClassName);
				}
				
				this._animationComplete(img);

				// Log error to console if image fails to load.
				if (!image.isLoaded) {
					console.error(`${image.img.src} failed to load.`);
				}
			});
		}

		_setDimensions(images, height) {
			if (images && images.length) {
				images.forEach((img, i) => {
					let w = parseInt(img.getAttribute('data-width'));
					let h = parseInt(img.getAttribute('data-height'));
					
					img.style.width = `${height * (w / h)}px`;
					img.style.height = `${height}px`;
				});
			}
		}

		_setMargins(images) {
			if (images && images.length) {
				images.forEach((img, i) => {
					img.style.removeProperty('margin-right');
					if (i === images.length-1) {
						return;
					} else {
						img.style.marginRight = `${this._opts.margin}px`;
					}
				});
			}
		}

		_getHeight(images, containerWidth) {
			let val = 0;
			let margin = this._opts.margin;

			if (margin > 0) {
				containerWidth -= images.length * margin;
				containerWidth += margin;
			}

			if (images && images.length) {
				images.forEach((img, i) => {
					let w = parseInt(img.getAttribute('data-width'));
					let h = parseInt(img.getAttribute('data-height'));
					val += (w / h);
				});
			}

			return containerWidth / val;
		}

		_animationComplete(img) {
			const completed = () => {
				img.style.removeProperty('animation-delay');
				img.removeEventListener('animationend', completed);
			};
			
			img.addEventListener('animationend', completed);
		}

		_makeImageContainer(images) {
			if (images && images.length) {
				images.forEach((img, i) => {
					let el = this._opts.imageContainer;
					let item = this._makeDOMNode(el, this._opts.imageContainerClassName);

					if (el === 'a') {
						item.href = img.getAttribute('data-href') || '#';
					}
					
					item.appendChild(img);
					this._elem.appendChild(item);
				});
			}
		}

		_makeDOMNode(el, className) {
			let element = document.createElement(el);
			element.classList.add(this._opts.imageContainerClassName);
			return element;
		}

		/**
		 *
		 * PUBLIC METHODS
		 *
		 */

		addNewImages(images) {
			if (images && images.length && typeof images === 'object') {
				let img;

				for (let i = 0, ii = images.length; i < ii; i++) {
					img = new Image();
					img.src = images[i];
					img.classList.add(this._opts.imageClassName);
					this._images.push(img);	
					this._elem.appendChild(img);
				}

				this._loadImages();
			} else {
				console.error('addNewImages only accepts an array of image paths.');
			}
		}

		removeImages(images) {
			if (images && images.length && typeof images === 'object') {
				for (let i = 0, ii = images.length; i < ii; i++) {
					let index = this._images.indexOf(images[i]);
					if (index > -1) this._images.splice(index, 1);
					images[i].parentElement.remove();
				}

				this._createRows(this._images);
			}
		}

		reloadImages() {
			let images = this._images;
			let srcs = [];

			// Clear the current images so there are no duplicates.
			this._images = [];

			// Add static height to container so the page doesn't move up when images are removed.
			this._elem.style.height = `${this._elem.clientHeight}px`;

			images.forEach((img) => {
				img.parentElement.remove();
				srcs.push(img.src);
			});

			setTimeout(() => {

				// Reload the images with the public method.
				this.addNewImages(srcs);

				// Empty the array so there aren't duplicates if this method is called more than once.
				srcs = [];
			}, 250);
		}
	}

	return Bricks;

})(imagesLoaded);

export default Bricks;