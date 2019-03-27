import { Source } from './Source';

let CURRENT_ID = 0;

export class Sample {
  public id: number;
  public source: Source;
  public offset: number = 0;
  public duration: number = 0;

  public fadeInOffset: number = 0;
  public fadeInDuration: number = 0;
  public fadeOutDuration: number = 0;
  public fadeOutOffset: number = 0;

  constructor(source: Source) {
    this.id = CURRENT_ID++;
    this.source = source;
  }

  get isComplete() {
    return this.duration > 0;
  }
}
