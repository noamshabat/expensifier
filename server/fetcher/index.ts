import { RegisterDiscountBankCheckingAccount } from './identifiers/discountBank'
import { Runner } from './runner/runner'

const runner = Runner()
RegisterDiscountBankCheckingAccount(runner)
    
export async function processFolder(folder: string) {
    await runner.run(folder)
}
