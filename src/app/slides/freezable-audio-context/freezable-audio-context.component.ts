import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { animationFrame } from 'subscribable-things';

const SOURCE = `registerProcessor(
    'blocking-processor',
    class extends AudioWorkletProcessor {
        constructor ({ processorOptions }) {
            super();

            this.isBlocked = processorOptions;
        }

        process () {
            while (Atomics.load(this.isBlocked, 0) === 1) {
                // This can be unblocked again.
            }

            return true;
        }
    }
);`;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'wac-freezable-audio-context',
    styleUrls: ['./freezable-audio-context.component.scss'],
    templateUrl: './freezable-audio-context.component.html'
})
export class FreezableAudioContextComponent {
    public currentTime = signal(0);

    public disabled = signal(false);

    public text = signal<'block' | 'unblock'>('unblock');

    #destroyRef = inject(DestroyRef);

    #isBlocked = new Uint8Array(new SharedArrayBuffer(1));

    public async toggle() {
        this.disabled.set(true);

        if (this.currentTime() === 0) {
            const audioContext = new AudioContext(<AudioContextOptions & { sinkId: { type: 'none' } }>{ sinkId: { type: 'none' } });
            const blob = new Blob([SOURCE], { type: 'application/javascript; charset=utf-8' });
            const url = URL.createObjectURL(blob);

            await audioContext.audioWorklet.addModule(url);

            URL.revokeObjectURL(url);

            new AudioWorkletNode(audioContext, 'blocking-processor', { processorOptions: this.#isBlocked });

            const stop = () => {
                Atomics.store(this.#isBlocked, 0, 0);
                audioContext.close();
            };

            window.addEventListener('beforeunload', stop);

            const unsubscribe = animationFrame()(() => {
                this.currentTime.set(audioContext.currentTime ?? 0);
            });

            this.#destroyRef.onDestroy(() => {
                window.removeEventListener('beforeunload', stop);
                unsubscribe();
                stop();
            });
            this.text.set('block');
        } else {
            const isBlocked = Atomics.load(this.#isBlocked, 0);

            Atomics.store(this.#isBlocked, 0, (isBlocked + 1) % 2);
            this.text.set(isBlocked ? 'unblock' : 'block');
        }

        this.disabled.set(false);
    }
}
