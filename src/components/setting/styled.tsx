import styled, { css } from 'styled-components';

// TODO：Backward compatible stretchable
export const FormWrapper = styled.div<{ openSetting: boolean, readOnly: boolean }>`
  border-left: 1px solid var(--borderCommonDefault);
  width: 320px;
  flex-shrink: 0;
  height: 100%;
  padding: 1rem;
  overflow-y: auto;
  display: ${(props) => props.openSetting ? 'block' : 'none'};
  ${(props) => {
    if (props.readOnly) {
      return css`
        pointer-events: none;
        opacity: 0.5;
      `;
    }
    return;
  }}
`;