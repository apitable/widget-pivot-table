import { StatType } from '../helper';
import { slice, aggregate } from './mock';

describe('Aggregate function test', () => {
  it('COUNT_ALL', () => {
    const statType = StatType.CountAll;

    expect(
      aggregate(slice, 'fld001', statType)
    ).toEqual(5);

    expect(
      aggregate(slice, 'fld002', statType)
    ).toEqual(5);
  })

  it('EMPTY', () => {
    const statType = StatType.Empty;

    expect(
      aggregate(slice, 'fld001', statType)
    ).toEqual(1);

    expect(
      aggregate(slice, 'fld002', statType)
    ).toEqual(5);
  })

  it('FILLED', () => {
    const statType = StatType.Filled;

    expect(
      aggregate(slice, 'fld001', statType)
    ).toEqual(4);

    expect(
      aggregate(slice, 'fld002', statType)
    ).toEqual(0);
  })

  it('UNIQUE', () => {
    const statType = StatType.Unique;

    expect(
      aggregate(slice, 'fld001', statType)
    ).toEqual(5);

    expect(
      aggregate(slice, 'fld002', statType)
    ).toEqual(1);
  })

  it('PERCENT_EMPTY', () => {
    const statType = StatType.PercentEmpty;

    expect(
      aggregate(slice, 'fld001', statType)
    ).toEqual('20%');

    expect(
      aggregate(slice, 'fld002', statType)
    ).toEqual('100%');
  })

  it('PERCENT_FILLED', () => {
    const statType = StatType.PercentFilled;

    expect(
      aggregate(slice, 'fld001', statType)
    ).toEqual('80%');

    expect(
      aggregate(slice, 'fld002', statType)
    ).toEqual('0%');
  })

  it('PERCENT_UNIQUE', () => {
    const statType = StatType.PercentUnique;

    expect(
      aggregate(slice, 'fld001', statType)
    ).toEqual('100%');

    expect(
      aggregate(slice, 'fld002', statType)
    ).toEqual('20%');
  })

  it('SUM', () => {
    const statType = StatType.Sum;

    expect(
      aggregate(slice, 'fld001', statType)
    ).toEqual(1500);

    expect(
      aggregate(slice, 'fld002', statType)
    ).toEqual(0);
  })

  it('AVERAGE', () => {
    const statType = StatType.Average;

    expect(
      aggregate(slice, 'fld001', statType)
    ).toEqual(250);

    expect(
      aggregate(slice, 'fld002', statType)
    ).toEqual(0);
  })

  it('MAX', () => {
    const statType = StatType.Max;

    expect(
      aggregate(slice, 'fld001', statType)
    ).toEqual(500);

    expect(
      aggregate(slice, 'fld002', statType)
    ).toBeUndefined();
  })

  it('MIN', () => {
    const statType = StatType.Min;

    expect(
      aggregate(slice, 'fld001', statType)
    ).toEqual(100);

    expect(
      aggregate(slice, 'fld002', statType)
    ).toBeUndefined();
  })
})