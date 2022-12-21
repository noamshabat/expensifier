
export interface IRunner {
	run: (filer: { name: string }[]) => Promise<void>
}