import { createLogger } from 'winston';
import NeDB from '../src';
import timekeeper from 'timekeeper';

describe('rotate', function () {
  beforeEach(async function () {
    this.t1 = new Date(1330688329321);
    this.diff = 1000000000;
    this.t2 = new Date(1330688329321 + this.diff);

    this.transport = new NeDB();

    this.logger = createLogger({
      transports: this.transport
    });

    timekeeper.freeze(this.t1);
    this.logger.log('info', 'old log');
    timekeeper.freeze(this.t2);
    this.logger.log('info', 'new log');

    await new Promise(resolve => {
      let count = 0;

      this.transport.on('logged', () => {
        count++;
        if (count === 2) { resolve(); }
      });
    });
  });

  afterEach(async function () {
    timekeeper.reset();
  });

  it('remove old rows', async function () {
    timekeeper.travel(this.t2);
    const numRemoved = await this.transport.rotate(this.diff / 2);
    expect(numRemoved).to.equal(1);
  });
});
