var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const isFunction = (val) => typeof val === "function";
const CENTER = "center";
const UPPER_LEFT = "upperLeft";
const UPPER_RIGHT = "upperRight";
const LOWER_LEFT = "lowerLeft";
const LOWER_RIGHT = "lowerRight";
function getImage(url) {
  const image = new window.Image();
  image.setAttribute("crossOrigin", "Anonymous");
  image.src = url + "?_t=" + Date.now();
  return new Promise((resolve) => {
    image.onload = function() {
      return resolve(image);
    };
    image.onerror = function() {
      return resolve(null);
    };
  });
}
const TEXT_POSITIONS = {
  [CENTER]: {
    x: (target, metrics, ctx) => {
      ctx.textAlign = "center";
      return target.width / 2;
    },
    y: (target, metrics, ctx) => {
      ctx.textBaseline = "middle";
      return target.height / 2;
    }
  },
  [UPPER_LEFT]: {
    x: 10,
    y: (target, metrics, ctx, y) => y || 20
  },
  [UPPER_RIGHT]: {
    x: (target, metrics) => target.width - (metrics.width + 10),
    y: (target, metrics, ctx, y) => y || 20
  },
  [LOWER_LEFT]: {
    x: 10,
    y: (target, metrics, ctx, y) => y || target.height - 10
  },
  [LOWER_RIGHT]: {
    x: (target, metrics) => target.width - (metrics.width + 10),
    y: (target, metrics, ctx, y) => y || target.height - 10
  }
};
const IMAGE_POSITIONS = {
  [CENTER]: {
    x: (target, image) => (target.width - image.width) / 2,
    y: (target, image) => (target.height - image.height) / 2
  },
  [UPPER_RIGHT]: {
    x: (target, image) => target.width - (image.width + 10),
    y: 10
  },
  [UPPER_LEFT]: {
    x: 10,
    y: 10
  },
  [LOWER_LEFT]: {
    x: 10,
    y: (target, image) => target.height - (image.height + 10)
  },
  [LOWER_RIGHT]: {
    x: (target, image) => target.width - (image.width + 10),
    y: (target, image) => target.height - (image.height + 10)
  }
};
function getBase64Size(base64url) {
  let str = base64url.replace("data:image/png;base64,", "");
  const equalIndex = str.indexOf("=");
  if (str.indexOf("=") > 0) {
    str = str.substring(0, equalIndex);
  }
  const strLength = str.length;
  const fileLength = parseInt(strLength - strLength / 8 * 2);
  let size = "";
  size = (fileLength / 1024).toFixed(2);
  const sizeStr = size + "";
  const index = sizeStr.indexOf(".");
  const dou = sizeStr.substr(index + 1, 2);
  if (dou === "00") {
    return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2);
  }
  return size;
}
const isImageParam = (param) => !!(param == null ? void 0 : param.src);
const ImagesWeakMap = /* @__PURE__ */ new WeakMap();
class CompositeImage {
  constructor(config = {}) {
    __publicField(this, "canvas");
    __publicField(this, "config");
    __publicField(this, "elements", []);
    __publicField(this, "asynchronousLock");
    __publicField(this, "lock");
    __publicField(this, "lockTimes", 0);
    if (typeof window === "undefined") {
      throw new Error("composite image should be running browser");
    }
    this.canvas = document.createElement("canvas");
    this.config = config;
    const { bgSrc, bgHeight, bgWidth } = config;
    if (bgSrc) {
      this.composite({
        src: bgSrc,
        height: bgHeight,
        width: bgWidth
      });
    }
  }
  openLock() {
    var _a;
    if (this.lockTimes === 1 && !this.elements.length)
      (_a = this.lock) == null ? void 0 : _a.call(this);
    this.lockTimes--;
  }
  closeLock() {
    if (this.lockTimes === 0)
      this.asynchronousLock = new Promise((resolve) => this.lock = resolve);
    this.lockTimes++;
  }
  composite(...args) {
    args.forEach((arg) => {
      this.elements.push(arg);
      if (!isImageParam(arg))
        return;
      ImagesWeakMap.set(arg, getImage(arg.src));
    });
    if (this.lockTimes > 0)
      return this;
    const context = this.canvas.getContext("2d");
    if (!context)
      return this;
    (async () => {
      var _a, _b;
      let param = void 0;
      while (param = this.elements.shift()) {
        const { alpha, position } = param;
        context.save();
        alpha && (context.globalAlpha = alpha);
        this.closeLock();
        if (isImageParam(param)) {
          const { width, height, x = 0, y = 0 } = param;
          const image = await ImagesWeakMap.get(param);
          if (!image)
            continue;
          if (!this.config.bgWidth && !this.config.bgHeight) {
            this.canvas.width = this.config.bgWidth = (_a = image == null ? void 0 : image.width) != null ? _a : width;
            this.canvas.height = this.config.bgHeight = (_b = image == null ? void 0 : image.height) != null ? _b : height;
          }
          this.addImage(context, {
            x,
            y,
            position,
            image,
            width,
            height
          });
        } else {
          this.addText(context, param);
        }
        this.openLock();
        context.restore();
      }
    })();
    return this;
  }
  getTextPosition(context, {
    x = 0,
    y = 0,
    position,
    text,
    correctY
  }) {
    const watermark = context.measureText(text);
    const getTargetXY = (xOrY, correctValue) => isFunction(xOrY) ? xOrY(this.canvas, watermark, context, correctValue) : xOrY;
    if (position) {
      const targetPosition = TEXT_POSITIONS[position];
      if (targetPosition) {
        ({ x, y } = targetPosition);
      }
    }
    return {
      x: getTargetXY(x),
      y: getTargetXY(y, correctY)
    };
  }
  getImagePosition(context, {
    x = 0,
    y = 0,
    position,
    image
  }) {
    const getTargetXY = (xOrY) => isFunction(xOrY) ? xOrY(this.canvas, image) : xOrY;
    if (position) {
      const targetPosition = IMAGE_POSITIONS[position];
      if (targetPosition) {
        ({ x, y } = targetPosition);
      }
    }
    return {
      x: getTargetXY(x),
      y: getTargetXY(y)
    };
  }
  addImage(context, { x, y, position, image, width, height }) {
    const targetWidth = isFunction(width) ? width(this.canvas, image) : width != null ? width : image.width;
    const targetHeight = isFunction(height) ? height(this.canvas, image) : width != null ? width : image.height;
    image.width = targetWidth;
    image.height = targetHeight;
    const { x: targetX, y: targetY } = this.getImagePosition(context, {
      x,
      y,
      position,
      image
    });
    context.fillStyle = "rgba(255, 255, 255, 0)";
    context.fillRect(targetX, targetY, targetWidth, targetHeight);
    context.drawImage(image, targetX, targetY, targetWidth, targetHeight);
  }
  addText(context, {
    font = "STXihei",
    color: fillStyle = "#000000",
    textBaseline,
    textAlign,
    position,
    text,
    correctY,
    x,
    y
  }) {
    context.font = font;
    context.fillStyle = fillStyle;
    textBaseline && (context.textBaseline = textBaseline);
    textAlign && (context.textAlign = textAlign);
    const { x: targetX, y: targetY } = this.getTextPosition(context, {
      x,
      y,
      position,
      text,
      correctY
    });
    context.fillText(text, targetX, targetY);
  }
  async print(type = "png", quality) {
    await this.asynchronousLock;
    const { base64, quality: intervalQuality } = await this.getQuality(quality);
    if (base64)
      return base64;
    return this.canvas.toDataURL(type, intervalQuality);
  }
  async getQuality(quality) {
    let base64 = "";
    switch (quality) {
      case true: {
        base64 = await this.print();
        const fileKb = parseInt(getBase64Size(base64));
        if (fileKb < 300)
          return { base64 };
        else if (fileKb < 1024)
          return { quality: 0.85 };
        else if (fileKb > 5 * 1024)
          return { quality: 0.92 };
        return { quality: 0.52 };
      }
      case false:
        return { quality: void 0 };
      default:
        return { quality };
    }
  }
  async download(fileName) {
    await this.asynchronousLock;
    this.canvas.toBlob((blob) => {
      var _a;
      if (!blob)
        return;
      const a = document.createElement("a");
      a.download = fileName || `${Date.now()}.png`;
      a.style.display = "none";
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
      (_a = document.body) == null ? void 0 : _a.removeChild(a);
    });
  }
  getCanvas() {
    return this.canvas;
  }
}
__publicField(CompositeImage, "CENTER", CENTER);
__publicField(CompositeImage, "UPPER_LEFT", UPPER_LEFT);
__publicField(CompositeImage, "UPPER_RIGHT", UPPER_RIGHT);
__publicField(CompositeImage, "LOWER_LEFT", LOWER_LEFT);
__publicField(CompositeImage, "LOWER_RIGHT", LOWER_RIGHT);
export { CompositeImage, CompositeImage as default, getImage };
