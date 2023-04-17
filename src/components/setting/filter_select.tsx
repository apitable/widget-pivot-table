import { LinkButton, useThemeColors, Modal, Button } from "@apitable/components"
import { AddOutlined, FilterOutlined } from "@apitable/icons"
import { Filter, t } from "@apitable/widget-sdk"
import styled from 'styled-components';
import { Strings } from '../../utils';

import React, { useEffect, useRef, useState } from "react"

interface IFilterSelect {
  value: any;
  onChange?: (filter: any) => void;
}

export const AddFilterButton = styled(LinkButton)`
  :hover {
    color: var(--textBrandHover);
    svg {
      fill: var(--textBrandHover);
    }
  }

  :active {
    color: var(--textBrandActive);
    svg {
      fill: var(--textBrandActive);
    }
  }
`;

const FilterModal = ({ value, visible, onCancel, onConfirm }) => {
  const [filter, setFilter] = useState(value);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      setFilter(value);
    } else {
      setFilter(null);
    }
  }, [visible, value]);

  const onChange = (value) => {
    const curLength = value ? (Object.values(value)[0] as [])?.length : 0;
    const prevLength = filter ? (Object.values(filter)[0] as [])?.length : 0;
    const isAddFilter = curLength > prevLength;
    setFilter(value);
    isAddFilter && setTimeout(() => {
      if (!listRef.current) return;
      listRef.current.scroll({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    });
  };

  return (
    <Modal
      title={t(Strings.filter_modal_title)}
      visible={visible}
      onCancel={onCancel}
      onOk={() => onConfirm(filter)}
      cancelText={t(Strings.cancel)}
      okText={t(Strings.confirm)}
      width={800}
      centered
    >
      <div ref={listRef} style={{ maxHeight: 440, overflowY: 'auto' }}>
        <Filter 
          filter={filter} 
          onChange={onChange}
        />
      </div>
    </Modal>
  )
};

export const FilterSelect = ({ value, onChange }: IFilterSelect) => {
  const colors = useThemeColors();
  const [showModal, setShowModal] = useState<boolean>();

  const onConfirm = (filter) => {
    onChange?.(filter);
    setShowModal(false);
  }

  const filterLen = value ? value[Object.keys(value)[0]]?.length : 0;

  return (
    <div>
      {
        filterLen ?
          <Button
            size={'small'}
            variant="jelly"
            color="primary"
            prefixIcon={<FilterOutlined />}
            onClick={() => setShowModal(true)}
            style={{ fontSize: 13 }}
          >
            {filterLen}{t(Strings.filters_amount)}
          </Button> :
          <AddFilterButton
            href="javascript:void(0)"
            color={colors.textCommonPrimary}
            underline={false}
            prefixIcon={<AddOutlined color={colors.textCommonPrimary} size={12} />}
            onClick={() => setShowModal(true)}
          >
            <span style={{ fontSize: 12 }}>
              {t(Strings.add_filter)}
            </span>
          </AddFilterButton>
      }
      <FilterModal
        visible={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={onConfirm}
        value={value}
      />
    </div>
  )
};