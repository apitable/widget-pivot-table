import React, { useCallback } from 'react';
import { useFields, useViewsMeta, t } from '@apitable/widget-sdk';
import { COUNT_ALL_VALUE, DATE_TIME_FORMATTER_TYPES, isNumberType, SortType } from './schema';
import { FieldSelect, FilterSelect } from '../components';
import { StatType, Strings } from '../utils';
import Settings from '../../settings.json';

export const useGetDefaultFormData = () => {
  const views = useViewsMeta();
  const viewId = views[0].id;
  const fields = useFields(viewId);
  const rowFieldId = fields[0]?.id || '';
  const columnFieldId = fields[1]?.id || '';
  const valueFieldId = fields.filter(field => {
    const { id } = field;
    return (
      isNumberType(field) &&
      !new Set([rowFieldId, columnFieldId]).has(id)
    );
  })[0]?.id || COUNT_ALL_VALUE;

  // Default form configuration
  return useCallback(() => {
    return {
      configuration: {
        viewId: views[0].id,
        filter: null,
        rowDimensions: [{ fieldId: rowFieldId, dateTimeFormatter: DATE_TIME_FORMATTER_TYPES[0] }],
        columnDimensions: [{ fieldId: columnFieldId, dateTimeFormatter: DATE_TIME_FORMATTER_TYPES[0] }],
        valueDimensions: [{ fieldId: valueFieldId, statType: StatType.Sum }],
      },
      more: {
        isSummary: true,
        rowSortType: SortType.None,
        columnSortType: SortType.None,
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

const getDimensionsUiSchema = (viewId: string) => ({
  'ui:options': {
    removable: false
  },
  items: {
    'ui:options':  {
      showTitle: false,
      inline: true,
      layout: [['fieldId', 'dateTimeFormatter'], ['isSplitMultipleValue']],
    },
    fieldId: {
      'ui:options': {
        showTitle: false,
      },
      'ui:widget': props => <FieldSelect {...props} viewId={viewId} />,
    },
    dateTimeFormatter: {
      'ui:options': {
        showTitle: false,
      },
    },
    isSplitMultipleValue: {
      'ui:options': {
        showTitle: false,
      },
    },
  },
});

export const getUiSchema = (viewId: string) => ({
  'ui:options': {
    help: {
      text: t(Strings.pivot_setting_help_tips),
      url: Settings.pivot_setting_help_url,
    },
  },
  configuration: {
    filter: {
      'ui:options': {
        showTitle: false,
      },
      'ui:widget': (props) => {
        return <FilterSelect value={props.value} onChange={filter => props.onChange(filter)}/>;
      },
    },
    rowDimensions: getDimensionsUiSchema(viewId),
    columnDimensions: getDimensionsUiSchema(viewId),
    valueDimensions: {
      'ui:options': {
        removable: true
      },
      items: {
        'ui:options':  {
          inline: true,
          showTitle: false,
        },
        fieldId: {
          'ui:options': {
            showTitle: false,
          },
          'ui:widget': props => <FieldSelect {...props} viewId={viewId} />,
        },
        statType: {
          'ui:options': {
            showTitle: false,
          },
        },
      }
    },
  },
  more: {
    'ui:options': {
      collapse: true,
    },
    isSummary: {
      'ui:options':  {
        showTitle: false,
      },
    },
    rowSortType: {
      'ui:widget': 'toggleButtonWidget',
    },
    columnSortType: {
      'ui:widget': 'toggleButtonWidget',
    }
  }
});