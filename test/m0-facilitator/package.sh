#!/bin/bash

script_dir_path="$(cd "$(dirname "$0")" && pwd)"
root_dir="${script_dir_path}/../.."
test_package_path="${script_dir_path}/package"

function clean {
    cd "${test_package_path}"

    rm -rf "./node_modules" || exit 1
    rm -f openst-facilitator-*.tgz || exit 1
    rm -f package.json || exit 1
    rm -f package-lock.json || exit 1

    cd -
}

clean

echo "Switching to root directory."
cd "${root_dir}" || exit 1

echo "Executing \"npm pack\"."
npm pack || exit 1

echo "Switching to the package test directory."
cd "${test_package_path}" || exit 1

echo "Moving npm tarball into the test directory."
mv $root_dir/openst-facilitator-*.tgz . || exit 1

echo "Initiating npm project for test."
npm init -y || exit 1
npm install assert || exit 1

echo "Installing openst-facilitator npm package into newly created project."
npm install openst-facilitator-*.tgz || exit 1

echo "Accessing as binary."
./node_modules/.bin/facilitator help || exit 1

echo "Cleaning up generated files."
clean

echo "Successfully Passed."
