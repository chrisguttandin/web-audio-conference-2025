import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FreezableAudioContextComponent } from '../freezable-audio-context/freezable-audio-context.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FreezableAudioContextComponent],
    selector: 'wac-slide-seventeen',
    styleUrls: ['./slide-seventeen.component.scss'],
    templateUrl: './slide-seventeen.component.html'
})
export class SlideSeventeenComponent {}
