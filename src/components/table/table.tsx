import React, { FC, memo, useMemo, useState } from 'react';
import {
  DrillNode,
  buildCrossTable,
  buildRecordMatrix,
  convertDrillTreeToCrossTree,
  CrossTableLeftMetaColumn,
} from 'ali-react-table/pivot';
import { useThemeColors } from '@apitable/components';
import { useRecords, t, useFields, FieldType } from '@apitable/widget-sdk';
import { COUNT_ALL_NAME, COUNT_ALL_VALUE, COUNT_ALL_VALUES, IFormDataProps, ITableBaseProps, SortType, TableBase } from '../../model';
import { buildDrillTree, createAggregateFunction, StatType, Strings, serialNumberHandler, columnHandler } from '../../utils';
import { features, useTablePipeline } from 'ali-react-table';
import { renderer } from './renderer';
import { CustomBaseTable } from './styled';
import { defaultEmptyContent } from './empty_content';

interface ITableProps {
	formData: IFormDataProps;
}

// Record does not exist
export const NOT_EXIST = Symbol('notExist');

export const generateSubtotalNode = (node: DrillNode) => {
  return {
    position: 'end' as const,
    value: node.path.length === 0 ? t(Strings.pivot_totals) : t(Strings.pivot_subtotals),
  };
};

