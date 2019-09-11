import * as _ from 'lodash';

import { createTransport } from './createTransport';

export interface SerialCommunicator {
  connect: (portName: string) => Promise<void>;
  disconnect: () => Promise<void>;
  executeCmd: (cmd: string) => Promise<any>;
  connected: boolean;
}

export interface CommunicatorCreationOptions {
  baudrate?: number;
}

export function createSerialCommunicator(
  portName: string,
  options?: CommunicatorCreationOptions
): SerialCommunicator {
  const { baudrate } = _.defaults({}, options, { baudrate: 115200 });
  const transport = createTransport({ baudrate });
  return {
    connect,
    disconnect,
    executeCmd,
    get connected() {
      return transport.connected;
    }
  };

  async function connect(): Promise<void> {
    return transport.connect(portName);
  }

  async function disconnect(): Promise<void> {
    return transport.disconnect();
  }

  async function executeCmd(cmd: string): Promise<any> {
    
  }
}
