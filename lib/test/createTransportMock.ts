import { Transport } from '../types';
import { from } from 'rxjs';

export function createTransportMock(): Transport {
  return {
    connect: jest.fn().mockResolvedValue(undefined),
    connected: true,
    disconnect: jest.fn().mockResolvedValue(undefined),
    write: jest.fn().mockResolvedValue(undefined),
    discover: jest.fn().mockResolvedValue([]),
    ioctl: jest.fn().mockResolvedValue(undefined),
    data$: from([]),
    event$: from([]),
  };
}
