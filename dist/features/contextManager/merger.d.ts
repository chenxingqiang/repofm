import { MergeStrategy } from "./types.js";
export declare class ContextMerger {
    merge(source: any, target: any, strategy?: MergeStrategy): any;
    private deepMerge;
}
