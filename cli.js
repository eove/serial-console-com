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
  .option('--prompt [PROMPT]', 'PROMPT is the serial console prompt', '/ #')
  .option(
    '-l, --line-separator [LINE_SEPARATOR]',
    'LINE_SEPARATOR is the serial console line separator',
    '\n'
  )
  .action((command, options) => {
    const communicator = createSerialCommunicator({
      baudrate: options.baudrate,
      prompt: options.prompt,
      lineSeparator: options.lineSeparator
    });
    communicator
      .connect(options.portName)
      .then(() => communicator.executeCmd(command))
      .then(result => {
        const { output, errorCode } = result;
        console.log(output.join(options.lineSeparator));
        process.exit(errorCode);
      })
      .catch(e => {
        console.error(e);
        process.exit(1);
      });
  });

program.parse(process.argv);
