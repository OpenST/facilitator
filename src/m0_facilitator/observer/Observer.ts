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

/**
 * Defines an abstract observer class.
 * A class that wants to receive updates from a subject, inherits and
 * implements `update()` method.
 */
export default abstract class Observer<T> {
  /**
   * Notifies the observer about state change in a subject.
   *
   * @param updates Updates (state change) that happened in a subject.
   */
  public abstract async update(updates: T[]): Promise<void>;
}
