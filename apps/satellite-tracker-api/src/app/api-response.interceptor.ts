import { APIResponse } from 'shared/domain';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class APIResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<APIResponse<unknown>> {
        return next.handle().pipe(
            map((res) => {
                if (res.result) {
                    return {
                        ...res,
                        info: {
                            version: '1.0',
                            type: res.result instanceof Array ? 'list' : 'object',
                            count: res.result instanceof Array ? res.result.length : 1,
                        },
                    };
                } else {
                    return {
                        ...res,
                        result: res.response,
                        info: {
                            version: '1.0',
                            type: 'none',
                            count: 0,
                        },
                    };
                }
            })
        );
    }
}
