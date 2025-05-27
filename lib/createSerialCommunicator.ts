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
  enterChar?: string;
  debugEnabled?: boolean;
}

export interface CommandOptions {
  timeout?: number;
  waitAnswer?: boolean;
  validateWithErrorCode?: boolean;
  validateErrorCodeWithSafePattern?: boolean;
}

export interface CommandResult {
  output: string[];
  errorCode: number;
  detail?: string;
}

export function createSerialCommunicator(
  options?: CommunicatorCreationOptions
): SerialCommunicator {
  const { baudrate, prompt, lineSeparator, debugEnabled, enterChar } =
    _.defaults({}, options, {
      baudrate: 115200,
      prompt: '/ #',
      lineSeparator: '\n',
      enterChar: '\r',
      debugEnabled: false,
    });
  const transport = createTransport({ baudRate: baudrate, debugEnabled });
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
    const {
      timeout,
      waitAnswer,
      validateWithErrorCode,
      validateErrorCodeWithSafePattern,
    } = _.defaults({}, cmdOptions, {
      timeout: 3000,
      waitAnswer: true,
      validateWithErrorCode: true,
      validateErrorCodeWithSafePattern: true,
    });
    if (!waitAnswer) {
      return await execute();
    }

    return validateWithErrorCode
      ? await executeAndWaitAnswerWithErrorCode()
      : await executeAndWaitAnswerWithoutErrorCode();

    async function executeAndWaitAnswerWithErrorCode() {
      const cmdOutput = await runner.runCommand({
        cmdLine: `${cmd}${enterChar}`,
        answerTimeoutMS: timeout,
      });
      const errorCodeCommand = validateErrorCodeWithSafePattern
        ? `echo ${SAFE_PATTERN_START}$?${SAFE_PATTERN_END}${enterChar}`
        : `echo $?${enterChar}`;
      const errCodeCmdOutput = (
        await runner.runCommand({
          cmdLine: errorCodeCommand,
          answerTimeoutMS: 2000,
        })
      ).join();
      return {
        output: cmdOutput,
        errorCode: validateErrorCodeWithSafePattern
          ? parseErrorCode(errCodeCmdOutput)
          : Number(errCodeCmdOutput),
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
        cmdLine: `${cmd}${enterChar}`,
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
