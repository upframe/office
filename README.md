![Who's there?](https://cloud.githubusercontent.com/assets/5447088/22626990/14522f80-ebb1-11e6-9b40-9a027ed3478d.gif)

[![Build](https://img.shields.io/travis/upframe/whosthere.svg?style=flat-square)](https://travis-ci.org/upframe/whosthere)
[![Go Report Card](https://goreportcard.com/badge/github.com/upframe/whosthere?style=flat-square)](https://goreportcard.com/report/upframe/whosthere)

New version -> NodeJS port

This simple Go program allows you to know who is in the office of your company. The members of the company can change their own state.

## Usage

There must be a ```thisisnotthepassword.txt``` file in the same place where the binary is being executed and it must contain the password that'll be used by the members to change their status.

You can change the port and activate/deactivate the SSL with the flags ```--port``` and ```--secure```, respectively.
