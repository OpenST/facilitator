#!/usr/bin/env bash
kill -TERM `ps aux | grep [f]acilitator | awk '{print $2}'`
