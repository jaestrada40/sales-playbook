import { Component, computed, signal } from '@angular/core';

type CallStep = {
  title: string;
  prompt: string;
  helper: string;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly steps: CallStep[] = [
    {
      title: 'Apertura',
      prompt:
        "Hi, how are you today? My name is Lourdes. I'm a Payment Consultant with NRS Pay, and this is a recorded line.",
      helper: 'Confirma si hablas con el dueño o gerente.',
    },
    {
      title: 'Descubrimiento',
      prompt: 'What is the biggest frustration you are having with your current processor or POS?',
      helper: 'Escucha el problema; no hagas todas las preguntas.',
    },
    {
      title: 'Propuesta',
      prompt: 'Since you said that avoiding hidden fees is important, let me show you an option that can help.',
      helper: 'Relaciona el beneficio con lo que dijo el cliente.',
    },
    {
      title: 'Cierre',
      prompt: "So, let me just verify your address and we'll get the next step started.",
      helper: 'Confirma el siguiente paso antes de terminar.',
    },
  ];

  protected readonly activeStepIndex = signal(0);
  protected readonly elapsedSeconds = signal(0);
  protected readonly isCallRunning = signal(false);
  protected readonly note = signal('');
  protected readonly activeStep = computed(() => this.steps[this.activeStepIndex()]);
  protected readonly formattedTime = computed(() => {
    const seconds = this.elapsedSeconds();
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  });

  protected selectStep(index: number): void {
    this.activeStepIndex.set(index);
  }

  protected nextStep(): void {
    this.activeStepIndex.update((index) => Math.min(index + 1, this.steps.length - 1));
  }

  protected startCall(): void {
    this.isCallRunning.set(true);
  }

  protected saveOutcome(outcome: string): void {
    this.isCallRunning.set(false);
    console.info(`Outcome saved: ${outcome}`, { note: this.note() });
  }
}
