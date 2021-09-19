import { VStack } from '@chakra-ui/layout';
import { Select } from '@chakra-ui/select';
import React, { useState } from 'react';
import { Prism as Code } from 'react-syntax-highlighter';
import theme from 'react-syntax-highlighter/dist/cjs/styles/prism/atom-dark';

export default function Paste({ content, ext, style = null, ...other }) {
  const languages = {
    'None': 'text',
    'HTML': 'html',
    'XML': 'xml',
    'C#': 'cs',
    'CSS': 'css',
    'JavaScript': 'js',
    'JavaScript React': 'jsx',
    'Arduino': 'arduino',
    'ASP.NET': 'aspnet',
    'AutoIt': 'autoit',
    'Bash': 'bash',
    'Batch': 'batch',
    'C': 'c',
    'C++': 'cpp',
    'Clojure': 'clojure',
    'cmake': 'cmake',
    'D': 'd',
    'Dart': 'dart',
    'Diff': 'diff',
    'EJS': 'ejs',
    'F#': 'fsharp',
    'Git': 'git',
    'Go': 'go',
    'Haskell': 'hs',
    'Http': 'http',
    'INI': 'ini',
    'Java': 'java',
    'JSON': 'json',
    'Kotlin': 'kt',
    'Less': 'less',
    'Lua': 'lua',
    'Makefile': 'makefile',
    'Markdown': 'md',
    'Objective C': 'objc',
    'Pascal': 'pascal',
    'Perl': 'perl',
    'PHP': 'php',
    'Powershell': 'powershell',
    'Pug': 'pug',
    'Q#': 'qs',
    'QML': 'qml',
    'Python': 'py',
    'R': 'r',
    'Razor C#': 'cshtml',
    'Ruby': 'rb',
    'Solution': 'sln',
    'SQL': 'sql',
    'TOML': 'toml',
    'TypeScript': 'ts',
    'TypeScript React': 'tsx',
    'V': 'v',
    'VB.NET': 'vbnet',
    'Vim': 'vim',
    'Visual Basic': 'vb',
    'WebAssembly': 'wasm',
    'YAML': 'yml'
  };
  const lang = languages[Object.keys(languages).find(key => languages[key] === ext)] || 'text';
  const [selectedLanguage, setSelectedLanguage] = useState(lang);
  return (
    <VStack>
      <Select size='sm' value={selectedLanguage} onChange={selection => setSelectedLanguage(selection.target.value)}>
        {Object.entries(languages).map(([key, value]) => (
          <option key={key} value={value}>{key}</option>
        ))}
      </Select>
      <Code language={selectedLanguage} customStyle={style} style={theme} showLineNumbers showInlineLineNumbers {...other}>{content}</Code>
    </VStack>
  );
}