export interface Command {
  execute(): void;
}

export class CommandDispatcher {
  dispatch(command: Command): void {
    command.execute();
  }
}
