import React, { memo } from 'react';
import { useThemeColors } from '@apitable/components';
import Settings from '../../../../settings.json';

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
          src={Settings.pivot_empty_image_url}
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