export const PivotTable: FC<ITableProps> = memo((props) => {
  const { formData } = props;
  const { configuration, more } = formData;
  const { isSummary, rowSortType, columnSortType } = more;
  const { rowDimensions, columnDimensions, valueDimensions, viewId, filter } = configuration;
  const colors = useThemeColors();

  const fields = useFields(viewId);
  const recordQuery = useMemo(() => ({ filter }), [filter]);
  const records = useRecords(viewId, recordQuery);
  const [indicatorSide] = useState('top');
  const handledValueDimensions = useMemo(() => {
    return valueDimensions.map((dim, index) => {
      const fieldId = dim.fieldId;
      return {
        ...dim,
        fieldId: fieldId === COUNT_ALL_VALUE ? `${fieldId}_${index}` : fieldId
      };
    });
  }, [valueDimensions]);

  const rowConfigs = useMemo(() => {
    return rowDimensions.map(dim => {
      const field = fields.find(field => field.id === dim.fieldId);
      if (!field) return null;
      const { id: fieldId, name, type, entityType } = field || {};
      return {
        fieldId,
        name, 
        type, 
        entityType,
        isSplitMultipleValue: dim.isSplitMultipleValue,
        dateTimeFormatter: dim.dateTimeFormatter,
        field
      };
    }).filter(Boolean);
  }, [rowDimensions, fields]);

  const columnConfigs = useMemo(() => {
    return columnDimensions.map(dim => {
      const field = fields.find(field => field.id === dim.fieldId);
      if (!field) return null;
      const { id: fieldId, name, type, entityType } = field || {};
      return {
        fieldId,
        name, 
        type, 
        entityType,
        isSplitMultipleValue: dim.isSplitMultipleValue,
        dateTimeFormatter: dim.dateTimeFormatter,
        field,
      };
    }).filter(Boolean);
  }, [columnDimensions, fields]);

  // Because the order returned by valueFields does not match the valueFieldIds, it is sorted again
  const valueConfigs = useMemo(() => {
    return handledValueDimensions.map((dim) => {
      const { fieldId, statType } = dim;
      if (COUNT_ALL_VALUES.findIndex(id => id === fieldId) > -1) {
        return {
          fieldId,
          name: COUNT_ALL_NAME, 
          type: FieldType.Number, 
          entityType: FieldType.Number,
          statType,
          field: { id: fieldId }
        };
      }
      const field = fields.find(field => field.id === dim.fieldId);
      if (!field) return null;
      const { name, type, entityType } = field;
      return {
        fieldId,
        name, 
        type, 
        entityType,
        statType,
        field
      };
    }).filter(Boolean);
  }, [handledValueDimensions, fields]);

  const tableConfig = useMemo(() => {
    return new TableBase({ 
      rowConfigs, 
      columnConfigs, 
      valueConfigs,
    } as ITableBaseProps);
  }, [rowConfigs, columnConfigs, valueConfigs]);

  const data = useMemo(() => tableConfig.getData(records), [tableConfig, records]);

  const dimensionsMap = useMemo(() => {
    const dimensions = tableConfig.getDimensions(renderer);
    return new Map(dimensions.map((dim) => [dim.code, dim]));
  }, [tableConfig]);

  const visibleIndicators = useMemo(() => {
    const indicators = tableConfig.getIndicators(renderer);
    return indicators.filter((ind) => !ind.hidden);
  }, [tableConfig]);

  // Get top and left indicators
  const leftCodes = useMemo(() => rowDimensions.map(d => d.fieldId).filter(Boolean), [rowDimensions]);
  const topCodes = useMemo(() => columnDimensions.map(d => d.fieldId).filter(Boolean), [columnDimensions]);

  // Generate aggregation function
  const aggregate = useMemo(() => {
    const handledDimensions = handledValueDimensions.map(({ fieldId, statType }, index) => {
      return { 
        fieldId, 
        statType: COUNT_ALL_VALUES.includes(fieldId) ? StatType.Sum : statType 
      };
    });
    return createAggregateFunction(handledDimensions);
  }, [handledValueDimensions]);

  // Generate left side drill-down tree
  const leftDrillTree = useMemo(() => buildDrillTree(data, leftCodes, {
    includeTopWrapper: true,
    sortType: rowSortType
  }), [data, leftCodes, rowSortType]);

  // Convert the generated drill-down tree into the leftTree of the pivot table
  const [leftTreeRoot] = useMemo(() => convertDrillTreeToCrossTree(leftDrillTree, {
    indicators: indicatorSide === 'left' ? visibleIndicators : undefined,
    generateSubtotalNode: isSummary ? generateSubtotalNode : undefined,
  }), [leftDrillTree, indicatorSide, visibleIndicators, isSummary]);

  // Generate top-down drill tree
  const topDrillTree = useMemo(() => buildDrillTree(data, topCodes, {
    includeTopWrapper: true,
    sortType: columnSortType,
  }), [data, topCodes, columnSortType]);

  // Convert the generated drill-down tree into a pivot table topTree
  const [topTreeRoot] = useMemo(() => convertDrillTreeToCrossTree(topDrillTree, {
    indicators: indicatorSide === 'top' ? visibleIndicators : undefined,
    generateSubtotalNode: isSummary ? generateSubtotalNode : undefined,
  }), [topDrillTree, indicatorSide, visibleIndicators, isSummary]);

  // Build matrix
  const matrix = useMemo(() => buildRecordMatrix({
    data,
    leftCodes,
    topCodes,
    aggregate,
    prebuiltLeftTree: leftDrillTree,
    prebuiltTopTree: topDrillTree,
  }), [data, leftCodes, topCodes, aggregate, leftDrillTree, topDrillTree]);

  const renderEnable = Boolean(data.length && (leftTreeRoot.children?.length || topTreeRoot.children?.length));

  // Build pivot table data source
  const { dataSource: draftDataSource, columns } = buildCrossTable({
    leftTree: leftTreeRoot.children || [],
    topTree: topTreeRoot.children || [],
    leftTotalNode: renderEnable ? leftTreeRoot : undefined,
    topTotalNode: renderEnable ? topTreeRoot : undefined,
    getValue: (leftNode, topNode) => {
      const record = matrix.get(leftNode.data.dataKey)?.get(topNode.data.dataKey);
      if (record == null) return NOT_EXIST;
      const indicator = leftNode.data?.indicator ?? topNode.data?.indicator;
      return record[indicator.code];
    },
    render: (value, leftNode, topNode) => {
      const indicator = leftNode.data?.indicator ?? topNode.data?.indicator;
      return indicator.render(value);
    },
    leftMetaColumns: renderEnable ? leftCodes.map((code) => dimensionsMap.get(code)) as CrossTableLeftMetaColumn[] : [],
  });

  const totalData = isSummary ? draftDataSource.pop() : undefined;

  // Capability expansion with pipeline
  const pipeline = useTablePipeline({})
    .input({ dataSource: draftDataSource, columns })
    .use(columnHandler(leftCodes, columnConfigs[0]?.field))
    .use(serialNumberHandler())
    .use(features.columnHover())
    .use(
      features.sort({ 
        mode: 'single', 
        clickArea: 'icon',
        orders: [SortType.Asc, SortType.Desc, SortType.None]
      }),
    );

  const baseTableProps = pipeline.getProps();

  if (totalData) {
    baseTableProps.dataSource.push(totalData);
  }

  const { columns: finalColumns, dataSource } = baseTableProps;

  return (
    <CustomBaseTable
      style={{
        borderTop: renderEnable ? 'initial' : `1px solid ${colors.lineColor}`,
      }}
      useVirtual={{
        horizontal: true,
        vertical: true,
        header: false,
      }}
      defaultColumnWidth={150}
      {...baseTableProps}
      components={{				
        EmptyContent:  defaultEmptyContent({
          content: (finalColumns.length === 1 && dataSource.length === 0) 
            ? t(Strings.pivot_table_no_data) 
            : t(Strings.pivot_table_filter_result_is_empty)
        })	
      }}
    />
  );
});