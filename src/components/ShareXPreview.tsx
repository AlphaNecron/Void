import {Prism} from '@mantine/prism';
import {FiScissors, FiUpload} from 'react-icons/fi';

export default function ShareXPreview({name, uploaderConfig, shortenerConfig, ...props}) {
  const indentChar = '  '; // use \t for a tab if you want.
  return (
    <Prism.Tabs style={{flex: 1}} {...props} defaultValue='uploader'>
      <Prism.TabsList grow>
        <Prism.Tab icon={<FiUpload />} value='uploader'>
          {`${name || 'Void'}_Uploader.sxcu`}
        </Prism.Tab>
        <Prism.Tab icon={<FiScissors />} value='shortener'>
          {`${name || 'Void'}_Shortener.sxcu`}
        </Prism.Tab>
      </Prism.TabsList>
      <Prism.Panel withLineNumbers language='json' noCopy value='uploader'>
        {JSON.stringify({
          ...uploaderConfig,
          Headers: {...uploaderConfig.Headers, Authorization: '<MASKED>'}
        }, null, indentChar)}
      </Prism.Panel>
      <Prism.Panel withLineNumbers language='json' noCopy value='shortener'>
        {JSON.stringify({
          ...shortenerConfig,
          Headers: {...shortenerConfig.Headers, Authorization: '<MASKED>'}
        }, null, indentChar)}
      </Prism.Panel>
    </Prism.Tabs>
  );
}
