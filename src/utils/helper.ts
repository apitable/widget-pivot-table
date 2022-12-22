import { t } from '@apitable/widget-sdk';
import { groupBy2 } from 'ali-react-table';
import { DrillNode, simpleEncode } from 'ali-react-table/dist/ali-react-table-pivot';
import { SortType } from '../model';
import { Strings } from './i18n';
import { 
  filter, isArray, isNumber, isString, map, max, maxBy, min, minBy, sum, sumBy, uniq, isObject
} from 'lodash';
import { NOT_EXIST } from '../components';

export enum StatType {
  None = 'None',
  CountAll = 'CountAll',
  Empty = 'Empty',
  Filled = 'Filled',
  Unique = 'Unique',
  PercentEmpty = 'PercentEmpty',
  PercentFilled = 'PercentFilled',
  PercentUnique = 'PercentUnique',
  Sum = 'Sum',
  Average = 'Average',
  Max = 'Max',
  Min = 'Min',
  DateRangeOfDays = 'DateRangeOfDays',
  DateRangeOfMonths = 'DateRangeOfMonths',
  Checked = 'Checked',
  UnChecked = 'UnChecked',
  PercentChecked = 'PercentChecked',
  PercentUnChecked = 'PercentUnChecked',
}

export const aggregate = (slice: any[], fieldId: string, statType: StatType = StatType.None) => {
  const recordFlagProp = `isRecord_${fieldId}`;
  const validCountProp = `validCount_${fieldId}`;
  const totalCountProp = `totalCount_${fieldId}`;
  const totalValueProp = `totalValue_${fieldId}`;

  switch (statType) {
    case StatType.CountAll: {
      const isTotal = slice[0]?.[recordFlagProp];
      return {
        [fieldId]: isTotal ? sumBy(slice, fieldId) : slice.length,
        [recordFlagProp]: true
      };
    }
    case StatType.Empty: {
      const isTotal = slice[0]?.[recordFlagProp];
      return {
        [fieldId]: isTotal ? sumBy(slice, fieldId) : filter(slice, (o) => !o[fieldId]).length,
        [recordFlagProp]: true
      };
    }
    case StatType.Filled: {
      const isTotal = slice[0]?.[recordFlagProp];
      return {
        [fieldId]: isTotal ? sumBy(slice, fieldId) : filter(slice, (o) => o[fieldId]).length,
        [recordFlagProp]: true
      };
    }
    case StatType.Unique: {
      const isTotal = slice[0]?.[recordFlagProp];
      return {
        [fieldId]: isTotal ? sumBy(slice, fieldId) : uniq(map(slice, (o) => JSON.stringify(o[fieldId]))).length,
        [recordFlagProp]: true
      };
    }
    case StatType.PercentEmpty: {
      const isTotal = slice[0]?.[recordFlagProp];
      const validCount = isTotal ? sumBy(slice, (o) => o[validCountProp]) : filter(slice, (o) => !o[fieldId]).length;
      const totalCount = isTotal ? sumBy(slice, (o) => o[totalCountProp]) : slice.length;
      return {
        [fieldId]: Math.round(validCount * 100 / totalCount) + '%',
        [validCountProp]: validCount,
        [totalCountProp]: totalCount,
        [recordFlagProp]: true
      };
    }
    case StatType.PercentFilled: {
      const isTotal = slice[0]?.[recordFlagProp];
      const validCount = isTotal ? sumBy(slice, (o) => o[validCountProp]) : filter(slice, (o) => o[fieldId]).length;
      const totalCount = isTotal ? sumBy(slice, (o) => o[totalCountProp]) : slice.length;
      return {
        [fieldId]: Math.round(validCount * 100 / totalCount) + '%',
        [validCountProp]: validCount,
        [totalCountProp]: totalCount,
        [recordFlagProp]: true
      };
    }
    case StatType.PercentUnique: {
      const isTotal = slice[0]?.[recordFlagProp];
      const validCount = isTotal ? sumBy(slice, (o) => o[validCountProp]) : uniq(map(slice, (o) => JSON.stringify(o[fieldId]))).length;
      const totalCount = isTotal ? sumBy(slice, (o) => o[totalCountProp]) : slice.length;
      return {
        [fieldId]: Math.round(validCount * 100 / totalCount) + '%',
        [validCountProp]: validCount,
        [totalCountProp]: totalCount,
        [recordFlagProp]: true
      };
    }
    case StatType.Sum: {
      return {
        [fieldId]: sumBy(slice, (o) => {
          const cv = o[fieldId];
          return isArray(cv) ? sum(cv) : cv;
        }),
      };
    }
    case StatType.Average: {
      const isTotal = slice[0]?.[recordFlagProp];
      const totalValue = isTotal ? sumBy(slice, (o) => o[totalValueProp]) : sumBy(slice, (o) => isArray(o[fieldId]) ? sum(o[fieldId]) : o[fieldId]);
      const totalCount = isTotal ? sumBy(slice, (o) => o[totalCountProp]) : sumBy(slice, (o) => isArray(o[fieldId]) ? o[fieldId].length : 1);
      return {
        [fieldId]: totalValue / totalCount,
        [totalValueProp]: totalValue,
        [totalCountProp]: totalCount,
        [recordFlagProp]: true
      };
    }
    case StatType.Max: {
      const maxNum = maxBy(slice, (o) => isArray(o[fieldId]) ? max(o[fieldId]) : o[fieldId])?.[fieldId];
      return {
        [fieldId]: isArray(maxNum) ? max(maxNum) : maxNum,
      };
    }
    case StatType.Min: {
      const minNum = minBy(slice, (o) => isArray(o[fieldId]) ? min(o[fieldId]) : o[fieldId])?.[fieldId];
      return {
        [fieldId]: isArray(minNum) ? min(minNum) : minNum,
      };
    }
    default: 
      return null;
  }
};

