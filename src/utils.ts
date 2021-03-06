export const CENTER = "center";
export const UPPER_LEFT = "upperLeft";
export const UPPER_RIGHT = "upperRight";
export const LOWER_LEFT = "lowerLeft";
export const LOWER_RIGHT = "lowerRight";

// type ValueOf<T> = T[keyof T];

export type PositionKeys =
  | typeof CENTER
  | typeof UPPER_LEFT
  | typeof UPPER_RIGHT
  | typeof LOWER_LEFT
  | typeof LOWER_RIGHT;

export type TextPositionCalculator =
  | ((
      target: HTMLCanvasElement,
      metrics: TextMetrics,
      ctx: CanvasRenderingContext2D,
      correctY?: number
    ) => number)
  | number;

export type ImagePositionCalculator =
  | ((target: HTMLCanvasElement, image: HTMLImageElement) => number)
  | number;

export function getImage(url: string): Promise<HTMLImageElement | null> {
  const image = new window.Image();
  image.setAttribute("crossOrigin", "Anonymous");
  image.src = url + "?_t=" + Date.now();

  return new Promise((resolve) => {
    image.onload = function () {
      return resolve(image);
    };
    image.onerror = function () {
      return resolve(null);
    };
  });
}

type PositionCalculators<T> = {
  [p in PositionKeys]: {
    x: T;
    y: T;
  };
};

export const TEXT_POSITIONS: PositionCalculators<TextPositionCalculator> = {
  [CENTER]: {
    x: (target, metrics, ctx): number => {
      ctx.textAlign = "center";
      return target.width / 2;
    },
    y: (target, metrics, ctx) => {
      ctx.textBaseline = "middle";
      return target.height / 2;
    },
  },
  [UPPER_LEFT]: {
    x: 10,
    y: (target, metrics, ctx, y) => y || 20,
  },
  [UPPER_RIGHT]: {
    x: (target, metrics) => target.width - (metrics.width + 10),
    y: (target, metrics, ctx, y) => y || 20,
  },
  [LOWER_LEFT]: {
    x: 10,
    y: (target, metrics, ctx, y) => y || target.height - 10,
  },
  [LOWER_RIGHT]: {
    x: (target, metrics) => target.width - (metrics.width + 10),
    y: (target, metrics, ctx, y) => y || target.height - 10,
  },
};

export const IMAGE_POSITIONS: PositionCalculators<ImagePositionCalculator> = {
  [CENTER]: {
    x: (target, image) => (target.width - image.width) / 2,
    y: (target, image) => (target.height - image.height) / 2,
  },
  [UPPER_RIGHT]: {
    x: (target, image) => target.width - (image.width + 10),
    y: 10,
  },
  [UPPER_LEFT]: {
    x: 10,
    y: 10,
  },
  [LOWER_LEFT]: {
    x: 10,
    y: (target, image) => target.height - (image.height + 10),
  },
  [LOWER_RIGHT]: {
    x: (target, image) => target.width - (image.width + 10),
    y: (target, image) => target.height - (image.height + 10),
  },
};

export function getBase64Size(base64url: string) {
  //???????????????
  let str = base64url.replace("data:image/png;base64,", "");
  // ?????????????????????????????????
  const equalIndex = str.indexOf("=");
  if (str.indexOf("=") > 0) {
    str = str.substring(0, equalIndex);
  }
  // ??????????????????????????????????????????
  const strLength = str.length;
  // ???????????????????????????????????????????????????
  const fileLength = parseInt((strLength - (strLength / 8) * 2) as unknown as string);
  // ??????????????????kb
  let size = "";
  size = (fileLength / 1024).toFixed(2);
  const sizeStr = size + ""; //???????????????
  const index = sizeStr.indexOf("."); //???????????????????????????
  const dou = sizeStr.substr(index + 1, 2); //??????????????????????????????
  if (dou === "00") {
    //????????????????????????00?????????????????????00
    return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2);
  }
  return size;
}
