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

import Subject from '../observer/Subject';

/** Base class for repository classes. */
export default abstract class RepositoryBase extends Subject {
  /* Storage */

  /**
   * A repository marks this flag as true during any operation that modifies
   * the content of its underlying model.
   * The flag is used to check before notifying observers of the repository
   * change: if true, observers are notified.
   * During construction the flag is marked as true.
   */
  private _isDirty: boolean;


  /* Public Functions */

  /** Sets 'is dirty' flag to true. */
  public constructor() {
    super();

    this._isDirty = true;
  }

  /**
   * Returns true if there were any change in the repository
   * after the last notification to observers.
   */
  public isDirty(): boolean {
    return this._isDirty;
  }

  /**
   * The function notifies all observers about changes if 'is dirty' flag
   * is marked as true. The flag is cleared out (set to false) after
   * a notification.
   */
  public async notify(): Promise<void[]> {
    if (this._isDirty) {
      this._isDirty = false;
      return super.notify();
    }

    return [];
  }


  /* Protected Functions */

  /**
   * The function marks the repository as dirty, which means that there have
   * been changes after the last notification to observers.
   */
  protected markDirty(): void {
    this._isDirty = true;
  }
}
