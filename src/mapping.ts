import {json, JSONValue, log, near, store, TypedMap} from "@graphprotocol/graph-ts"
import {MarketplaceToken, Offer, Token, User} from "../generated/schema"

function deleteStringFromArray(array: string[], str: string): string[] {
    const index = array.indexOf(str)
    if (index > -1) {
        array = array.splice(index, 1)
    }
    return array
}

function calculateRarity(stats: TypedMap<string, JSONValue>): string {
    // calculate average of all stats and then calculate rarity
    let sum = 0;
    let count = 0;
    for (let i = 0; i < stats.entries.length; i++) {
        sum += stats.entries[i].value.toI64() as i32
        count++
    }
    const average = sum / count
    if (40 <= average && average < 60)
        return "usual"
    else if (60 <= average && average < 76)
        return "rare"
    else if (76 <= average && average < 86)
        return "super rare"
    else if (86 <= average && average < 96)
        return "myth"
    else
        return "exclusive"
}

export function handleNFTReceipt(
    receipt: near.ReceiptWithOutcome
): void {
    const actions = receipt.receipt.actions;
    for (let i = 0; i < actions.length; i++) {
        handleNFTAction(actions[i], receipt)
    }
}

export function handleMarketplaceReceipt(
    receipt: near.ReceiptWithOutcome
): void {
    const actions = receipt.receipt.actions;
    for (let i = 0; i < actions.length; i++) {
        handleMarketplaceAction(actions[i], receipt)
    }
}

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
        const extra = json.fromString((metadata.get('extra') as JSONValue).toString()).toObject()
        token.reality = (extra.get("reality") as JSONValue).toBool()
        token.nationality = (extra.get("nationality") as JSONValue).toString()
        token.birthday = (extra.get("birthday") as JSONValue).toBigInt()
        token.number = (extra.get("number") as JSONValue).toI64() as i32
        token.hand = (extra.get("hand") as JSONValue).toString()
        token.player_role = (extra.get("player_role") as JSONValue).toString()
        token.native_position = (extra.get("native_position") as JSONValue).toString()
        token.player_type = (extra.get("player_type") as JSONValue).toString()

        const stats = (extra.get("stats") as JSONValue).toObject()
        token.rarity = calculateRarity(stats)

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

        let stats_string = "{";
        for (let i = 0; i < stats.entries.length; i++) {
            let entry = stats.entries[i]
            let key = entry.key.toString()
            let value = entry.value.toI64().toString()
            stats_string += `"${key}"`+ ": " + value
            if (i < stats.entries.length - 1) {
                stats_string += ", "
            }
        }
        stats_string += "}"
        token.stats = stats_string


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
    } else if (methodName == 'nft_transfer_payout') {
        // {
        //   "receiver_id": "humster_investor.testnet",
        //   "token_id": "token-1656538590693",
        //   "approval_id": 0,
        //   "memo": "payout from market",
        //   "balance": "4000000000000000000000000",
        //   "max_len_payout": 10
        // }
        const args = json.fromString(functionCall.args.toString()).toObject()
        const receiver_id = (args.get('receiver_id') as JSONValue).toString()
        const token_id = (args.get('token_id') as JSONValue).toString()

        const token = Token.load(token_id)
        if (!token) {
            log.error("token not found: {}", [token_id])
            return
        }

        const marketplaceToken = MarketplaceToken.load(token_id)
        if (!marketplaceToken) {
            log.error("marketplaceToken not found: {}", [token_id])
            return
        }

        let user = User.load(receiver_id)
        if (!user) {
            user = new User(receiver_id)
        }

        const previous_user = User.load(token.ownerId)
        if (!previous_user) {
            log.error("previous_user not found: {}", [token.ownerId])
            return
        }
        if (!user.tokens) {
            log.error("user.tokens not found: {}. user has no tokens, but supposed to", [token.ownerId])
            return
        }

        previous_user.tokens = deleteStringFromArray(user.tokens as Array<string>, token_id)
        previous_user.save()


        token.owner = user.id
        token.ownerId = user.id

        let tokens = user.tokens
        if (tokens == null) {
            tokens = new Array<string>()
        }
        tokens.push(token.id)
        user.tokens = tokens

        for (let i = 0; i < marketplaceToken.offers.length; i++) {
            store.remove('Offer', marketplaceToken.offers[i]+"_"+receiptWithOutcome.receipt.signerId)
        }

        store.remove('MarketplaceToken', token_id)
        token.save()
        user.save()
    }
}


function handleMarketplaceAction(
    action: near.ActionValue,
    receiptWithOutcome: near.ReceiptWithOutcome
): void {

    if (action.kind != near.ActionKind.FUNCTION_CALL) {
        return;
    }

    const outcome = receiptWithOutcome.outcome;
    const functionCall = action.toFunctionCall();
    const methodName = functionCall.methodName

    if (methodName == 'update_price') {
        //    {
        //       "nft_contract_id": "nft_0_0.testnet",
        //       "token_id": "token-1655919214054",
        //       "ft_token_id": "near",
        //       "price": "6000000000000000000000000"
        //     }

        const args = json.fromString(functionCall.args.toString()).toObject()
        const token_id = (args.get('token_id') as JSONValue).toString()
        const price = (args.get('price') as JSONValue).toBigInt()
        const marketplaceToken = MarketplaceToken.load(token_id)
        if (!marketplaceToken) {
            return
        }
        marketplaceToken.price = price
        marketplaceToken.save()
    }
    else if (methodName == 'remove_sale') {
        // {
        //   "nft_contract_id": "nft_0_0.testnet",
        //   "token_id": "token-1655676802305"
        // }
        const args = json.fromString(functionCall.args.toString()).toObject()
        const token_id = (args.get('token_id') as JSONValue).toString()
        const marketplaceToken = MarketplaceToken.load(token_id)
        if (!marketplaceToken) {
            log.error("marketplaceToken not found: {}", [token_id])
            return
        }
        for (let i = 0; i < marketplaceToken.offers.length; i++) {
            store.remove('Offer', marketplaceToken.offers[i]+"_"+receiptWithOutcome.receipt.signerId)
        }
        store.remove('MarketplaceToken', token_id)
    }
    else if (methodName == 'offer') {
        // {
        //   "nft_contract_id": "nft_0_0.testnet",
        //   "token_id": "token-1656526278801"
        // }
        const args = json.fromString(functionCall.args.toString()).toObject()
        const token_id = (args.get('token_id') as JSONValue).toString()
        const marketplaceToken = MarketplaceToken.load(token_id)
        const price = functionCall.deposit
        let user = User.load(receiptWithOutcome.receipt.signerId)
        if (!user) {
            user = new User(receiptWithOutcome.receipt.signerId)
        }
        user.save()

        if (!marketplaceToken) {
            log.error("MarketplaceToken not found: {}", [token_id])
            return
        }
        if (marketplaceToken.isAuction) {
            const offer = new Offer(token_id+"_"+user.id)
            offer.price = price
            offer.user = receiptWithOutcome.receipt.signerId
            offer.save()
            const offers = marketplaceToken.offers
            offers.push(offer.id)
            marketplaceToken.offers = offers
        }
        // else {
        //     const token = Token.load(token_id)
        //     if (!token) {
        //         log.error("Token not found: {}", [token_id])
        //         return
        //     }
        //     token.owner = receiptWithOutcome.receipt.signerId
        //     token.ownerId = receiptWithOutcome.receipt.signerId
        //     token.save()
        // }
        marketplaceToken.save()
    }
}

