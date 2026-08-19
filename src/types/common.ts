export type OpenString<T extends string> = T | (string & {})
export type OpenNumber<T extends number> = T | (number & {})

export type BinaryFlag = 0 | 1

export type KnownFiatCurrency = 'USD' | 'EUR' | 'UAH'
export type FiatCurrency = OpenString<KnownFiatCurrency>

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'more'
  | 'eqormore'
  | 'eqorless'
  | 'contains'
  | 'doesnotcontain'
  | 'startswith'
  | 'endswith'
  | 'in'
