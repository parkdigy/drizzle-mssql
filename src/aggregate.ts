import {
  avg as drizzleAvg,
  avgDistinct as drizzleAvgDistinct,
  sum as drizzleSum,
  sumDistinct as drizzleSumDistinct,
  type SQL,
  type SQLWrapper,
} from 'drizzle-orm';

type AggregateDecoder = Parameters<SQL<string | null>['mapWith']>[0];

export function sum<TDecoder extends AggregateDecoder>(expression: SQLWrapper, decoder: TDecoder) {
  return drizzleSum(expression).mapWith(decoder);
}

export function sumDistinct<TDecoder extends AggregateDecoder>(expression: SQLWrapper, decoder: TDecoder) {
  return drizzleSumDistinct(expression).mapWith(decoder);
}

export function avg<TDecoder extends AggregateDecoder>(expression: SQLWrapper, decoder: TDecoder) {
  return drizzleAvg(expression).mapWith(decoder);
}

export function avgDistinct<TDecoder extends AggregateDecoder>(expression: SQLWrapper, decoder: TDecoder) {
  return drizzleAvgDistinct(expression).mapWith(decoder);
}
