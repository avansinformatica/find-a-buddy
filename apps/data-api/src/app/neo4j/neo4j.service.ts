import neo4j, { Result, Driver, SessionMode, ManagedTransaction } from 'neo4j-driver'
import { Injectable, Inject, OnApplicationShutdown } from '@nestjs/common';
import { Neo4jConfig } from './neo4j-config.interface';
import { NEO4J_CONFIG, NEO4J_DRIVER } from './neo4j.constants';

type TransactionWork = (tx: ManagedTransaction) => Promise<Result>;

@Injectable()
export class Neo4jService implements OnApplicationShutdown {
  constructor(
    @Inject(NEO4J_CONFIG) private readonly config: Neo4jConfig,
    @Inject(NEO4J_DRIVER) private readonly driver: Driver
  ) {}

  private getSession(mode: SessionMode) {
      return this.driver.session({
        database: this.config.database,
        defaultAccessMode: mode,
      });
  }

  private async executeSingle(mode: SessionMode, query: string, params?: unknown): Promise<Result> {
    console.log(query)
    const session = this.getSession(mode);
    const result = await session.run(query, params);
    session.close();
    console.log(result)
    return result;
  }

  private async executeTransaction(mode: SessionMode, transactionWork: TransactionWork) {
    const session = this.getSession(neo4j.session.READ);
    const result = session.executeRead(transactionWork);
    session.close();
    return result;
  }

  getConfig(): Neo4jConfig {
      return this.config;
  }

  async singleRead(query: string, params?: unknown): Promise<Result> {
    return this.executeSingle(neo4j.session.READ, query, params);
  }

  async singleWrite(query: string, params?: unknown): Promise<Result> {
    return this.executeSingle(neo4j.session.WRITE, query, params);
  }

  async readTransaction(transactionWork: TransactionWork): Promise<Result> {
    return this.executeTransaction(neo4j.session.READ, transactionWork);
  }

  async writeTransaction(transactionWork: TransactionWork): Promise<Result> {
    return this.executeTransaction(neo4j.session.READ, transactionWork);
  }

  onApplicationShutdown() {
    return this.driver.close()
  }
}
