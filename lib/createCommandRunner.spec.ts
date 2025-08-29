import { CommandRunner, createCommandRunner } from './createCommandRunner';
import { makeParseConsoleOutput } from './makeParseConsoleOutput';
import { createTransportMock } from './test';
import { from, Subject } from 'rxjs';

describe('command runner', () => {
  let runner: CommandRunner;
  let subject: Subject<Buffer>;

  beforeEach(() => {
    subject = new Subject();
  });

  it('should return single line response', async () => {
    runner = createCommandRunner({
      transport: createTransportMock(),
      parseData: makeParseConsoleOutput({
        prompt: '/ #',
        lineSeparator: '\n',
      }),
      data$: from(subject),
    });
    setTimeout(() => {
      emitReceivedData('\nresponse\n/ #');
    }, 10);
    const answer = await runner.runCommand({ cmdLine: 'my cmd' });

    expect(answer).toEqual(['response']);
  });

  it('should return multi line response', async () => {
    runner = createCommandRunner({
      transport: createTransportMock(),
      parseData: makeParseConsoleOutput({
        prompt: '/ #',
        lineSeparator: '\n',
      }),
      data$: from(subject),
    });
    setTimeout(() => {
      emitReceivedData('\nresponse 1\nresponse 2\n/ #');
    }, 10);
    const answer = await runner.runCommand({ cmdLine: 'my cmd' });

    expect(answer).toEqual(['response 1', 'response 2']);
  });

  it('should return empty line response', async () => {
    runner = createCommandRunner({
      transport: createTransportMock(),
      parseData: makeParseConsoleOutput({
        prompt: '/ #',
        lineSeparator: '\n',
      }),
      data$: from(subject),
    });
    setTimeout(() => {
      emitReceivedData('\n/ #');
    }, 10);
    const answer = await runner.runCommand({ cmdLine: 'my cmd' });

    expect(answer).toEqual([]);
  });

  function emitReceivedData(data: string) {
    for (let i = 0; i < Buffer.from(data).length; i++) {
      subject.next(Buffer.from(data[i]));
    }
  }
});
