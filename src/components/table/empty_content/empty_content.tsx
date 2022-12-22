import React, { memo } from 'react';
import { useThemeColors } from '@apitable/components';

interface EmptyContentProps {
  content: string;
}

export function defaultEmptyContent(props: EmptyContentProps) {
  const { content } = props;
  const colors = useThemeColors();
  return memo(() => {
    return (
      <>
        <img 
          alt="empty-image" 
          src="https://legacy-s1.apitable.com/space/2022/12/22/0357ee4370a24c4fa5987826ba52e11f?attname=image.png"
          style={{
            width: 160,
            height: 120
          }}
        />
        <div 
          style={{
            minWidth: 210,
            marginTop: 8,
            lineHeight: 1.5,
            color: colors.firstLevelText
          }}
        >
          {content}
        </div>
      </>
    );
  });
}