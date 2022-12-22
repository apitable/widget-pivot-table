import { aggregate as _aggregate, StatType } from "../helper";

export const slice = [{
  fld001: 100,
  fld002: null,
}, {
  fld001: 200,
  fld002: null,
}, {
  fld001: [300],
  fld002: null,
}, {
  fld001: [400, 500],
  fld002: null,
}, {
  fld001: null,
  fld002: null,
}];

export const aggregate = (slice: any[], fieldId: string, statType: StatType) => {
  const result = _aggregate(slice, fieldId, statType);
  return result?.[fieldId];
};