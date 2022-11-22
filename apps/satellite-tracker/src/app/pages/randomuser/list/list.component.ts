import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { RandomUser } from '../randomuser.model';
import { RandomUserService } from '../randomuser.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class RandomUserListComponent implements OnInit {
  //local
  randomUsers: RandomUser[] | undefined;
  subscription: Subscription | undefined;

  //alternative: use async pipe in the template
  randomUsers$: Observable<RandomUser[]> | undefined;
  constructor(private randomUserService: RandomUserService) {}

  ngOnInit(): void {
    // console.log('subscribing');
    // this.randomUserService.getRandomUsers().subscribe((data) => {
    //   console.log(data);
    //   this.randomUsers = data;
    // });

    this.randomUsers$ = this.randomUserService.getRandomUsers();
    //*ngFor="let randomUser of randomUsers$ | async"
  }

  ngOnDestroy() {
    // console.log('unsubscribing');
    // if (this.subscription) {
    //   this.subscription.unsubscribe();
    // }
  }
}
