import { Observable } from 'rxjs';
import * as _ from 'lodash';

import { createCommandRunner } from './createCommandRunner';
import { createTransport } from './createTransport';
import { makeParseConsoleOutput } from './makeParseConsoleOutput';

export interface SerialCommunicator {
  connect: (portName: string) => Promise<void>;
  disconnect: () => Promise<void>;
  executeCmd: (cmd: string) => Promise<any>;
  connected: boolean;
  answer$: Observable<any>;
  data$: Observable<any>;
}

export interface CommunicatorCreationOptions {
  baudrate?: number;
  prompt?: string;
  lineSeparator?: string;
}

export function createSerialCommunicator(
  options?: CommunicatorCreationOptions
): SerialCommunicator {
  const { baudrate, prompt, lineSeparator } = _.defaults({}, options, {
    baudrate: 115200,
    prompt: '/ #',
    lineSeparator: '\n'
  });
  const transport = createTransport({ baudrate });
  const runner = createCommandRunner({
    data$: transport.data$,
    transport,
    parseData: makeParseConsoleOutput({ prompt, lineSeparator })
  });
  return {
    connect,
    disconnect,
    executeCmd,
    get connected() {
      return transport.connected;
    },
    get answer$() {
      return runner.answer$;
    },
    get data$() {
      return transport.data$;
    }
  };

  function connect(portName: string): Promise<void> {
    return transport.connect(portName);
  }

  function disconnect(): Promise<void> {
    return transport.disconnect();
  }

  function executeCmd(cmd: string): Promise<any> {
    return runner.runCommand({ cmdLine: `${cmd}${lineSeparator}` });
  }
}
