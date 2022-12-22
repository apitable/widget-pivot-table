import React from 'react';
import cx from 'classnames';
import styled, { css } from 'styled-components';
import { BaseTable, BaseTableProps } from 'ali-react-table';
import { useThemeColors, ThemeName, deepPurple } from '@apitable/components';
import { useMeta } from '@apitable/widget-sdk';

const ThemeBaseTable: any = styled(BaseTable)`
  &.apiTable {
    ${props => {
      const { headerColor, borderColor, fontColor, bgColor, hoverBgColor } = props.colorConfig;
      return css`
        --border-color: ${borderColor};
        --header-bgcolor: ${headerColor};
        --header-color: ${fontColor};
        --color: ${fontColor};
        --bgcolor: ${bgColor};
        --header-hover-bgcolor: ${hoverBgColor};
        --hover-bgcolor: ${hoverBgColor};
      `;
    }}
    --font-size: 13px;
    cursor: auto;
  }
  .art-table-header-cell {
    font-weight: bold;
  }
`;

export const CustomBaseTable = React.forwardRef<BaseTable, BaseTableProps>((props, ref) => {
  const meta = useMeta();
  const colors = useThemeColors();
  const themeName = meta.theme;

  return (
    <ThemeBaseTable 
      ref={ref} 
      className={cx({ apiTable: true })} 
      colorConfig={{
        headerColor: colors.lowestBg,
        borderColor: colors.lineColor,
        fontColor: colors.firstLevelText,
        bgColor: colors.defaultBg,
        hoverBgColor: themeName === ThemeName.Dark ? '#393649' : deepPurple[50]
      }}
      {...props} 
    />
  );
});