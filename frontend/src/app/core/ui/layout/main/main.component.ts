import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AuthenticationService } from '@service/auth.service';
import { AuthUser } from '@model/auth-user.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';

@Component({
  selector: 'fe-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent implements OnInit {
  @Input() currentUser: AuthUser;

  private ngUnsubscribe$: Subject<any> = new Subject();

  constructor(private authenticationService: AuthenticationService) {
    // this.authenticationService.currentUser$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(x => {
    //   this.currentUser = x;
    // });
  }

  ngOnInit() {}
}
