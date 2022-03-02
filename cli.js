#!/usr/bin/env node
const debugLib = require('debug');
const program = require('commander');

const { createSerialCommunicator } = require('./build');

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
    115200
  )
  .option(
    '-d, --debug-enabled',
    'when set, outputs debug message to the console'
  )
  .option('--prompt [PROMPT]', 'PROMPT is the serial console prompt', '/ #')
  .option(
    '-t, --timeout [TIMEOUT]',
    'TIMEOUT in ms to be used for lon grun commands such as "du -h ."',
    3000
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
      baudrate: options.baudrate,
      prompt: options.prompt,
      lineSeparator: options.lineSeparator,
    });
    communicator
      .connect(options.portName)
      .then(() =>
        communicator.executeCmd(command, {
          timeout: options.timeout,
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

program.parse(process.argv);
