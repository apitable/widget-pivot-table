import React from 'react';
import { useThemeColors } from '@apitable/components';
import { CellLink as CellLinkComponent } from '@apitable/widget-sdk';

export const CellLink = (props) => {
  const { cellValue } = props;
  const colors = useThemeColors();

  return (
    <CellLinkComponent 
      options={cellValue} 
      style={{ 
        width: '100%',
        fontWeight: 'normal',
        justifyContent: 'center'
      }} 
      cellStyle={{
        display: 'block',
        background: colors.defaultTag
      }}
    />
  );
}