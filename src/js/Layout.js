import imagesLoaded from 'imagesloaded';

const Layout = ((imagesLoaded) => {

  let maxHeight = 300;

  class Layout {

    constructor(elem, opts) {
      this._elem = elem;
      this._images = [].slice.call(this._elem.querySelectorAll('img'));
      this._opts = opts || {};
      this.init();
    }

    init() {
      this._initOptions();
      this._addEventListeners();
      this._loadImages();
    }

    _initOptions() {
      if (this._opts.hasOwnProperty('maxHeight')) {
        if (typeof this._opts.maxHeight === 'number') {
          maxHeight = this._opts.maxHeight;
        } else {
          throw new Error(`maxHeight must be a number not a ${typeof this._opts.beforeLoad}.`);
        }
      }

      if (this._opts.hasOwnProperty('beforeLoad')) {
        if (typeof this._opts.beforeLoad === 'function') {
          this._beforeLoad = this._opts.beforeLoad;
        } else {
          throw new Error(`beforeLoad must be a function not a ${typeof this._opts.beforeLoad}.`);
        }
      }

      if (this._opts.hasOwnProperty('afterLoad')) {
        if (typeof this._opts.afterLoad === 'function') {
          this._afterLoad = this._opts.afterLoad;
        } else {
          throw new Error(`afterLoad must be a function not a ${typeof opts.afterLoad}.`);
        }
      }
    }

    _addEventListeners() {
      window.addEventListener('resize', this._createRows.bind(this, this._images));
    }

    _loadImages() {
      const imgLoad = imagesLoaded(this._elem);
      let delay = 0;

      imgLoad.on('always', (instance) => {

        // Call beforeLoad().
        if (this._beforeLoad) this._beforeLoad();

        // Create rows of images.
        this._createRows(this._images);

        // Call afterLoad().
        if (this._afterLoad) this._afterLoad();

        // Stagger animation of each image.
        instance.images.forEach((img) => {
          delay += 0.025;
          img.img.style.animationDelay = `${delay}s`;
          img.img.classList.add('is-loaded');
          this._animationComplete(img.img);
        });
      });

      imgLoad.on('progress', (instance, image) => {
        let img = image.img;
        img.setAttribute('data-width', img.offsetWidth);
        img.setAttribute('data-height', img.offsetHeight);
      });
    }

    _createRows(images) {
      const containerWidth = this._elem.clientWidth;
      let imgs = this._images.slice();
      let slice, height;

      loop: while (imgs.length > 0) {

        for (let i = 1; i <= imgs.length; i++) {
          slice = imgs.slice(0, i);
          height = this._getHeight(slice);

          if (height < maxHeight) {
            this._setDimensions(slice, height);
            imgs = imgs.slice(i);
            continue loop;
          }
        }

        this._setDimensions(slice, Math.min(maxHeight, height));
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

    _getHeight(images) {
      let containerWidth = this._elem.clientWidth;
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