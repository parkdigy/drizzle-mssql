import {
  avg as drizzleAvg,
  avgDistinct as drizzleAvgDistinct,
  sum as drizzleSum,
  sumDistinct as drizzleSumDistinct,
  type SQL,
  type SQLWrapper,
  type GetDecoderResult,
} from 'drizzle-orm';

export type AggregateDecoder = Parameters<SQL<string | null>['mapWith']>[0];

export function sum<TDecoder extends AggregateDecoder>(
  expression: SQLWrapper,
  decoder: TDecoder
): SQL<GetDecoderResult<TDecoder> | null>;
export function sum<TResult>(expression: SQLWrapper, decoder: AggregateDecoder): SQL<TResult>;
export function sum(expression: SQLWrapper, decoder: AggregateDecoder): SQL {
  return drizzleSum(expression).mapWith(decoder);
}

export function sumDistinct<TDecoder extends AggregateDecoder>(
  expression: SQLWrapper,
  decoder: TDecoder
): SQL<GetDecoderResult<TDecoder> | null>;
export function sumDistinct<TResult>(expression: SQLWrapper, decoder: AggregateDecoder): SQL<TResult>;
export function sumDistinct(expression: SQLWrapper, decoder: AggregateDecoder): SQL {
  return drizzleSumDistinct(expression).mapWith(decoder);
}

export function avg<TDecoder extends AggregateDecoder>(expression: SQLWrapper, decoder: TDecoder) {
  return drizzleAvg(expression).mapWith(decoder);
}

export function avgDistinct<TDecoder extends AggregateDecoder>(expression: SQLWrapper, decoder: TDecoder) {
  return drizzleAvgDistinct(expression).mapWith(decoder);
}
