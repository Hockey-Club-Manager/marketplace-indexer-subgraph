import {near, JSONValue, json, ipfs, log, TypedMap, store} from "@graphprotocol/graph-ts"
import { Token, User } from "../generated/schema"

export function handleReceipt(
    receipt: near.ReceiptWithOutcome
): void {
  const actions = receipt.receipt.actions;
  for (let i = 0; i < actions.length; i++) {
    handleAction(actions[i], receipt)
  }
}


// function getJSONString(value: TypedMap<string, JSONValue>): string {
//     let result = ''
//     for (let key in value) {
//         result += key + ':' + getJSONString(value[key]) + ','
//     }
//     return '{' + result + '}'
// }

function handleAction(
    action: near.ActionValue,
    receiptWithOutcome: near.ReceiptWithOutcome
): void {
  if (action.kind != near.ActionKind.FUNCTION_CALL) {
    return;
  }
  const outcome = receiptWithOutcome.outcome;
  const functionCall = action.toFunctionCall();
  const methodName = functionCall.methodName
  const owner = "parh.testnet"

  if (methodName == 'nft_mint') {
    const args = json.fromString(functionCall.args.toString()).toObject()
    const token_id = (args.get('token_id') as JSONValue).toString()
    let token = new Token(token_id)
    let user = User.load(owner)
    if (!user) {
      user = new User(owner)
    }
    const metadata = (args.get('metadata') as JSONValue).toObject()
    token.title = (metadata.get('title') as JSONValue).toString()
    token.media = (metadata.get('media') as JSONValue).toString()
    token.extra = (metadata.get('extra') as JSONValue).toString()
    token.issued_at = (metadata.get('issued_at') as JSONValue).toBigInt()
    token.tokenId = token_id
    token.owner = user.id

    token.ownerId = user.id

    let perpetual_royalties_string = "{";
    let perpetual_royalties = (args.get('perpetual_royalties') as JSONValue).toObject()
    for (let i = 0; i < perpetual_royalties.entries.length; i++) {
        let entry = perpetual_royalties.entries[i]
        let key = entry.key.toString()
        let value = entry.value.toBigInt().toString()
        perpetual_royalties_string += `"${key}"`+ ": " + value
        if (i < perpetual_royalties.entries.length - 1) {
            perpetual_royalties_string += ", "
        }
    }
    perpetual_royalties_string += "}"

    token.perpetual_royalties = perpetual_royalties_string

    token.save()
    user.save()
  }
  else if (methodName == 'delete_data') {
    let user = User.load(owner)
    if (!user) {
      return
    }
    // log.error("LENGTH: {}", [user.tokens.length.toString()])

    // for (let i = 0; i < user.tokens.length; i++) {
    //   let tokenId = user.tokens[i]
      // log.info("tokenId: {}", [tokenId])
      // store.remove('Token', tokenId)
    // }
  }
}