export interface APIResponse<T> {
    status: number;
    result: T;
    info: {
        version: string;
        type: 'list' | 'object' | 'none';
        count: number;
    };
}

export interface APIResult<T> {
    status: number;
    result: T;
}
