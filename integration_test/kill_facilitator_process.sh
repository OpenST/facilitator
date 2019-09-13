#!/usr/bin/env bash
kill -TERM `ps aux | grep -e "[d]ev 1000" -e "[f]acilitator_start.sh"`
