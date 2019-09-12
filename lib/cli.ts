import * as program from 'commander';

import { createSerialCommunicator } from './createSerialCommunicator';

program
  .command('com')
  .description('list avaiable ports')
  .option(
    '-p, --port-name [PORT_NAME]',
    'PORT_NAME is the serial port to communicate with',
    '/dev/ttyUSB0'
  )
  .action(options => {
    const communicator = createSerialCommunicator();
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
