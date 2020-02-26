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

import Comparable from '../../../src/common/observer/Comparable';

/**
 * The class is intended for testing functionality of observer/subject classes.
 * It acts as a subject's update that is passed during notification to observers.
 */
export default class NumberUpdate extends Comparable<NumberUpdate> {
  /* Storage */

  public readonly value: number = 0;

  public compareTo(other: NumberUpdate): number {
    return this.value - other.value;
  }

  public constructor(value: number) {
    super();

    this.value = value;
  }
}
