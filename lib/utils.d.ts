export declare const CENTER = "center";
export declare const UPPER_LEFT = "upperLeft";
export declare const UPPER_RIGHT = "upperRight";
export declare const LOWER_LEFT = "lowerLeft";
export declare const LOWER_RIGHT = "lowerRight";
export declare type PositionKeys = typeof CENTER | typeof UPPER_LEFT | typeof UPPER_RIGHT | typeof LOWER_LEFT | typeof LOWER_RIGHT;
export declare type TextPositionCalculator = ((target: HTMLCanvasElement, metrics: TextMetrics, ctx: CanvasRenderingContext2D, correctY?: number) => number) | number;
export declare type ImagePositionCalculator = ((target: HTMLCanvasElement, image: HTMLImageElement) => number) | number;
export declare function getImage(url: string): Promise<HTMLImageElement | null>;
declare type PositionCalculators<T> = {
    [p in PositionKeys]: {
        x: T;
        y: T;
    };
};
export declare const TEXT_POSITIONS: PositionCalculators<TextPositionCalculator>;
export declare const IMAGE_POSITIONS: PositionCalculators<ImagePositionCalculator>;
export declare function getBase64Size(base64url: string): string;
export {};
