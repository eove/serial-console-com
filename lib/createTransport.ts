import * as debugLib from 'debug';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { SerialPort } from 'serialport';

import { Device, Transport, IOCTLOptions } from './types';

type UninstallHandler = () => void;

interface TransportCreationOptions {
  debugEnabled?: boolean;
  baudRate?: number;
}

export function createTransport(options?: TransportCreationOptions): Transport {
  const { debugEnabled = false } = options || {};
  const debug = Object.assign(debugLib('transport'), { enabled: debugEnabled });
  const dataSource = new Subject<string>();
  const eventSource = new Subject();
  let port: SerialPort;
  let uninstallPortListeners: UninstallHandler;
  let isConnected = false;

  return {
    connect,
    disconnect,
    get data$() {
      return dataSource.asObservable();
    },
    get event$() {
      return eventSource.asObservable();
    },
    get connected() {
      return isConnected;
    },
    write,
    discover,
    ioctl,
  };

  function connect(portName: string): Promise<void> {
    if (isConnected) {
      return Promise.reject(new Error('already connected'));
    }
    const { baudRate } = _.defaults({}, options, { baudRate: 115200 });
    port = new SerialPort({ path: portName, autoOpen: false, baudRate });
    uninstallPortListeners = installPortListeners();
    debug(`connecting to: ${portName}, baud rate: ${baudRate}`);

    return new Promise((resolve, reject) => {
      port.open((error) => {
        if (error) {
          const err = new Error(
            `Error when opening port ${portName} (${error.message})`
          );
          return reject(err);
        }
        return resolve();
      });
    });

    function installPortListeners() {
      const onOpenHandler = () => {
        isConnected = true;
        debug('connected.');
        _sendEvent({ type: 'TRANSPORT_CONNECTED', payload: undefined });
      };

      const onDataHandler = (data: any) => {
        const received = data.toString();
        debug('received:', received.replace('\r', '\\r'));
        _sendData(received);
      };

      const onCloseHandler = () => {
        isConnected = false;
        debug('disconnected.');
        _sendEvent({ type: 'TRANSPORT_DISCONNECTED', payload: undefined });
      };

      port.on('open', onOpenHandler);
      port.on('data', onDataHandler);
      port.on('close', onCloseHandler);
      return () => {
        port.removeListener('open', onOpenHandler);
        port.removeListener('data', onDataHandler);
        port.removeListener('close', onCloseHandler);
      };
    }
  }

  function disconnect(): Promise<void> {
    if (!isConnected) {
      return Promise.reject(new Error('already disconnected'));
    }

    return runDisconnect().then(() => {
      if (uninstallPortListeners) {
        uninstallPortListeners();
      }
    });

    function runDisconnect(): Promise<void> {
      return new Promise((resolve, reject) => {
        port.close((error) => {
          if (error) {
            const err = new Error(
              `Error when disconnecting (${error.message})`
            );
            return reject(err);
          }
          return resolve();
        });
      });
    }
  }

  function write(bytes: string): Promise<void> {
    debug(`sending: ${bytes}`);
    return new Promise((resolve, reject) => {
      port.write(Buffer.from(bytes), (writeError) => {
        if (writeError) {
          const err = new Error(
            `Error when writing data (${writeError.message})`
          );
          reject(err);
        } else {
          port.drain((flushError) => {
            if (flushError) {
              const err = new Error(
                `Error when flushing data (${flushError.message})`
              );
              reject(err);
            } else {
              debug(`wrote: ${bytes}`);
              resolve();
            }
          });
        }
      });
    });
  }

  function ioctl(ioctlOptions: IOCTLOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      port.set(ioctlOptions, (err) => {
        if (err) {
          reject(
            new Error(`Error when setting port parameters (${err.message})`)
          );
        } else {
          resolve();
        }
      });
    });
  }

  function discover(): Promise<Device[]> {
    return SerialPort.list()
      .then((serialPorts: any) => {
        return serialPorts.map((serialPort: any) => ({
          name: serialPort.comName,
        }));
      })
      .catch((error) => {
        return Promise.reject(
          new Error(`Error when discovering ports (${error.message})`)
        );
      });
  }

  function _sendEvent(event: { type: string; payload: any }) {
    eventSource.next(event);
  }

  function _sendData(data: any) {
    dataSource.next(data);
  }
}
