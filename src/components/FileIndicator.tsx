import {isType} from 'lib/mime';
import {FiFile, FiFileText, FiImage, FiMusic, FiVideo} from 'react-icons/fi';

export default function FileIndicator({ mimetype, ...props }) {
  return isType('audio', mimetype) ? <FiMusic {...props}/>
    : isType('video', mimetype) ? <FiVideo {...props}/>
      : isType('image', mimetype) ? <FiImage {...props}/>
        : isType('text', mimetype) ? <FiFileText {...props}/>
          : <FiFile {...props}/>;
}
