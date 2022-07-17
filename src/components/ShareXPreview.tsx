import { Prism } from '@mantine/prism';
import {FiDownload, FiScissors} from 'react-icons/fi';

export default function ShareXPreview({ uploaderConfig, shortenerConfig }) {
  return (
    <Prism.Tabs>
      <Prism.Tab withLineNumbers icon={<FiDownload/>} language='json' noCopy label='Void_Uploader.sxcu'>
        {JSON.stringify({...uploaderConfig, Headers: { ...uploaderConfig.Headers, Authorization: '<MASKED>' }}, null, '\t')}
      </Prism.Tab>
      <Prism.Tab withLineNumbers icon={<FiScissors/>} language='json' noCopy label='Void_Shortener.sxcu'>
        {JSON.stringify({...shortenerConfig, Headers: { ...shortenerConfig.Headers, Authorization: '<MASKED>'}}, null, '\t')}
      </Prism.Tab>
    </Prism.Tabs>
  );
}
