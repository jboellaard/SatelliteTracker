import { Component, OnDestroy, OnInit } from '@angular/core';
import { of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
// import { AuthService } from '@find-a-buddy/auth-ui';
// import { Alert, AlertService } from '@find-a-buddy/util-ui';
// import { EntityService, IEntity } from '..';
import { EntityService, IEntity } from '..';

@Component({
    selector: 'app-base-list',
    // templateUrl: './base.list.component.html',
    template: ``,
    styleUrls: [],
})
export class BaseListComponent<T extends IEntity> implements OnDestroy {
    items!: T[] | null;
    subs: Subscription = new Subscription();
    httpOptions: any;
    displayedColumns = [''];

    constructor(
        private itemService: EntityService<T> // protected alertService: AlertService, // protected authService: AuthService
    ) {}

    // ngOnInit(): void {
    //     this.subs.add(
    //         this.itemService
    //             .getAll()
    //             .pipe(
    //                 catchError(() => {
    //                     //(error: Alert)
    //                     // this.alertService.error(error.message);
    //                     return of([]);
    //                 })
    //             )
    //             .subscribe((response) => {
    //                 console.log(response.results);
    //                 this.items = response.results;
    //             })
    //     );
    // }

    // delete(itemId: string): void {
    //   this.modalService
    //     .open(ModalConfirmYesNoComponent)
    //     .result.then((result) => {
    //       console.log('from modal:', result)
    //       this.itemService
    //         .delete(itemId, this.httpOptions)
    //         .pipe(
    //           catchError((error: Alert) => {
    //             console.log(error)
    //             this.alertService.error(error.message)
    //             return of(false)
    //           })
    //         )
    //         .subscribe(() => this.loadBases())
    //         .unsubscribe()
    //     })
    //     .catch((error) => console.log('from modal', error))
    // }

    ngOnDestroy(): void {
        if (this.subs) {
            this.subs.unsubscribe();
        }
    }
}
