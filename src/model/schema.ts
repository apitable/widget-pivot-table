import { BasicValueType, Field, IViewMeta, t } from '@apitable/widget-sdk';
import { StatType, Strings } from '../utils';

export interface AxisDimensionProps {
  fieldId: string;
  dateTimeFormatter?: string;
  isSplitMultipleValue?: boolean;
}

export interface ValueDimensionProps {
  fieldId: string;
  statType: StatType;
}

export interface IFormDataProps {
  configuration: {
    viewId: string;
    filter: string;
    rowDimensions: AxisDimensionProps[];
    columnDimensions: AxisDimensionProps[];
    valueDimensions: ValueDimensionProps[];
  };
  more: {
    isSummary: boolean;
    rowSortType: SortType;
    columnSortType: SortType;
  }
}

export const STAT_TYPE_MAP = {
  Sum: t(Strings.value_field_sum),
  Average: t(Strings.value_field_average),
  Max: t(Strings.value_field_max),
  Min: t(Strings.value_field_min),
  Empty: t(Strings.value_field_empty),
  Filled: t(Strings.value_field_filled),
  Unique: t(Strings.value_field_unique),
  PercentEmpty: t(Strings.value_field_percent_empty),
  PercentFilled: t(Strings.value_field_percent_filled),
  PercentUnique: t(Strings.value_field_percent_unique),
};

export enum SortType {
  None = 'none',
  Asc = 'asc',
  Desc = 'desc'
}

export const SORT_TYPE_MAP = {
  [SortType.None]: t(Strings.pivot_sort_by_default),
  [SortType.Asc]: t(Strings.pivot_sort_by_ascending),
  [SortType.Desc]: t(Strings.pivot_sort_by_descending),
};

export const NUMBER_FORMAT_TYPES = new Set([
  'number', 
  'currency', 
  'percent'
]);

export const isNumberType = (field: Field) => {
  const { basicValueType, formatType } = field;
  return basicValueType === BasicValueType.Number || (NUMBER_FORMAT_TYPES as any).has(formatType?.type);
};

export enum EnumType {
  Value = 'Value',
  Name = 'Name',
}

export enum AxisDimensionType {
  Column = 'Column',
  Row = 'Row'
}

// Date formatting type
export const DATE_TIME_FORMATTER_TYPES = [
  'YYYY-MM-DD',
  'YYYY-[W]ww',
  'YYYY-MM',
  'YYYY-[Q]Q',
  'YYYY',
];

export const DATE_TIME_FORMATTER_TYPES_NAMES = [
  t(Strings.year_month_day_hyphen),
  t(Strings.year_week_hyphen),
  t(Strings.label_format_year_and_month_split_by_dash),
  t(Strings.year_season_hyphen),
  t(Strings.year),
];

export const generateFieldEnums = (fields: Field[], enumType: EnumType): string[] => {
  if (enumType === EnumType.Value) {
    return ['', ...fields.map(field => field.id)];
  }
  return [t(Strings.option_blank), ...fields.map(field => field.name)];
};

export const MAX_ITEMS = 3;
export const COUNT_ALL_VALUE = 'fldCountAll';
export const COUNT_ALL_NAME = t(Strings.value_field_count_all);

// Insert a "Total Records" dummy column in fieldIds to construct the data for the pivot table
export const COUNT_ALL_VALUES = Array.from({ length: MAX_ITEMS }, (_, index) => {
  return `${COUNT_ALL_VALUE}_${index}`;
});

export class FormSchema {
  formData: IFormDataProps;
  views: Pick<IViewMeta, 'id' | 'name'>[];
  fields: Field[];

  constructor(
    formData: IFormDataProps, 
    views: Pick<IViewMeta, 'id' | 'name'>[],
    fields: Field[],
  ) {
    this.formData = formData;
    this.views = views;
    this.fields = fields;
  }

  // Get Form Schema
  getSchema() {
    return {
      type: 'object',
      title: t(Strings.pivot_settings),
      definitions: {
        dateTimeFormatter: {
          type: 'string',
          title: t(Strings.date_time_format),
          enum: DATE_TIME_FORMATTER_TYPES,
          enumNames: DATE_TIME_FORMATTER_TYPES_NAMES,
          default: DATE_TIME_FORMATTER_TYPES[0],
        },
        isSplitMultipleValue: {
          type: 'boolean',
          title: t(Strings.pivot_split_multiple_values),
          description: t(Strings.pivot_split_multiple_values)
        },
        statType: {
          type: 'string',
          enum: Object.keys(STAT_TYPE_MAP),
          enumNames: Object.values(STAT_TYPE_MAP),
          default: StatType.Sum
        }
      },
      properties: {
        configuration: {
          type: 'object',
          title: t(Strings.pivot_function_settings),
          properties: {
            viewId: this.getViewIdFormJSON(),
            filter: {
              type: 'string',
            },
            rowDimensions: this.getRowDimensionsFormJSON(),
            columnDimensions: this.getColumnDimensionsFormJSON(),
            valueDimensions: this.getValueDimensionsFormJSON(),
          },
        },
        more: this.getMoreFormJSON()
      },
    };
  }

