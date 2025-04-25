#!/usr/bin/env node
import debugLib from 'debug';
import { program } from 'commander';

import { createSerialCommunicator } from './lib';
import { createTransport } from './lib/createTransport';

const delayMS = (ms: number) =>
  new Promise((res) => setTimeout(res, ms)) as Promise<void>;

program
  .command('run <command>')
  .description(
    'run the given <command> through the serial line and returns result'
  )
  .option(
    '-p, --port-name [PORT_NAME]',
    'PORT_NAME is the serial port to communicate with',
    '/dev/ttyUSB0'
  )
  .option(
    '-b, --baudrate [BAUD_RATE]',
    'BAUD_RATE is the serial baud rate',
    '115200'
  )
  .option(
    '-d, --debug-enabled',
    'when set, outputs debug message to the console'
  )
  .option('--prompt [PROMPT]', 'PROMPT is the serial console prompt', '/ #')
  .option(
    '-t, --timeout [TIMEOUT]',
    'TIMEOUT in ms to be used for lon grun commands such as "du -h ."',
    '3000'
  )
  .option('--dont-wait-answer', 'execute command and do not wait answer')
  .option(
    '-l, --line-separator [LINE_SEPARATOR]',
    'LINE_SEPARATOR is the serial console line separator',
    '\n'
  )
  .action((command, options) => {
    const debug = Object.assign(debugLib('cli'), {
      enabled: options.debugEnabled,
    });
    const communicator = createSerialCommunicator({
      debugEnabled: options.debugEnabled,
      baudrate: Number(options.baudrate),
      prompt: options.prompt,
      lineSeparator: options.lineSeparator,
    });
    communicator
      .connect(options.portName)
      .then(() =>
        communicator.executeCmd(command, {
          timeout: Number(options.timeout),
          waitAnswer: !options.dontWaitAnswer,
        })
      )
      .then((result) => {
        const { output, errorCode } = result;
        console.log(output.join(options.lineSeparator));
        debug(`ran command: '${command}'`);
        debug(`error code: ${errorCode}`);
        process.exit(errorCode);
      })
      .catch((e) => {
        console.error(e);
        process.exit(1);
      });
  });

program
  .command('write-bytes <bytes>')
  .description('write the given bytes to serial line')
  .option(
    '-p, --port-name [PORT_NAME]',
    'PORT_NAME is the serial port to communicate with',
    '/dev/ttyUSB0'
  )
  .option(
    '-b, --baudrate [BAUD_RATE]',
    'BAUD_RATE is the serial baud rate',
    '115200'
  )
  .option(
    '--delay-between-bytes-ms [DELAY_BETWEEN_BYTES_MS]',
    'DELAY_BETWEEN_BYTES_MS is the delay between bytes in milliseconds',
    '0'
  )
  .option(
    '-d, --debug-enabled',
    'when set, outputs debug message to the console'
  )
  .option('--append-line-feed', 'when set, append line feed to sent bytes')
  .action(async (bytes: string, options) => {
    const {
      debugEnabled,
      portName,
      baudrate,
      delayBetweenBytesMs,
      appendLineFeed,
    } = options;
    const interBytesDelayMs = Number(delayBetweenBytesMs);
    const debug = debugLib('cli');
    debug.enabled = debugEnabled;
    const serial = createTransport({
      debugEnabled,
      baudrate: Number(baudrate),
    });
    const received: string[] = [];
    serial.data$.subscribe((d: string) => received.push(d));
    await serial.connect(portName);

    if (interBytesDelayMs) {
      debug(`writing ${bytes.length} bytes, one every ${interBytesDelayMs} ms`);
      for (const b of bytes.split('')) {
        await serial.write(b);
        await delayMS(interBytesDelayMs);
      }
    } else {
      debug(`writing ${bytes.length} bytes in a raw`);
      await serial.write(bytes);
    }
    if (appendLineFeed) {
      await serial.write('\n');
    }
    await delayMS(1000);
    console.log('received:', received.join());
    process.exit(0);
  });

program.parse(process.argv);
