import * as program from 'commander';

import { createSerialCommunicator } from './createSerialCommunicator';

program
  .command('com')
  .description('communicates with  avaiable ports')
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
  .option('--prompt [PROMPT]', 'PROMPT is the serial console prompt', '/ #')
  .option(
    '-l, --line-separator [LINE_SEPARATOR]',
    'LINE_SEPARATOR is the serial console line separator',
    '\n'
  )
  .action(options => {
    const communicator = createSerialCommunicator({
      baudrate: options.baudrate,
      prompt: options.prompt,
      lineSeparator: options.lineSeparator
    });
    communicator
      .connect(options.portName)
      .then(() => communicator.executeCmd('ls -al'))
      .then(lines => {
        console.log(lines.join('\n'));
        process.exit(0);
      })
      .catch(e => {
        console.error(e);
        process.exit(1);
      });
  });

program.parse(process.argv);
