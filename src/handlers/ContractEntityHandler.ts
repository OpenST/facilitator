import Model from '../models/Model';

export default interface ContractEntityHandler {

  handle(any): void;
  parse(any): Model;
}
