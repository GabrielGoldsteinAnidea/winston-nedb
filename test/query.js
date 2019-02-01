import { createLogger } from 'winston';
import NeDB from '../src';

describe('query', function () {
  beforeEach(async function () {
    this.transport = new NeDB();

    this.logger = createLogger({
      transports: this.transport
    });

    this.logger.log('info', '1log');
    this.logger.log('info', '2log');
    this.logger.log('info', '3log');

    await new Promise(resolve => {
      let count = 0;

      this.transport.on('logged', () => {
        count++;
        if (count === 3) { resolve(); }
      })
    })
  });

  it('order: asc', function (done) {
    this.logger.query({ order: 'asc' }, (err, res) => {
      expect(err).not.to.exist;
      expect(res).to.have.property('nedb');

      expect(res.nedb).to.be.an('array');
      expect(res.nedb).to.have.length(3);
      expect(res.nedb[0]).to.have.property('message', '1log');
      expect(res.nedb[1]).to.have.property('message', '2log');
      expect(res.nedb[2]).to.have.property('message', '3log');
      done();
    });
  });

  it('order: desc', function (done) {
    this.logger.query({ order: 'desc' }, (err, res) => {
      expect(err).not.to.exist;
      expect(res).to.have.property('nedb');

      expect(res.nedb).to.be.an('array');
      expect(res.nedb).to.have.length(3);
      expect(res.nedb[0]).to.have.property('message', '3log');
      expect(res.nedb[1]).to.have.property('message', '2log');
      expect(res.nedb[2]).to.have.property('message', '1log');
      done();
    });
  });

  it('limit: 2', function (done) {
    this.logger.query({ limit: 2 }, function (err, res) {
      expect(err).not.to.exist;
      expect(res).to.have.property('nedb');

      expect(res.nedb).not.to.be.empty;
      expect(res.nedb).to.have.length.below(3);
      done();
    });
  });

  it('skip: 2', function (done) {
    this.logger.query({ order: 'asc', start: 2 }, function (err, res) {
      expect(err).not.to.exist;
      expect(res).to.have.property('nedb');

      expect(res.nedb).not.to.be.empty;
      expect(res.nedb[0]).to.have.property('message', '3log');
      done();
    });
  });
});
