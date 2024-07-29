import { Observable } from 'rxjs';

export interface ParseConsoleOutputResult {
  lines: string[];
  remaining: string;
}

export type ParseConsoleOutputFunction = (
  data: string
) => ParseConsoleOutputResult;

export interface Device {
  name: string;
}

export interface IOCTLOptions {
  cts?: boolean;
  dsr?: boolean;
  dtr?: boolean;
  rts?: boolean;
}

export interface Transport {
  connect: (portName: string) => Promise<void>;
  disconnect: () => Promise<void>;
  write: (bytes: string) => Promise<any>;
  discover: () => Promise<Device[]>;
  ioctl: (options: IOCTLOptions) => Promise<void>;
  data$: Observable<string>;
  event$: Observable<unknown>;
  connected: boolean;
}
