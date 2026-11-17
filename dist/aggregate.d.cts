import { type SQL, type SQLWrapper, type GetDecoderResult } from 'drizzle-orm';
export type AggregateDecoder = Parameters<SQL<string | null>['mapWith']>[0];
export declare function sum<TDecoder extends AggregateDecoder>(expression: SQLWrapper, decoder: TDecoder): SQL<GetDecoderResult<TDecoder> | null>;
export declare function sum<TResult>(expression: SQLWrapper, decoder: AggregateDecoder): SQL<TResult>;
export declare function sumDistinct<TDecoder extends AggregateDecoder>(expression: SQLWrapper, decoder: TDecoder): SQL<GetDecoderResult<TDecoder> | null>;
export declare function sumDistinct<TResult>(expression: SQLWrapper, decoder: AggregateDecoder): SQL<TResult>;
export declare function avg<TDecoder extends AggregateDecoder>(expression: SQLWrapper, decoder: TDecoder): SQL<GetDecoderResult<TDecoder> | null>;
export declare function avgDistinct<TDecoder extends AggregateDecoder>(expression: SQLWrapper, decoder: TDecoder): SQL<GetDecoderResult<TDecoder> | null>;
