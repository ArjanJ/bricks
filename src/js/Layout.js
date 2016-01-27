import imagesLoaded from 'imagesloaded';

const Layout = ((imagesLoaded) => {

  const maxHeight = 300;

  class Layout {

    constructor(elem, opts) {
      this._elem = elem;
      this._images = [].slice.call(elem.querySelectorAll('img'));
      this.init(opts);
    }

    init(opts) {
      this._addEventListeners();
      this._loadImages();

      if (opts.hasOwnProperty('beforeLoad')) {
        if (typeof opts.beforeLoad === 'function') {
          this._beforeLoad = opts.beforeLoad;
        } else {
          throw new Error(`beforeLoad must be a function not a ${typeof opts.beforeLoad}.`);
        }
      }

      if (opts.hasOwnProperty('afterLoad')) {
        if (typeof opts.afterLoad === 'function') {
          this._afterLoad = opts.afterLoad;
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

      imgLoad.on('always', (instance) => {
        if (this._beforeLoad) this._beforeLoad();
        this._createRows(this._images);
        if (this._afterLoad) this._afterLoad();
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
  }

  return Layout;

})(imagesLoaded);

export default Layout;