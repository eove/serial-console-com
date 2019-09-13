import * as debugLib from 'debug';
import * as _ from 'lodash';
import { createQueue } from '@arpinum/promising';
import { Observable, Subject, throwError } from 'rxjs';
import {
  catchError,
  filter,
  first,
  map,
  publish,
  refCount,
  scan,
  timeout
} from 'rxjs/operators';

import {
  ParseConsoleOutputFunction,
  ParseConsoleOutputResult,
  Transport
} from './types';

interface Command {
  cmdLine: string;
  answerTimeoutMS?: number;
}

interface CommandRunner {
  runCommand: (cmd: Command) => Promise<string[]>;
  answer$: Observable<any>;
  command$: Observable<unknown>;
}

interface CommandRunnerDependencies {
  parseData: ParseConsoleOutputFunction;
  transport: Transport;
  data$: Observable<any>;
  debugEnabled?: boolean;
}

export function createCommandRunner(
  dependencies: CommandRunnerDependencies
): CommandRunner {
  const { data$, transport, parseData, debugEnabled } = _.defaults(
    {},
    dependencies,
    { debugEnabled: false }
  );
  const debug = Object.assign(debugLib('command-runner'), {
    enabled: debugEnabled
  });

  const commandQueue = createQueue({ concurrency: 1 });
  const commandSource = new Subject();

  const answer$ = data$.pipe(
    scan(
      (acc: ParseConsoleOutputResult, byte: any) => {
        const { remaining: remainingBytes } = acc;
        const received = remainingBytes.concat(...byte);
        const { remaining, lines } = parseData(received);
        return { remaining, lines };
      },
      {
        remaining: '',
        lines: []
      }
    ),
    filter((result: ParseConsoleOutputResult) => result.lines.length !== 0),
    map((result: ParseConsoleOutputResult) => result.lines)
  );

  return {
    runCommand,
    answer$,
    get command$() {
      return commandSource.asObservable();
    }
  };

  function runCommand(cmd: Command) {
    const { cmdLine, answerTimeoutMS = 3000 } = cmd;
    debug(`running command: ${cmdLine}`);
    return commandQueue.enqueue(() => {
      commandSource.next(cmd);
      const answer = waitAnswer();
      return transport
        .write(cmdLine)
        .then(() => answer)
        .then(cleanupLines);
    });

    function waitAnswer() {
      return commandAnswer$()
        .pipe(
          timeout(answerTimeoutMS),
          catchError(error => throwError(error))
        )
        .toPromise();

      function commandAnswer$() {
        return answer$.pipe(
          publish(),
          refCount(),
          first()
        );
      }
    }

    function cleanupLines(lines: string[]) {
      return lines.filter(l => !l.includes(cmdLine.trim()));
    }
  }
}
