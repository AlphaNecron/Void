import {Server} from 'void';
import internal from 'void/internal';

internal.server = new Server(process.env.NODE_ENV === 'development');

internal.server.init();
