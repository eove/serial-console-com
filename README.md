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
  .then(console.log);
});
```
