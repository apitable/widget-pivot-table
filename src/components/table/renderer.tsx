import React from 'react';
import { 
  Field, FieldType, t, BasicValueType,
  CellAttachment, CellCheckbox, CellEnhanceText, 
  CellMultiText, CellText
} from '@apitable/widget-sdk';
import { StatType, Strings } from '../../utils';
import { COUNT_ALL_VALUES, SPLIT_TYPE_MAP } from '../../model';
import { CellOptions } from './cell_options';
import { NOT_EXIST } from '../table';
import { isArray } from 'lodash';
import { CellLink } from './cell_link';
import { CellMember } from './cell_member';

export const ORIGINAL_STAT_TYPE_MAP = new Set([
  StatType.CountAll, 
  StatType.Filled, 
  StatType.Empty, 
  StatType.Unique,
  StatType.PercentFilled,
  StatType.PercentEmpty,
  StatType.PercentUnique
]);

export const renderer = (
  value, 
  field: Field, 
  statType: StatType = StatType.None, 
  parseFn: Function = (value) => JSON.parse(value)
) => {
  if ([t(Strings.pivot_totals), t(Strings.pivot_subtotals)].includes(value)) return value;
  if (value === NOT_EXIST) return '-'; // Record does not exist
  if (COUNT_ALL_VALUES.includes(field.id)) return value;

  const { type, entityType, fieldData, basicValueType } = field;
  const property = fieldData.property;
  let cellValue;

  try {
    cellValue = parseFn(value);
  } catch (e) {
    console.log(e);
  }

  // Record is empty
  if (cellValue == null || (SPLIT_TYPE_MAP.has(entityType) && isArray(cellValue) && !cellValue?.length)) {
    return '-';
  }

  if (type === FieldType.MagicLookUp && basicValueType === BasicValueType.Number) {
    return <CellText text={field.convertCellValueToString(cellValue)} />;	
  }

  if (ORIGINAL_STAT_TYPE_MAP.has(statType)) {
    return cellValue;
  }

  switch (entityType) {
    case FieldType.URL:
    case FieldType.Phone:
    case FieldType.Email:
    case FieldType.SingleText:
      return (
        <CellEnhanceText 
          text={String(cellValue)} 
          cellStyle={{
            wordBreak: 'break-word'
          }}
        />
      );
    case FieldType.Text:
      return <CellMultiText text={cellValue} />;
    case FieldType.DateTime:
    case FieldType.CreatedTime:
    case FieldType.LastModifiedTime:
      return <CellText text={cellValue} />;
    case FieldType.Currency:
    case FieldType.Percent:
    case FieldType.AutoNumber:
    case FieldType.Number:
    case FieldType.Rating:
      return <CellText text={field.convertCellValueToString(cellValue)} />;	
    case FieldType.Formula:
      return (
        <CellText 
          text={
            basicValueType === BasicValueType.DateTime ? cellValue : field.convertCellValueToString(cellValue)
          }
          cellStyle={{
            wordBreak: 'break-word'
          }}
        />
      );
    case FieldType.SingleSelect:
    case FieldType.MultiSelect:
      return (
        <CellOptions 
          options={property.options} 
          selectOptions={cellValue} 
          style={{ justifyContent: 'center' }}
          cellStyle={{ 
            marginRight: entityType === FieldType.SingleSelect ? 0 : 8, 
            fontWeight: 'normal' 
          }} 
        />
      );
    case FieldType.Attachment:
      return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <CellAttachment files={cellValue} style={{ overflow: 'hidden' }} />
        </div>
      );
    case FieldType.Member:
    case FieldType.LastModifiedBy:
    case FieldType.CreatedBy:
      return (
        <CellMember cellValue={cellValue} />
      );
    case FieldType.Checkbox:
      return <CellCheckbox field={property} checked={cellValue} />;
    case FieldType.MagicLink:
      return (
        <CellLink cellValue={cellValue} />
      );
    default:
      return null;
  }
};