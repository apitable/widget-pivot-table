import styled, { css } from 'styled-components';

// TODO：Backward compatible stretchable
export const FormWrapper = styled.div<{ openSetting: boolean, readOnly: boolean }>`
  box-shadow: -1px 0px 0px rgba(0, 0, 0, 0.1), 0px -1px 0px #F0F0F6;
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