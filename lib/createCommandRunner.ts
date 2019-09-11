import { createQueue } from '@arpinum/promising';
import { from, Observable, Subject, throwError } from 'rxjs';
import {
  catchError,
  filter,
  first,
  map,
  mergeMap,
  publish,
  refCount,
  scan,
  timeout
} from 'rxjs/operators';

import { Transport } from './createTransport';

interface Command {
  cmdLine: string;
  answerTimeoutMS?: number;
}

interface CommandRunner {
  runCommand: (cmd: Command) => Promise<{}>;
  answer$: Observable<any>;
  command$: Observable<unknown>;
}

interface CommandRunnerDependencies {
  debug: any;
  transport: Transport;
  data$: Observable<any>;
}

export function createCommandRunner(
  dependencies: CommandRunnerDependencies
): CommandRunner {
  const { data$, transport, debug } = dependencies;
  const commandQueue = createQueue({ concurrency: 1 });
  const commandSource = new Subject();

  const answer$ = data$.pipe(
    scan(
      (acc: FindAnswersResult, byte: any) => {
        const { remaining: remainingBytes } = acc;
        const received = remainingBytes.concat(...byte);
        const { remaining, answers } = driver.findAnswers(received);
        return { remaining, answers };
      },
      {
        remaining: '',
        answers: []
      }
    ),
    filter((result: FindAnswersResult) => result.answers.length !== 0),
    map((result: FindAnswersResult) => result.answers),
    mergeMap((x: any[]) => from(x))
  );

  return {
    runCommand,
    answer$,
    get command$() {
      return commandSource.asObservable();
    }
  };

  function runCommand(cmd: Command) {
    const { cmdLine, answerTimeoutMS } = cmd;
    return commandQueue.enqueue(() => {
      commandSource.next(cmd);
      const answer = waitAnswer(cmd);
      return transport.write(cmdLine).then(() => answer);
    });

    function waitAnswer(currentCmd: Command) {
      return currentCmd.isAnswerExpected
        ? commandAnswer$()
            .pipe(
              timeout(answerTimeoutMS),
              catchError(error => throwError(error))
            )
            .toPromise()
        : Promise.resolve();

      function commandAnswer$() {
        return answer$.pipe(
          publish(),
          refCount(),
          first()
        );
      }
    }
  }
}
