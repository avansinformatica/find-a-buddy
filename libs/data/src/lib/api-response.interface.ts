export interface ApiMetaInfo {
    version: string
    type: 'object' | 'array'
    count: number
}

export interface ApiResponse<T> {
    results: T[] | T
    info: ApiMetaInfo
}
