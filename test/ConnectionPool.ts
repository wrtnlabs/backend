import { RandomGenerator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { Writable } from "@wrtnlabs/os-api/lib/typings/Writable";

export class ConnectionPool {
  public readonly channel: string;

  public constructor(private readonly connection: HubApi.IConnection) {
    this.customer = clone(connection);
    this.seller = clone(connection);
    this.admin = clone(connection);
    this.channel = RandomGenerator.alphabets(16);
  }

  public readonly customer: HubApi.IConnection;
  public readonly seller: HubApi.IConnection;
  public readonly admin: HubApi.IConnection;

  public setCustomer(connection: HubApi.IConnection): void {
    Writable(this as ConnectionPool).customer = connection;
  }

  public generate(): HubApi.IConnection {
    return clone(this.connection);
  }
}

const clone = (connection: HubApi.IConnection): HubApi.IConnection => ({
  host: connection.host,
  headers: undefined,
  logger: connection.logger,
});
