import React, { useMemo, FC } from 'react';
import { Form } from '@apitable/components';
import { 
  useCloudStorage, useFields, useSettingsButton, useViewsMeta, initializeWidget, t, useMeta, RuntimeEnv
} from '@apitable/widget-sdk';
import { PivotTable } from './components';
import { FormWrapper } from './components/setting/styled';
import { FormSchema, useGetDefaultFormData, IFormDataProps, getUiSchema } from './model';
import { Strings } from './utils';

const Main: FC = () => {
  const views = useViewsMeta();
  const { runtimeEnv } = useMeta();
  const [isSettingOpened] = useSettingsButton();
  const defaultFormData = useGetDefaultFormData();
  const [formData, setFormData, editable] = useCloudStorage('FormData', defaultFormData);
  const { configuration } = formData;
  const { viewId } = configuration;
  const fields = useFields(viewId);
  const filteredViews = views.map(({ id, name }) => ({ id, name }));

  const schema: any = useMemo(() => {
    return new FormSchema(formData, filteredViews, fields).getSchema();
  }, [formData, filteredViews, fields]);

  const onFormChange = (data: any) => {
    setFormData(data.formData);
  };

  const validate = (formData: IFormDataProps, errors) => {
    if (filteredViews.findIndex(view => view.id === formData.configuration.viewId) === -1) {
      errors.configuration.viewId.addError(t(Strings.pivot_option_view_had_been_deleted));
    }
    return errors;
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden', padding: 16 }}>
        <div style={{ flexGrow: 1, overflow: 'auto' }}>
          <PivotTable formData={formData} />
        </div>
      </div>
      <FormWrapper openSetting={runtimeEnv == RuntimeEnv.Desktop && isSettingOpened} readOnly={!editable}>
        <Form
          formData={formData}
          uiSchema={getUiSchema(viewId)}
          schema={schema}
          onChange={onFormChange}
          validate={validate}
          liveValidate
          children={<></>}
        />
      </FormWrapper>
    </div>
  );
};

initializeWidget(Main, process.env.WIDGET_PACKAGE_ID);