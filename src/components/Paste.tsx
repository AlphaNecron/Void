import { Select, VStack } from '@chakra-ui/react';
import languages from 'lib/languages';
import React, { useState } from 'react';
import { Prism as Code } from 'react-syntax-highlighter';
import theme from 'react-syntax-highlighter/dist/cjs/styles/prism/coldark-dark';

export default function Paste({ content, ext, style = null, language, ...other }) {
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  return (
    <VStack {...other}>
      <Select size='sm' value={selectedLanguage} onChange={selection => setSelectedLanguage(selection.target.value)}>
        {Object.entries(languages).map(([key, value]) => (
          <option key={key} value={value}>{key}</option>
        ))}
      </Select>
      <Code language={selectedLanguage} style={theme} showLineNumbers customStyle={{ maxWidth: '80vw', maxHeight: '65vh', fontSize: 13 }}>{content}</Code>
    </VStack>
  );
}