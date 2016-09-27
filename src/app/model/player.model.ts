export class Player {
  readonly index = 0;
  readonly instrument: string;
  readonly gain = 1;
  readonly pan = 0;

  constructor(fields = {}) {
    Object.assign(this, fields);
  }

}
