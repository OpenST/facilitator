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
export default abstract class Comparable<T> {
  /**
   * Compares the current object with the provided one.
   *
   * @return positive integer, if the current object is greater than the specified object.
   *         negative integer, if the current object is less than the specified object.
   *         zero, if the current object is equal to the specified object.
   */
  public abstract compareTo(other: Comparable<T>): number;
}
