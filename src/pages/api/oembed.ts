import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const {author, authorUrl, siteName, siteNameUrl} = req.query;
  return res.json({
    type: 'link',
    version: '1.0',
    author_name: author,
    author_url: authorUrl,
    provider_name: siteName,
    provider_url: siteNameUrl
  });
}
