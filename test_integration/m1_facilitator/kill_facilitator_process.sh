#!/usr/bin/env bash
kill -TERM `ps aux | grep -e "[f]acilitator-start.ts" | awk '{print $2}'`
