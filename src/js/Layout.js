import imagesLoaded from 'imagesloaded';

const Layout = ((imagesLoaded) => {

  class Layout {

    constructor(elem) {
      this._elem = elem;
      this._images = [].slice.call(elem.querySelectorAll('img'));
      this.init();
    }

    init() {
      this.loadImages();
    }

    loadImages() {
      const imgLoad = imagesLoaded(this._elem);

      imgLoad.on('always', (instance) => {
        this.createRows();
      });

      imgLoad.on('progress', (instance, image) => {
        let img = image.img;
        img.setAttribute('data-width', img.offsetWidth);
        img.setAttribute('data-height', img.offsetHeight);
      });
    }

    createRows() {
      console.log('create');
    }
  }

  return Layout;

})(imagesLoaded);

export default Layout;