import {VoidRequest, VoidResponse, withVoid} from 'lib/middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {

}

export default withVoid(handler);