  getViewIdFormJSON() {
    const viewEnum = this.views.map(view => view.id);
    const viewEnumNames = this.views.map(view => view.name);

    return {
      type: 'string',
      title: t(Strings.pivot_select_view),
      enum: viewEnum,
      enumNames: viewEnumNames,
      required: true
    };
  }

  getRowDimensionsFormJSON() {
    const { configuration } = this.formData;
    const { columnDimensions, valueDimensions } = configuration;
    const columnFieldIds = columnDimensions.map(d => d.fieldId);
    const valueFieldIds = valueDimensions.map(d => d.fieldId);
    const rowFields = this.fields.filter(field => {
      return !new Set([...columnFieldIds, ...valueFieldIds]).has(field.id);
    });

    return {
      type: 'array',
      title: t(Strings.pivot_select_row),
      maxItems: 1,
      items: {
        type: 'object',
        required: false,
        properties: {
          fieldId: {
            type: 'string',
            enum: generateFieldEnums(rowFields, EnumType.Value),
            enumNames: generateFieldEnums(rowFields, EnumType.Name),
          },
        },
        dependencies: {
          fieldId: {
            oneOf: this.getAxisDepsFormJSON(AxisDimensionType.Row)
          }
        }
      },
    };
  }

  getColumnDimensionsFormJSON() {
    const { configuration } = this.formData;
    const { rowDimensions, valueDimensions } = configuration;
    const rowFieldIds = rowDimensions.map(d => d.fieldId);
    const valueFieldIds = valueDimensions.map(d => d.fieldId);
    const columnFields = this.fields.filter(field => {
      return !new Set([...rowFieldIds, ...valueFieldIds]).has(field.id);
    });

    return {
      type: 'array',
      title: t(Strings.pivot_select_column),
      maxItems: 1,
      items: {
        type: 'object',
        required: false,
        properties: {
          fieldId: {
            type: 'string',
            enum: generateFieldEnums(columnFields, EnumType.Value),
            enumNames: generateFieldEnums(columnFields, EnumType.Name),
          },
        },
        dependencies: {
          fieldId: {
            oneOf: this.getAxisDepsFormJSON(AxisDimensionType.Column)
          }
        }
      },
    };
  }

  getAxisDepsFormJSON(axisDimensionType: AxisDimensionType) {
    const { configuration } = this.formData;
    const { rowDimensions, columnDimensions } = configuration;
    const dimensions = axisDimensionType === AxisDimensionType.Row ? rowDimensions : columnDimensions;
    return dimensions.map(({ fieldId }) => {
      const field = this.fields.find(field => field.id === fieldId);
      const res: any = {
        properties: {
          fieldId: { enum: [fieldId] },
        },
      };
      if (field && field.basicValueType === BasicValueType.Array) {
        res.properties.isSplitMultipleValue = { $ref: '#/definitions/isSplitMultipleValue' };
      }
      if (field && field.basicValueType === BasicValueType.DateTime) {
        res.properties.dateTimeFormatter = { $ref: '#/definitions/dateTimeFormatter' };
      }
      return res;
    });
  }

  getValueDimensionsFormJSON() {
    const { configuration } = this.formData;
    const { rowDimensions, columnDimensions } = configuration;
    const rowFieldIds = rowDimensions.map(d => d.fieldId);
    const columnFieldIds = columnDimensions.map(d => d.fieldId);
    const valueFields = this.fields.filter(field => {
      const { id } = field;
      return (
        isNumberType(field) &&
        !new Set([...rowFieldIds, ...columnFieldIds]).has(id)
      );
    });

    return {
      type: 'array',
      title: t(Strings.pivot_select_value),
      minItems: 1,
      maxItems: MAX_ITEMS,
      uniqueItems: false,
      items: {
        type: 'object',
        required: false,
        properties: {
          fieldId: {
            type: 'string',
            enum: [COUNT_ALL_VALUE, ...valueFields.map(field => field.id)],
            enumNames: [COUNT_ALL_NAME, ...valueFields.map(field => field.name)],
          },
        },
        dependencies: {
          fieldId: {
            oneOf: this.getValueDepsFormJSON()
          }
        },
      },
    };
  }

  getValueDepsFormJSON() {
    const { configuration } = this.formData;
    const { valueDimensions } = configuration;
    return valueDimensions.map(({ fieldId }) => {
      const field = this.fields.find(field => field.id === fieldId);
      const res: any = {
        properties: {
          fieldId: { enum: [fieldId] },
        },
      };
      if (field) {
        res.properties.statType = { $ref: '#/definitions/statType' };
      }
      return res;
    });
  }

  getMoreFormJSON() {
    return { 
      type: 'object',
      title: t(Strings.pivot_more_settings),
      properties: {
        isSummary: {
          type: 'boolean',
          title: t(Strings.pivot_summary_option),
          description: t(Strings.pivot_summary_option)
        },
        rowSortType: {
          type: 'string',
          title: t(Strings.pivot_row_sort),
          enum: Object.keys(SORT_TYPE_MAP),
          enumNames: Object.values(SORT_TYPE_MAP),
        },
        columnSortType: {
          type: 'string',
          title: t(Strings.pivot_column_sort),
          enum: Object.keys(SORT_TYPE_MAP),
          enumNames: Object.values(SORT_TYPE_MAP),
        }
      }
    };
  }
}