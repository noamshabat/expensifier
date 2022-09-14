
export interface IRunner {
    run: (path: string) => Promise<void>
}