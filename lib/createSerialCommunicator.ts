import * as _ from 'lodash';
import { Observable } from 'rxjs';

import { createCommandRunner } from './createCommandRunner';
import { createTransport } from './createTransport';
import { makeParseConsoleOutput } from './makeParseConsoleOutput';

const SAFE_PATTERN = 'THIS IS MY RETURN CODE';

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
  debugEnabled?: boolean;
}

export interface CommandOptions {
  timeout?: number;
  waitAnswer?: boolean;
}

export function createSerialCommunicator(
  options?: CommunicatorCreationOptions
): SerialCommunicator {
  const { baudrate, prompt, lineSeparator, debugEnabled } = _.defaults(
    {},
    options,
    {
      baudrate: 115200,
      prompt: '/ #',
      lineSeparator: '\n',
      debugEnabled: false
    }
  );
  const transport = createTransport({ baudrate, debugEnabled });
  const runner = createCommandRunner({
    data$: transport.data$,
    transport,
    parseData: makeParseConsoleOutput({ prompt, lineSeparator }),
    debugEnabled
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

  async function executeCmd(cmd: string, cmdOptions?: CommandOptions) {
    const { timeout, waitAnswer } = _.defaults({}, cmdOptions, {
      timeout: 3000,
      waitAnswer: true
    });

    return waitAnswer ? await executeAndWaitAnswer() : await execute();

    async function executeAndWaitAnswer() {
      const cmdOutput = await runner.runCommand({
        cmdLine: `${cmd}${lineSeparator}`,
        answerTimeoutMS: timeout
      });
      const errCodeCmdOutput = (await runner.runCommand({
        cmdLine: `echo ${SAFE_PATTERN}: $?${lineSeparator}`,
        answerTimeoutMS: 2000
      })).join();
      return {
        output: cmdOutput,
        errorCode: parseErrorCode(errCodeCmdOutput),
        detail: `error code command output: ${errCodeCmdOutput}`
      };
    }

    async function execute() {
      await runner.runCommand({
        cmdLine: `${cmd}${lineSeparator}`,
        answerTimeoutMS: timeout,
        answerExpected: false
      });
      return {
        output: [],
        errorCode: 0
      };
    }

    function parseErrorCode(output: any) {
      const regex = new RegExp(`${SAFE_PATTERN}: (.*)`, 'sm');
      const found = output.match(regex);
      if (found && found.length) {
        return Number(found[1]);
      }
      return -127;
    }
  }
}
