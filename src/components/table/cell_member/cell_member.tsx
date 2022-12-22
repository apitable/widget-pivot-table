import React from 'react';
import { useThemeColors } from '@apitable/components';
import { CellMember as CellMemberComponent } from '@apitable/widget-sdk';

export const CellMember = (props) => {
  const { cellValue } = props;
  const colors = useThemeColors();
  console.log('colors', colors)

  return (
    <CellMemberComponent 
      members={cellValue} 
      style={{ 
        justifyContent: 'center', 
        flexWrap: 'wrap', 
        fontWeight: 'normal',
      }} 
      cellStyle={{
        maxWidth: '100%',
        backgroundColor: colors.bgTagDefault
      }}
    />
  );
}