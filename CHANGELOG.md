# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2.0.0 - 2025-05-27

- enter char as option and change default from '\n' to '\r'

## 1.4.0 - 2024-10-15

- upgrade serialport to v11

## 1.3.3 - 2024-07-29

- enable empty response commands

## 1.3.2 - 2024-07-18

- add missing cmd option type

## 1.3.1 - 2024-07-18

- fix error code validation

## 1.3.0 - 2024-06-12

### Added

- support commands with no error code validation

## 1.2.1 - 2024-05-13

### Fixed

- fix `executeCmd` signature (missing `cmdOptions?`)

## 1.2.0 - 2022-03-02

### Added

- add ioctl support ([#14](https://github.com/eove/serial-console-com/issues/14))
