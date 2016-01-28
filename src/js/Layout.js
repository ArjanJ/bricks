import imagesLoaded from 'imagesloaded';

const Layout = ((imagesLoaded) => {

  const defaults = {
    loadedClassName: 'is-loaded',
    maxHeight: 250
  };

  class Layout {

    constructor(elem, opts) {
      this._elem = elem;
      this._images = [].slice.call(this._elem.querySelectorAll('img'));
      this._opts = Object.assign(defaults, opts);
      this.init();
      this.appendImages = this._loadNewImages;
    }

    init() {
      this._initOptions();
      this._addEventListeners();
      this._loadImages();
    }

    _loadNewImages(img) {
      img.forEach((img) => {
        this._images.push(img);
      });
      this._loadImages();
    }

    _initOptions() {
      if (typeof this._opts.maxHeight !== 'number') {
        console.error(`maxHeight must be a number not a ${typeof this._opts.maxHeight}.`);
      }

      if (this._opts.hasOwnProperty('beforeLoad')) {
        if (typeof this._opts.beforeLoad === 'function') {
          this._beforeLoad = this._opts.beforeLoad;
        } else {
          console.error(`beforeLoad must be a function not a ${typeof this._opts.beforeLoad}.`);
        }
      }

      if (this._opts.hasOwnProperty('afterLoad')) {
        if (typeof this._opts.afterLoad === 'function') {
          this._afterLoad = this._opts.afterLoad;
        } else {
          console.error(`afterLoad must be a function not a ${typeof opts.afterLoad}.`);
        }
      }
    }

    _addEventListeners() {

      // Re-calculate image dimensions when the window is resized.
      window.addEventListener('resize', this._createRows.bind(this, this._images));
    }

    _loadImages() {
      const imgLoad = imagesLoaded(this._elem);
      let delay = 0;

      imgLoad.on('always', (instance) => {

        // Call beforeLoad().
        if (this._beforeLoad) this._beforeLoad();

        // Create rows of images.
        this._createRows(this._images, this._elem.clientWidth);

        // Call afterLoad().
        if (this._afterLoad) this._afterLoad();

        // Stagger animation of each image.
        instance.images.forEach((image) => {
          let img = image.img;
          delay += 0.025;

          if (!img.classList.contains(this._opts.loadedClassName)) {
            img.style.animationDelay = `${delay}s`;
            img.classList.add(this._opts.loadedClassName);
          }
          
          this._animationComplete(img);

          // Log error to console if image fails to load.
          if (!image.isLoaded) {
            console.error(`${image.img.src} failed to load.`);
          }
        });
      });

      imgLoad.on('progress', (instance, image) => {
        let img = image.img;
        console.log('a');
        img.setAttribute('data-width', img.offsetWidth);
        img.setAttribute('data-height', img.offsetHeight);
      });
    }

    _createRows(images) {
      const containerWidth = this._elem.clientWidth;
      let imgs = images.slice();
      let slice, height;

      loop: while (imgs.length > 0) {

        for (let i = 1; i <= imgs.length; i++) {
          slice = imgs.slice(0, i);
          height = this._getHeight(slice, containerWidth);

          if (height < this._opts.maxHeight) {
            this._setDimensions(slice, height);
            imgs = imgs.slice(i);
            continue loop;
          }
        }

        this._setDimensions(slice, Math.min(this._opts.maxHeight, height));
        break;
      }
    }

    _setDimensions(images, height) {
      if (images && images.length) {
        images.forEach((img) => {
          let w = parseInt(img.getAttribute('data-width'));
          let h = parseInt(img.getAttribute('data-height'));
          img.style.width = height * (w / h) + 'px';
          img.style.height = height + 'px';
        });
      }
    }

    _getHeight(images, containerWidth) {
      let val = 0;

      if (images && images.length) {
        images.forEach((img) => {
          val += parseInt(img.getAttribute('data-width')) / parseInt(img.getAttribute('data-height'));
        });
      }

      return containerWidth / val;
    }

    _animationComplete(img) {
      const completed = () => {
        img.style.removeProperty('animation-delay');
        img.removeEventListener('animationend', completed);
      }
      
      img.addEventListener('animationend', completed);
    }
  }

  return Layout;

})(imagesLoaded);

export default Layout;