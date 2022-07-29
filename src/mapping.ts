import {near, JSONValue, json, ipfs, log, TypedMap, store} from "@graphprotocol/graph-ts"
import { Token, User, MarketplaceToken } from "../generated/schema"

export function handleNFTReceipt(
    receipt: near.ReceiptWithOutcome
): void {
  const actions = receipt.receipt.actions;
  for (let i = 0; i < actions.length; i++) {
    handleNFTAction(actions[i], receipt)
  }
}


// function getJSONString(value: TypedMap<string, JSONValue>): string {
//     let result = ''
//     for (let key in value) {
//         result += key + ':' + getJSONString(value[key]) + ','
//     }
//     return '{' + result + '}'
// }

function handleNFTAction(
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
    let user_tokens = user.tokens
    if (!user_tokens) {
      user_tokens = new Array<string>()
    }
    user_tokens.push(token.id)
    user.tokens = user_tokens

    token.save()
    user.save()
  }
  else if (methodName == 'delete_data') {
    let user = User.load(owner)
    if (!user) {
      return
    }
    let tokens = user.tokens
    if (!tokens) {
      return
    }
    log.error("LENGTH: {}", [tokens.length.toString()])

    for (let i = 0; i < tokens.length; i++) {
      let tokenId = tokens[i]
      log.info("tokenId: {}", [tokenId])
      store.remove('Token', tokenId)
    }
    user.tokens = null
    user.save()
  }
  else if (methodName == 'nft_approve') {
    // {
    //   "token_id": "token-1656538590693",
    //   "account_id": "new_new_nft_market.testnet",
    //   "msg": "{\"is_auction\":true,\"sale_conditions\":{\"near\":\"3000000000000000000000000\"}}"
    // }
    const args = json.fromString(functionCall.args.toString()).toObject()
    const token_id = (args.get('token_id') as JSONValue).toString()
    const msg = (args.get('msg') as JSONValue).toObject()
    const is_auction = (msg.get('is_auction') as JSONValue).toBool()
    const sale_conditions = (msg.get('sale_conditions') as JSONValue).toObject()
    const price = (sale_conditions.get('near') as JSONValue).toBigInt()
    const marketplaceToken = new MarketplaceToken(token_id)
    marketplaceToken.token = token_id
    marketplaceToken.price = price
    marketplaceToken.isAuction = is_auction
    marketplaceToken.save()
  }
}