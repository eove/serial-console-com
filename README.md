# serial-console-com [![Build Status](https://www.travis-ci.org/eove/serial-console-com.svg?branch=master)](https://www.travis-ci.org/eove/serial-console-com) [![npm version](https://badge.fury.io/js/%40eove%2Fserial-console-com.svg)](https://badge.fury.io/js/%40eove%2Fserial-console-com) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Node.js lib to communicate a unix-like console through a serial line

## Install

Node >= 8.12.0

`npm install`

## Usage...

### ...in your code

This lib exposes a communicator which may execute commands through the serial line.

```js
import { createSerialCommunicator } from '@eove/serial-console-com';

const communicator = createSerialCommunicator({
  baudrate: 115200,
  prompt: '/ #',
  lineSeparator: '\n'
});

communicator
  .connect('/dev/ttyUSB0')
  .then(() => communicator.executeCommand('ls -al'))
  .then(({ output, errorCode }) => {
    console.log('error code:', errorCode);
    console.log('output:', output.join('\n'));
  });
  .catch(e => console.error('error when running ls -al'))
  .finally(() => communicator.disconnect())
```

The async `executeCommand` method returns an object with the following fields:

- `errorCode`: a number corresponding to the error code of the command
- `output`: a string array corresponding to the lines of the command output

### ...from a CLI 🔥

You can try it from the command line: `npx @eove/serial-console-com run 'ls -al /' -p /dev/ttyUSB0` (type `npx @eove/serial-console-com run --help` for the full list of options)

Note: the `npx` command exits with the given command error code:

```bash
npx @eove/serial-console-com run 'true' -p /dev/ttyUSB0
echo $?
0
```

```bash
npx @eove/serial-console-com run 'false' -p /dev/ttyUSB0
echo $?
1
```
