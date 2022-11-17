import { isAdmin, Permission } from 'lib/permission';
import { VoidRequest, VoidResponse, withVoid } from 'middleware/withVoid';
import sysInfo from 'systeminformation';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser();
  if (!user || !isAdmin(user.role.permissions)) return res.noPermission(Permission.ADMINISTRATION);
  const time = sysInfo.time();
  const bios = await sysInfo.bios();
  const system = await sysInfo.system();
  const cpu = await sysInfo.cpu();
  const memory = await sysInfo.mem();
  const os = await sysInfo.osInfo();
  const disks = await sysInfo.blockDevices();
  const docker = await sysInfo.dockerAll();
  return res.json({
    time,
    bios,
    system,
    cpu,
    memory,
    os,
    disks,
    docker
  });
}

export default withVoid(handler);
