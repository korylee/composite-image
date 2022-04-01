import { ImagePositionCalculator, PositionKeys, TextPositionCalculator } from "./utils";
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
    correctY?: number;
    textBaseline?: CanvasTextBaseline;
}
interface CompositeImageConfig {
    bgWidth?: number;
    bgHeight?: number;
    bgSrc?: string;
}
export declare class CompositeImage {
    static CENTER: PositionKeys;
    static UPPER_LEFT: PositionKeys;
    static UPPER_RIGHT: PositionKeys;
    static LOWER_LEFT: PositionKeys;
    static LOWER_RIGHT: PositionKeys;
    canvas: HTMLCanvasElement;
    config: CompositeImageConfig;
    elements: (ImageParam | TextParam)[];
    private asynchronousLock?;
    lock?: () => void;
    lockTimes: number;
    constructor(config?: CompositeImageConfig);
    openLock(): void;
    closeLock(): void;
    composite(...args: Array<ImageParam | TextParam>): this;
    private getTextPosition;
    private getImagePosition;
    private addImage;
    private addText;
    print(type?: string, quality?: number | boolean): Promise<string>;
    getQuality(quality?: boolean | number): Promise<{
        quality?: number;
        base64?: string;
    }>;
    download(fileName?: string): Promise<void>;
    getCanvas(): HTMLCanvasElement;
}
export {};