// Aggregation of data across multiple dimensions
export const createAggregateFunction = (fieldDatas: { fieldId: string; statType: StatType; }[]) => {
  return (slice: any[]) => {
    return fieldDatas.reduce((prev, data) => {
      const { fieldId, statType } = data;
      const result = aggregate(slice, fieldId, statType);
      return { ...prev, ...result };
    }, {});
  };
};

/**
 * Comparison functions, supporting strings, numbers, arrays and null
 * 1. For strings the dictionary order of the two will be compared
 * 2. For numbers will compare the two sizes
 * 3. The null value is always less than the other value when comparing
 * 4. For arrays, the elements of the array will be compared one by one, and the first unequal comparison will be the result of the whole array comparison
 */
export const compare = (x: any, y: any): number => {
  if (x == null || x == NOT_EXIST) {
    return -1;
  }
  if (y == null || y == NOT_EXIST) {
    return 1;
  }

  if (isNumber(x) && isNumber(y)) {
    return x - y;
  }

  if (isString(x) && isString(y)) {
    if (x < y) {
      return -1;
    } else if (x > y) {
      return 1;
    } 
    return 0;
    
  }

  if (Array.isArray(x) && Array.isArray(y)) {
    const len = Math.min(x.length, y.length);
    for (let i = 0; i < len; i++) {
      const cmp = (isObject(x[i]) && isObject(y[i])) ? 
        ('name' in x[i] ? compare(x[i].name, y[i].name) : compare(x[i].title, y[i].title)) : 
        compare(x[i], y[i]);
      if (cmp !== 0) {
        return cmp;
      }
    }

    // When the array length is unequal, the field with fewer elements is placed first
    return x.length - y.length;
  }
  return (
    (isObject(x as any) && isObject(y as any)) ? 
      (x?.name ? compare(x.name, y.name) : compare(x.title, y.title)) : 0
  );
};

// Calculate the drill-down tree based on the specified codes
export const buildDrillTree = (
  data: any[],
  codes: string[],
  {
    encode = simpleEncode,
    totalValue = t(Strings.pivot_totals),
    includeTopWrapper = false,
    isExpand = (...args: any[]) => true,
    enforceExpandTotalNode = true,
    sortType = SortType.Asc,
    parseFn = (v) => JSON.parse(v),
  } = {},
): DrillNode[] => {
  const emptyPath: string[] = [];
  const totalKey = encode(emptyPath);

  let array: DrillNode[];
  let hasChild = false;

  if (codes.length === 0) {
    array = [];
  } else if (!enforceExpandTotalNode && !isExpand(totalKey)) {
    array = [];
    hasChild = data.length > 0;
  } else {
    array = dfs(data, []);
  }

  if (includeTopWrapper) {
    const rootNode: DrillNode = {
      key: totalKey,
      value: totalValue,
      path: emptyPath,
      children: array,
    };
    if (hasChild) {
      rootNode.hasChild = hasChild;
    }
    return [rootNode];
  }

  return array;

  function dfs(slice: any[], path: string[]): DrillNode[] {
    const depth = path.length;
    const array: DrillNode[] = [];
    const code = codes[depth];
    const groups = groupBy2(slice, (row) => row[code]);

    for (const groupKey of groups.keys()) {
      path.push(groupKey);

      const node: DrillNode = {
        key: encode(path),
        value: groupKey,
        path: path.slice(),
      };
      array.push(node);

      const group = groups.get(groupKey);
      if (group?.length && depth < codes.length - 1) {
        if (isExpand(node.key)) {
          node.children = dfs(group, path);
        } else {
          node.hasChild = true;
        }
      }
      path.pop();
    }
    // Sorting the row/column dimensions
    return (
      sortType === SortType.None ? 
        array : 
        array.slice().sort((a, b) => {
          return sortType === SortType.Asc ? 
            compare(parseFn(a.value), parseFn(b.value)) :
            compare(parseFn(b.value), parseFn(a.value));
        })
    );
  }
};