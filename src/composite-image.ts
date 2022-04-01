import { isFunction } from "@korylee/utils";
import {
  CENTER,
  getBase64Size,
  getImage,
  ImagePositionCalculator,
  IMAGE_POSITIONS,
  LOWER_LEFT,
  LOWER_RIGHT,
  PositionKeys,
  TextPositionCalculator,
  TEXT_POSITIONS,
  UPPER_LEFT,
  UPPER_RIGHT,
} from "./utils";

export interface ImageParam {
  src: string;
  x?: ImagePositionCalculator;
  y?: ImagePositionCalculator;
  width?: number;
  height?: number;
  alpha?: number;
  position?: PositionKeys;
  zoom?: number;
}

export interface TextParam {
  text: string;
  font?: string;
  color?: string;
  textAlign?: CanvasTextAlign;
  x?: TextPositionCalculator;
  y?: TextPositionCalculator;
  alpha?: number;
  position?: PositionKeys;
  correctY?: number; // position拿不到正确的y值时,需要手动提供
  textBaseline?: CanvasTextBaseline;
}

interface CompositeImageConfig {
  bgWidth?: number;
  bgHeight?: number;
  bgSrc?: string;
}

const isImageParam = (param: ImageParam | TextParam): param is ImageParam => !!(param as any)?.src;

const ImagesWeakMap = new WeakMap<ImageParam, Promise<HTMLImageElement | null>>();

export class CompositeImage {
  static CENTER: PositionKeys = CENTER;
  static UPPER_LEFT: PositionKeys = UPPER_LEFT;
  static UPPER_RIGHT: PositionKeys = UPPER_RIGHT;
  static LOWER_LEFT: PositionKeys = LOWER_LEFT;
  static LOWER_RIGHT: PositionKeys = LOWER_RIGHT;

  canvas: HTMLCanvasElement;
  config: CompositeImageConfig;
  elements: (ImageParam | TextParam)[] = [];
  private asynchronousLock?: Promise<void>;
  lock?: () => void;
  lockTimes: number = 0;

  constructor(config: CompositeImageConfig = {}) {
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
        width: bgWidth,
      });
    }
  }
  openLock() {
    if (this.lockTimes === 1 && !this.elements.length) this.lock?.();
    this.lockTimes--;
  }

  closeLock() {
    if (this.lockTimes === 0)
      this.asynchronousLock = new Promise((resolve) => (this.lock = resolve));
    this.lockTimes++;
  }

  composite(...args: Array<ImageParam | TextParam>): this {
    args.forEach((arg) => {
      this.elements.push(arg);
      if (!isImageParam(arg)) return;
      ImagesWeakMap.set(arg, getImage(arg.src));
    });

    if (this.lockTimes > 0) return this;
    const context = this.canvas.getContext("2d");
    if (!context) return this;

    (async () => {
      let param: ImageParam | TextParam | undefined = undefined;
      while ((param = this.elements.shift())) {
        const { alpha, position } = param;
        context.save();
        alpha && (context.globalAlpha = alpha);
        this.closeLock();
        if (isImageParam(param)) {
          const { width, height, x = 0, y = 0 } = param;
          const image = await ImagesWeakMap.get(param);

          if (!image) continue;
          if (!this.config.bgWidth && !this.config.bgHeight) {
            this.canvas.width = this.config.bgWidth = image?.width ?? width;
            this.canvas.height = this.config.bgHeight = image?.height ?? height;
          }

          this.addImage(context, {
            x,
            y,
            position,
            image,
            width,
            height,
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

  private getTextPosition(
    context: CanvasRenderingContext2D,
    {
      x = 0,
      y = 0,
      position,
      text,
      correctY,
    }: {
      x?: TextPositionCalculator;
      y?: TextPositionCalculator;
      position?: PositionKeys;
      text: string;
      correctY?: number;
    }
  ): { x: number; y: number } {
    const watermark = context.measureText(text);
    const getTargetXY = (xOrY: TextPositionCalculator | number, correctValue?: number): number =>
      isFunction(xOrY) ? xOrY(this.canvas, watermark, context, correctValue) : xOrY;
    if (position) {
      const targetPosition = TEXT_POSITIONS[position];
      if (targetPosition) {
        ({ x, y } = targetPosition);
      }
    }

    return {
      x: getTargetXY(x),
      y: getTargetXY(y, correctY),
    };
  }
  private getImagePosition(
    context: CanvasRenderingContext2D,
    {
      x = 0,
      y = 0,
      position,
      image,
    }: {
      position?: PositionKeys;
      image: HTMLImageElement;
      x?: ImagePositionCalculator;
      y?: ImagePositionCalculator;
    }
  ): { x: number; y: number } {
    const getTargetXY = (xOrY: ImagePositionCalculator) =>
      isFunction(xOrY) ? xOrY(this.canvas, image) : xOrY;
    if (position) {
      const targetPosition = IMAGE_POSITIONS[position];
      if (targetPosition) {
        ({ x, y } = targetPosition);
      }
    }

    return {
      x: getTargetXY(x),
      y: getTargetXY(y),
    };
  }
  private addImage(
    context: CanvasRenderingContext2D,
    { x, y, position, image, width, height }: Omit<ImageParam, "src"> & { image: HTMLImageElement }
  ) {

    const targetWidth = isFunction(width) ? width(this.canvas, image) : width ?? image.width;
    const targetHeight = isFunction(height) ? height(this.canvas, image) : width ?? image.height;
    image.width = targetWidth;
    image.height = targetHeight;
    const { x: targetX, y: targetY } = this.getImagePosition(context, {
      x,
      y,
      position,
      image,
    });
    // 铺个底色
    context.fillStyle = "rgba(255, 255, 255, 0)";
    context.fillRect(targetX, targetY, targetWidth, targetHeight);
    context.drawImage(image, targetX, targetY, targetWidth, targetHeight);
  }

  private addText(
    context: CanvasRenderingContext2D,
    {
      font = "STXihei",
      color: fillStyle = "#000000",
      textBaseline,
      textAlign,
      position,
      text,
      correctY,
      x,
      y,
    }: TextParam
  ) {
    context.font = font;
    context.fillStyle = fillStyle;
    textBaseline && (context.textBaseline = textBaseline);
    textAlign && (context.textAlign = textAlign);
    const { x: targetX, y: targetY } = this.getTextPosition(context, {
      x,
      y,
      position,
      text,
      correctY,
    });
    context.fillText(text, targetX, targetY);
  }

  async print(type = "png", quality?: number | boolean) {
    await this.asynchronousLock;
    const { base64, quality: intervalQuality } = await this.getQuality(quality);
    if (base64) return base64;
    return this.canvas.toDataURL(type, intervalQuality);
  }
  async getQuality(quality?: boolean | number): Promise<{ quality?: number; base64?: string }> {
    let base64 = "";
    switch (quality) {
      case true: {
        base64 = await this.print();
        const fileKb = parseInt(getBase64Size(base64));
        if (fileKb < 300) return { base64 };
        else if (fileKb < 1024) return { quality: 0.85 };
        else if (fileKb > 5 * 1024) return { quality: 0.92 };
        return { quality: 0.52 };
      }
      case false:
        return { quality: undefined };
      default:
        return { quality };
    }
  }

  async download(fileName?: string) {
    await this.asynchronousLock;
    this.canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.download = fileName || `${Date.now()}.png`;
      a.style.display = "none";
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
      document.body?.removeChild(a);
    });
  }
  getCanvas() {
    return this.canvas;
  }
}
