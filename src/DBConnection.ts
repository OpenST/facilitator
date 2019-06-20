/**
 * The class creates db connection object using npm client.
 */
export default class DBConnection {
  private static connection: any;

  /**
   * Creates and returns db connection object.
   *
   * @param {string} dbPath Sqlite local db path.
   * @returns `any` Database connection object.
   */
  public static getConnection(dbPath: string) {
    // Create connection object here using npm client.
    // Return connection object if already present.
    // Create new connection object if not present.
    // e.g. this.connection = this.connection || <create connection>
    return this.connection;
  }
}
