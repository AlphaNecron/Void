import {FiVolume, FiVolume1, FiVolume2, FiVolumeX} from 'react-icons/fi';

export default function VolumeIndicator({level = 0, ...props}) {
  return level >= 75 ? <FiVolume2 {...props}/> : level >= 35 ? <FiVolume1 {...props}/> : level > 0 ? <FiVolume {...props}/> : <FiVolumeX {...props}/>;
}
