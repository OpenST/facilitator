import { execSync } from 'child_process';

/**
 * Executes shell commands in child processes.
 */
export default class Shell {
  /**
   * Executes a command in child process and returns it.
   * @param {string} command Command string to execute.
   * @returns Child process that was spawned by this call.
   */
  public static executeInShell(command: string): Buffer {
    return execSync(command);
  }
}
