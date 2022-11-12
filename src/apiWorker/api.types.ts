import { AddFilesResponse, APIs, GetFacetsResponse, GetMappingsResponse, GetTransactionsResponse, IAPI } from "../shared.types"

export type ApiMessageBase = {
    type: APIs
}

type GetTransactionMessage = {
    type: APIs.GetTransactions,
    args: Parameters<IAPI[APIs.GetTransactions]>[0]
}

type GetMappingsMessage = {
    type: APIs.GetMappings,
    args: undefined
}

type GetFacetsMessage = {
    type: APIs.GetFacets,
    args: Parameters<IAPI[APIs.GetFacets]>[0]
}

type AddMappingMessage = {
    type: APIs.AddMapping,
    args: Parameters<IAPI[APIs.AddMapping]>[0]
}

type AddFilesMessage = {
    type: APIs.AddFiles,
    args: Parameters<IAPI[APIs.AddFiles]>[0]
}

type GetConfigFileMessage = {
	type: APIs.GetConfigFile
	args: Parameters<IAPI[APIs.GetConfigFile]>[0]
}

type SetConfigFileMessage = {
	type: APIs.SetConfigFile
	args: Parameters<IAPI[APIs.SetConfigFile]>[0]
}

export const API_WORKER_MESSAGE_IDENTIFIER = 'API-Worker'
export type ApiMessage = { source?: typeof API_WORKER_MESSAGE_IDENTIFIER } &
    (AddFilesMessage | AddMappingMessage | GetFacetsMessage | GetMappingsMessage | GetTransactionMessage | GetConfigFileMessage | SetConfigFileMessage)

type GetTransactionMessageResponse = {
    type: APIs.GetTransactions
    id: string
    data: GetTransactionsResponse
}

type GetMappingsMessageResponse = {
    type: APIs.GetMappings
    id: string
    data: GetMappingsResponse
}

type GetFacetsMessageResponse = {
    type: APIs.GetFacets
    id: string
    data: GetFacetsResponse
}

type AddMappingMessageResponse = {
    type: APIs.AddMapping
    id: string
    data: void
}

type AddFilesMessageResponse = {
    type: APIs.AddFiles
    id: string
    data: AddFilesResponse
}

type GetConfigFileMessageResponse = {
	type: APIs.GetConfigFile
	id: string
	data: object
}

type SetConfigFileMessageResponse = {
	type: APIs.SetConfigFile
	id: string
	data: void
}

type ErrorMessageResponse = {
    type: APIs,
    id: string,
    data: string,
}

export type ApiMessageResponse = 
    GetTransactionMessageResponse |
    GetMappingsMessageResponse | 
    GetFacetsMessageResponse |
    AddMappingMessageResponse |
    AddFilesMessageResponse |
	GetConfigFileMessageResponse |
	SetConfigFileMessageResponse |
    ErrorMessageResponse 