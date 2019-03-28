require('should');
const FrequencyTable = require('../src/frequency-table');

let frequencyTable = new FrequencyTable(
  new Array(257).fill(0)
);

describe('FrequencyTable', function() {
  describe('constructor', function() {
    it('should construct from an array', function() {
      frequencyTable.toString().should.not.eql('');
    });
    it('should construct from another FrequencyTable', function() {
      let anotherFrequencyTanble = new FrequencyTable(frequencyTable);
      anotherFrequencyTanble.toString().should.not.eql('');
    });
  });
  describe('getters and setters', function() {
    it('should get symbol limit', function() {
      frequencyTable.symbolLimit.should.eql(257);
    });
    it('should get total', function() {
      frequencyTable.total.should.eql(0);
    });
    it('should set and get symbol', function() {
      frequencyTable.set(2, 20);
      frequencyTable.get(2).should.eql(20);
    });
    it('should get low and high', function() {
      frequencyTable = new FrequencyTable(
        [...Array(257).keys()]
      );
      
      frequencyTable.getLow(0).should.eql(0);
      frequencyTable.getHigh(0).should.eql(0);

      frequencyTable.getLow(1).should.eql(0);
      frequencyTable.getHigh(1).should.eql(1);

      frequencyTable.symbolLimit.should.eql(257);

      frequencyTable.getLow(256).should.eql(32640);
      frequencyTable.getHigh(256).should.eql(32896);

      frequencyTable.getHigh(256).should.eql(frequencyTable.total);
    });
    it('should increment', function() {
      frequencyTable.increment(0);
      frequencyTable.getLow(256).should.eql(32640 + 1);
      frequencyTable.getHigh(256).should.eql(32896 + 1);
    });
  });
  describe('throw error', function() {
    it('should throw Error when construct with empty frequencies', function() {
      (() => {
        // eslint-disable-next-line no-unused-vars
        let test = new FrequencyTable([]);
      }).should.throw('At least 1 symbol needed');
    });
    it('should throw Error when construct with negative frequencies', function() {
      (() => {
        // eslint-disable-next-line no-unused-vars
        let test = new FrequencyTable([-1]);
      }).should.throw('Negative frequency');
    });
    it('should throw Error when set with negative frequencies', function() {
      (() => {
        frequencyTable.set(3, -1);
      }).should.throw('Negative frequency');
    });
    it('should throw RangeError when symbol out of range', function() {
      (() => {
        frequencyTable.get(10000);
      }).should.throw('Symbol out of range');
    });
  });
});