{
  description = "serial-console-com";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; config.allowUnfree = true; };
        minimal-packages = with pkgs; [
          bash
          nodejs_18
        ];
        UV_USE_IO_URING = false; # for serialport issue: https://github.com/serialport/node-serialport/issues/2656
      in
      {
        devShells = {
          default = with pkgs; pkgs.mkShell {
            inherit UV_USE_IO_URING;
            packages = minimal-packages;
          };
        };
      }
  );
}
