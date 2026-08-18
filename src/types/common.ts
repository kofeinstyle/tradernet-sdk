export type OpenString<T extends string> = T | (string & {})

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
