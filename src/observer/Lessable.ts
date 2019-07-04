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

/** An abstract class that enables less operation. */
export default abstract class Lessable<T> {
  /** Less comparison between the class and passed object. */
  public abstract less(other: Lessable<T>): boolean;

  /* Returns true if the class and passed object equal. */
  public equal(other: Lessable<T>): boolean {
    return !(this.less(other) || other.less(this));
  }
}
