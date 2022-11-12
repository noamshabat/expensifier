
export enum AppFiles {
    DataColumnOptions='baseDataColumnOptions.json',
    Identifiers='identifiers.json',
    Mappings='mappings.json',
}

export type Mapping = {
    categoryName: string
    regex: string
}

export enum AccountType {
    CheckingAccount = 'Checking Account',
    CreditCard = 'Credit Card',
}

export enum TransactionType {
    Expense = 'Expense',
    Income = 'Income',
}

export type TransactionBaseData = {
    description: string
    date: number
    amount: number
    billDate: number
}

export type RawTransaction = TransactionBaseData & {
    timestamp: number
    accountType: AccountType
    month: string
    type: TransactionType
    origin: string
}

export type Transaction = RawTransaction & {
    category: string
    category2: string
    category3: string
    category4: string
}

export type CategoryKeys = 'category' | 'category2' | 'category3' | 'category4'
export type FacetKeys = CategoryKeys | 'month' | 'accountType' | 'type' | 'origin'
export const ALL_CATEGORIES: CategoryKeys[] = ['category', 'category2', 'category3', 'category4']
export const ALL_FACETS: FacetKeys[] = [...ALL_CATEGORIES, 'month', 'accountType', 'type', 'origin']
export const UNDEFINED_CATEGORY = 'N/A'

export type Concrete<Type> = {
    [Property in keyof Type]-?: Type[Property];
};

export type Immutable<Type> = {
    readonly [Property in keyof Type]: Type[Property];
};

export const enum APIEndpoints {
    Transactions='transactions',
    Mappings='mappings',
    Facets='facets',
    AddFiles='addfiles'
}

export const enum APIs {
    GetTransactions='getTransactions',
    GetMappings='getMappings',
    AddMapping='addMapping',
    GetFacets='getFacets',
    AddFiles='addFiles',
	GetConfigFile='getConfigFile',
	SetConfigFile='setConfigFile',
}

export const enum Methods {
    Get='GET',
    Post='POST'
}

export type FiltersDesc = { [key in keyof Partial<Transaction>]: unknown[] }
export type Facets = { [key in FacetKeys]: string[] }

export type GetTransactionsResponse = { transactions: Transaction[], totalCount: number }
export type GetMappingsResponse = Mapping[][]
export type GetFacetsResponse = Facets
export type AddFilesResponse = { processed: number }

export interface IAPI {
    [APIs.GetTransactions]: (p: {filters: FiltersDesc, from?: number, to?: number}) => Promise<GetTransactionsResponse>
    [APIs.GetMappings]: () => Promise<GetMappingsResponse>
    [APIs.GetFacets]: (p:{filters: FiltersDesc}) => Promise<GetFacetsResponse>
    [APIs.AddMapping]: (p:{mapping: Mapping, categoryIndex: number}) => Promise<void>
    [APIs.AddFiles]: (p:{files: FileList}) => Promise<AddFilesResponse>
	[APIs.GetConfigFile]: (p:{file: AppFiles}) => Promise<object>
	[APIs.SetConfigFile]: (p:{file: AppFiles, data: unknown}) => Promise<void>
}
