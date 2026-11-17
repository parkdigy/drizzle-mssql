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

export function sumNumber(expression: SQLWrapper): SQL<number | null>;
export function sumNumber<TResult>(expression: SQLWrapper): SQL<TResult>;
export function sumNumber(expression: SQLWrapper): SQL {
  return sum(expression, Number);
}

export function sumBoolean(expression: SQLWrapper): SQL<boolean | null>;
export function sumBoolean<TResult>(expression: SQLWrapper): SQL<TResult>;
export function sumBoolean(expression: SQLWrapper): SQL {
  return sum(expression, Boolean);
}

export function sumString(expression: SQLWrapper): SQL<string | null>;
export function sumString<TResult>(expression: SQLWrapper): SQL<TResult>;
export function sumString(expression: SQLWrapper): SQL {
  return sum(expression, String);
}

export function sumDistinctNumber(expression: SQLWrapper): SQL<number | null>;
export function sumDistinctNumber<TResult>(expression: SQLWrapper): SQL<TResult>;
export function sumDistinctNumber(expression: SQLWrapper): SQL {
  return sumDistinct(expression, Number);
}

export function sumDistinctBoolean(expression: SQLWrapper): SQL<boolean | null>;
export function sumDistinctBoolean<TResult>(expression: SQLWrapper): SQL<TResult>;
export function sumDistinctBoolean(expression: SQLWrapper): SQL {
  return sumDistinct(expression, Boolean);
}

export function sumDistinctString(expression: SQLWrapper): SQL<string | null>;
export function sumDistinctString<TResult>(expression: SQLWrapper): SQL<TResult>;
export function sumDistinctString(expression: SQLWrapper): SQL {
  return sumDistinct(expression, String);
}
