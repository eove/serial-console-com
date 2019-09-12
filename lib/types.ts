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

export interface Transport {
  connect: (portName: string) => Promise<void>;
  disconnect: () => Promise<void>;
  write: (bytes: string) => Promise<any>;
  discover: () => Promise<Device[]>;
  data$: Observable<unknown>;
  event$: Observable<unknown>;
  connected: boolean;
}
