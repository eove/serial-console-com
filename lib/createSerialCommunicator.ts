import * as _ from 'lodash';
import { Observable } from 'rxjs';

import { createCommandRunner } from './createCommandRunner';
import { createTransport } from './createTransport';
import { makeParseConsoleOutput } from './makeParseConsoleOutput';
import {
  parseErrorCode,
  SAFE_PATTERN_END,
  SAFE_PATTERN_START,
} from './parseErrorCode';

export interface SerialCommunicator {
  connect: (portName: string) => Promise<void>;
  disconnect: () => Promise<void>;
  executeCmd: (
    cmd: string,
    cmdOptions?: CommandOptions
  ) => Promise<CommandResult>;
  setPin: (pinName: string, state: boolean) => Promise<void>;
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
  validateWithErrorCode?: boolean;
}

export interface CommandResult {
  output: string[];
  errorCode: number;
  detail?: string;
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
      debugEnabled: false,
    }
  );
  const transport = createTransport({ baudrate, debugEnabled });
  const runner = createCommandRunner({
    data$: transport.data$,
    transport,
    parseData: makeParseConsoleOutput({ prompt, lineSeparator }),
    debugEnabled,
  });
  return {
    connect,
    disconnect,
    executeCmd,
    setPin,
    get connected() {
      return transport.connected;
    },
    get answer$() {
      return runner.answer$;
    },
    get data$() {
      return transport.data$;
    },
  };

  function connect(portName: string): Promise<void> {
    return transport.connect(portName);
  }

  function disconnect(): Promise<void> {
    return transport.disconnect();
  }

  function setPin(pinName: string, state: boolean): Promise<void> {
    return transport.ioctl({ [pinName]: state });
  }

  async function executeCmd(
    cmd: string,
    cmdOptions?: CommandOptions
  ): Promise<CommandResult> {
    const { timeout, waitAnswer, validateWithErrorCode } = _.defaults(
      {},
      cmdOptions,
      {
        timeout: 3000,
        waitAnswer: true,
        validateErrorCode: true,
      }
    );
    if (!waitAnswer) {
      return await execute();
    }

    return validateWithErrorCode
      ? await executeAndWaitAnswerWithErrorCode()
      : await executeAndWaitAnswerWithoutErrorCode();

    async function executeAndWaitAnswerWithErrorCode() {
      const cmdOutput = await runner.runCommand({
        cmdLine: `${cmd}${lineSeparator}`,
        answerTimeoutMS: timeout,
      });
      const errCodeCmdOutput = (
        await runner.runCommand({
          cmdLine: `echo ${SAFE_PATTERN_START}$?${SAFE_PATTERN_END}${lineSeparator}`,
          answerTimeoutMS: 2000,
        })
      ).join();
      return {
        output: cmdOutput,
        errorCode: parseErrorCode(errCodeCmdOutput),
        detail: `error code command output: ${errCodeCmdOutput}`,
      };
    }

    async function executeAndWaitAnswerWithoutErrorCode() {
      const cmdOutput = await runner.runCommand({
        cmdLine: `${cmd}${lineSeparator}`,
        answerTimeoutMS: timeout,
      });
      return {
        output: cmdOutput,
        errorCode: 0,
      };
    }
    async function execute() {
      await runner.runCommand({
        cmdLine: `${cmd}${lineSeparator}`,
        answerTimeoutMS: timeout,
        answerExpected: false,
      });
      return {
        output: [],
        errorCode: 0,
      };
    }
  }
}
