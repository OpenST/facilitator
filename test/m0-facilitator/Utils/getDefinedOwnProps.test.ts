// Copyright 2019 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------------------------------------------------------

import 'mocha';

import Utils from '../../../src/m0-facilitator/Utils';
import assert from '../test_utils/assert';

describe('Utils::getDefinedOwnProps', (): void => {
  it('Checks that only defined and owned props are returned.', async (): Promise<void> => {
    const obj = {
      a: 'A',
      b: undefined,
      n: 2,
    };

    assert.isOk(
      'toString' in obj,
      'Checks that toString property exists in prototype chain.',
    );

    const props: string[] = Utils.getDefinedOwnProps(obj);

    assert.strictEqual(
      props.length,
      2,
      'Only two defined-own properties.',
    );

    assert.notStrictEqual(
      props.indexOf('a'),
      -1,
      'Property \'a\' is own property and it\'s defined',
    );

    assert.notStrictEqual(
      props.indexOf('n'),
      -1,
      'Property \'n\' is own property and it\'s defined',
    );

    assert.strictEqual(
      props.indexOf('b'),
      -1,
      'Property \'b\' is the owned property however undefined one.',
    );
  });
});
