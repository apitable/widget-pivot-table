import { Field, t } from '@apitable/widget-sdk';
import { TablePipeline } from 'ali-react-table';
import { renderer } from '../components';
import { StatType } from './helper';
import { Strings } from './i18n';

// Handling columns, adapting pivot table sorting
export const columnHandler = (leftCodes: string[], columnField?: Field) => {
  return (pipeline: TablePipeline) => {
    return pipeline.mapColumns((cols) => cols.map((column, index) => {
      const { columnType, name } = column as any;
      // When the left dimension is empty, do the processing of the column data
      if (columnType === 'left' && leftCodes.length) {
        return {
          ...column,
          getSpanRect: undefined,
          getCellProps: (value) => ({ style: { fontWeight: 'bold' }}),
        };
      }
  
      let children;
  
      if (column?.children) {
        // Constructing different codes for sorting
        children = column.children.map((data, innerIndex) => {
          return { 
            ...data, 
            code: `${(data.code || '')}_${index}_${innerIndex}`
          };
        });
      }
      return {
        ...column,
        children,
        align: 'center',
        title: columnField ? renderer(name, columnField, StatType.None) : name,
        getCellProps: (value) => ({ rowSpan: 1 }),
      };
    }));
  };
};

// Add serial number
export const serialNumberHandler = () => {
  return (pipeline: TablePipeline) => {
    return pipeline.mapColumns((cols) => [
      {
        name: t(Strings.serial_number),
        lock: true,
        width: 60,
        align: 'center',
        getValue: (row, rowIndex) => rowIndex + 1,
      },
      ...cols
    ]);
  };
};