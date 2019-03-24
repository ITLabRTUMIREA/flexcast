let CURRENT_ID: number = 0;

export type SourceState = 'analyzing' | 'complete';

export class Beats {
  constructor(public head: number[], public tail: number[]) {}
}

export interface ISource {
  url: string;
  data: AudioBuffer;
  state: SourceState;
  beats?: Beats;
}

export interface ISourceHandle {
  source: ISource;
  pageX: number;
  pageY: number;
}

export interface ISample {
  id: number;
  source: ISource;
  offset: number;
  duration: number;

  fadeInOffset: number;
  fadeInDuration: number;
  fadeOutDuration: number;
  fadeOutOffset: number;
}

export class Sample implements ISample {
  public id: number;
  public source: ISource;
  public offset: number;
  public duration: number = 0;

  public fadeInOffset: number = 0;
  public fadeInDuration: number = 0;
  public fadeOutDuration: number = 0;
  public fadeOutOffset: number = 0;

  constructor(source: ISource, offset: number) {
    this.id = CURRENT_ID++;
    this.source = source;
    this.offset = offset;
  }

  get isComplete() {
    return this.duration > 0;
  }
}
