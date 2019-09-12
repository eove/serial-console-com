# serial-console-com [![Build Status](https://www.travis-ci.org/eove/serial-console-com.svg?branch=master)](https://www.travis-ci.org/eove/serial-console-com) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Node.js lib to communicate a unix-like console through a serial line

## Install

`npm install`

## Usage

This lib exposes a communicator which may execute commands through the serial line.

```js
import { createSerialCommunicator } from '@eove/serial-console-com';

const communicator = createSerialCommunicator();

communicator
  .connect('/dev/ttyUSB0')
  .then(() => communicator.executeCommand('ls -al'))
  .then(({ output, errorCode }) => {
    console.log('error code:', errorCode);
    console.log('output', output.join('\n'));
  });
```

The async `executeCommand` method returns an object with the following fields:

- `errorCode`: a number corresponding to the error code of the command
- `output`: a string array corresponding to the lines of the command output
