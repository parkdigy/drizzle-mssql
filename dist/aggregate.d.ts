import { type SQL, type SQLWrapper } from 'drizzle-orm';
type AggregateDecoder = Parameters<SQL<string | null>['mapWith']>[0];
export declare function sum<TDecoder extends AggregateDecoder>(expression: SQLWrapper, decoder: TDecoder): SQL<import("drizzle-orm").GetDecoderResult<TDecoder> | null>;
export declare function sumDistinct<TDecoder extends AggregateDecoder>(expression: SQLWrapper, decoder: TDecoder): SQL<import("drizzle-orm").GetDecoderResult<TDecoder> | null>;
export declare function avg<TDecoder extends AggregateDecoder>(expression: SQLWrapper, decoder: TDecoder): SQL<import("drizzle-orm").GetDecoderResult<TDecoder> | null>;
export declare function avgDistinct<TDecoder extends AggregateDecoder>(expression: SQLWrapper, decoder: TDecoder): SQL<import("drizzle-orm").GetDecoderResult<TDecoder> | null>;
export {};
