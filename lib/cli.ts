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
    // communicator.answer$.subscribe(a => console.log('answer: ', a));
    communicator
      .connect(options.portName)
      .then(() => communicator.executeCmd('ls -al'))
      .then(console.log)
      .catch(e => console.error(e));
  });

program.parse(process.argv);
