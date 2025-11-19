import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'wac-slide-twelve',
    styleUrls: ['./slide-twelve.component.scss'],
    templateUrl: './slide-twelve.component.html'
})
export class SlideTwelveComponent {}
