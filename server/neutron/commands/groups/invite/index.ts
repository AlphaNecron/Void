import {NeutronCommandGroup} from 'neutron/types';
import wave from 'neutron/commands/groups/invite/wave';

export default class extends NeutronCommandGroup {
  name = 'invite';
  commands = [
    wave
  ];
}
