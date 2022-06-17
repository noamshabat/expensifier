import { RegisterCalCreditCard } from './identifiers/cal'
import { RegisterDiscountBankCheckingAccount } from './identifiers/discountBank'
import { RegisterIsracardCreditCard } from './identifiers/isracard'
import { Runner } from './runner/runner'

const runner = Runner()
RegisterDiscountBankCheckingAccount(runner)
RegisterCalCreditCard(runner)
RegisterIsracardCreditCard(runner)

export async function processFolder(folder: string) {
    await runner.run(folder)
}
