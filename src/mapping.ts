import {BigInt, json, JSONValue, log, near, store, TypedMap} from "@graphprotocol/graph-ts"
import {MarketplaceToken, Offer, Token, User,
        Goalie, Five, PlayerOnPosition, Team} from "../generated/schema"

function getFiveId(teamId: string, number: string): string {
    // see Five structure in schema.graphql
    return teamId+"_"+number
}

function getPlayerId(teamId: string, tokenId: string): string {
    // see Goalie structure in schema.graphql
    return teamId+"_"+tokenId
}

function getOfferId(tokenId: string, userId: string): string {
    return tokenId+"_"+userId
}

function deleteObjFromArray<T>(array: T[], str: T): T[] {
    const index = array.indexOf(str)
    if (index > -1) {
        array.splice(index, 1)
    }
    return array
}


function addObjToArray<T>(array: T[] | null, obj: T): T[] {
    if (array == null) {
        array = new Array<T>()
    }
    array.push(obj)
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
        return "Common"
    else if (60 <= average && average < 76)
        return "Uncommon"
    else if (76 <= average && average < 86)
        return "Rare"
    else if (86 <= average && average < 96)
        return "Unique"
    else
        return "Exclusive"
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
    const defaultOwner = "parh.testnet"

    if (methodName == 'nft_mint') {
        const args = json.fromString(functionCall.args.toString()).toObject()
        const token_id = (args.get('token_id') as JSONValue).toString()
        let token = new Token(token_id)
        let user = User.load(defaultOwner)
        if (!user) {
            user = new User(defaultOwner)
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
        let user = User.load(defaultOwner)
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
        const userId = receiptWithOutcome.receipt.signerId
        if (!args.get('msg')) {
            log.error("msg is null", [])
            return
        }
        // log.error("msg: {}", [args.get('msg')!.toString()])
        const msg = json.fromString(args.get('msg')!.toString()).toObject()
        const is_auction = (msg.get('is_auction') as JSONValue).toBool()
        const sale_conditions = (msg.get('sale_conditions') as JSONValue).toObject()
        const price = (sale_conditions.get('near') as JSONValue).toString()
        const marketplaceToken = new MarketplaceToken(token_id)

        // removing player from team if he is in it
        const playerId = getPlayerId(userId, token_id)
        const team = Team.load(userId)
        if (team) {  // if exists, token could be in it. Otherwise, it couldn't
            const player = PlayerOnPosition.load(playerId)
            const goalie = Goalie.load(playerId)
            if (player) {
                for (let i = 0; i < team.fives.length; i++) {
                    const five = Five.load(team.fives[i])
                    if (!five) {
                        log.error("Deleting token {} from team: five does not exist", [token_id])
                        continue
                    }
                    five.field_players = deleteObjFromArray(five.field_players, playerId)
                }
                store.remove('PlayerOnPosition', playerId)
            }
            else if (goalie) {
                team.goalies = deleteObjFromArray(team.goalies, playerId)
                store.remove('Goalie', playerId)
            }
        }
        // const offer = new Offer(getOfferId(token_id, userId))
        // offer.price = BigInt.fromString(price)
        // offer.user = userId
        // offer.save()

        marketplaceToken.token = token_id
        marketplaceToken.price = BigInt.fromString(price)
        marketplaceToken.offers = new Array<string>()
        marketplaceToken.isAuction = is_auction
        marketplaceToken.save()

    }
    else if (methodName == 'nft_transfer_payout') {
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

        previous_user.tokens = deleteObjFromArray(user.tokens as Array<string>, token_id)
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
            store.remove('Offer', marketplaceToken.offers[i])
        }

        store.remove('MarketplaceToken', token_id)
        token.save()
        user.save()
    }
    else if (methodName == 'manage_team') {
        // { "team_ids": {
        //   "fives": {"First": {
        //              "field_players": {
        //               "LW": "token-12345678",
        //               "RD": "token-53873284",
        //               "C": "token-23098223",
        //               "LD": "token-90872398",
        //               "RW": "token-73472018"
        //             },
        //             "number": "First",
        //             "ice_time_priority": "SuperLowPriority",
        //             "tactic": "Safe"
        //         }
        //   },
        //  "goalies": {
        //         "MainGoalkeeper": "token-12045678"
        //         }
        //  }
        //
        const args = json.fromString(functionCall.args.toString()).toObject()
        const team_ids = (args.get('team_ids') as JSONValue).toObject()
        const fives = (team_ids.get('fives') as JSONValue).toObject()
        const goalies = (team_ids.get('goalies') as JSONValue).toObject()
        const goalie_substitutions = (team_ids.get('goalie_substitutions') as JSONValue).toObject()

        let team = Team.load(receiptWithOutcome.receipt.signerId)
        if (!team) {
            team = new Team(receiptWithOutcome.receipt.signerId)
        }

        const fivesArray = new Array<string>()
        for (let i = 0; i < fives.entries.length; i++) {
            let five: Five | null
            const fiveNumber = fives.entries[i].key
            const fiveData = fives.entries[i].value.toObject()
            const fieldPlayersData = (fiveData.get('field_players') as JSONValue).toObject()
            five = Five.load(getFiveId(team.id, fiveNumber))
            if (!five) {
                five = new Five(getFiveId(team.id, fiveNumber))
            }
            five.number = fiveNumber
            five.ice_time_priority = (fiveData.get('ice_time_priority') as JSONValue).toString()
            five.tactic = (fiveData.get('tactic') as JSONValue).toString()
            const fieldPlayers = new Array<string>()
            for (let j = 0; j < fieldPlayersData.entries.length; j++) {
                const position = fieldPlayersData.entries[j].key
                const fieldPlayerToken = fieldPlayersData.entries[j].value.toString()
                let playerOnPosition = PlayerOnPosition.load(getPlayerId(five.id, fieldPlayerToken))
                if (!playerOnPosition) {
                    playerOnPosition = new PlayerOnPosition(getPlayerId(five.id, fieldPlayerToken))
                }
                playerOnPosition.position = position
                playerOnPosition.token_id = fieldPlayerToken
                playerOnPosition.save()
                fieldPlayers.push(playerOnPosition.id)
                // TODO: remove playerOnPosition if it is not used
            }
            five.field_players = fieldPlayers
            five.save()

            fivesArray.push(five.id)
        }

        team.fives = fivesArray

        const goaliesArray = new Array<string>()
        for (let i = 0; i < goalies.entries.length; i++) {
            let goalie: Goalie | null
            const goalieNumber = goalies.entries[i].key
            const goalieTokenId = goalies.entries[i].value.toString()
            goalie = Goalie.load(getPlayerId(team.id, goalieTokenId))
            if (!goalie) {
                goalie = new Goalie(getPlayerId(team.id, goalieTokenId))
            }
            goalie.number = goalieNumber
            goalie.token_id = goalieTokenId
            goalie.save()
            // TODO: remove goalie if it is not used

            goaliesArray.push(goalie.id)
        }
        team.goalies = goaliesArray


        const goalieSubstitutionsArray = new Array<string>()
        for (let i = 0; i < goalie_substitutions.entries.length; i++) {
            let goalie: Goalie | null
            const goalieNumber = goalie_substitutions.entries[i].key
            const goalieTokenId = goalie_substitutions.entries[i].value.toString()
            goalie = Goalie.load(getPlayerId(team.id, goalieTokenId))
            if (!goalie) {
                goalie = new Goalie(getPlayerId(team.id, goalieTokenId))
            }
            goalie.number = goalieNumber
            goalie.token_id = goalieTokenId
            goalie.save()
            // TODO: remove goalie if it is not used

            goalieSubstitutionsArray.push(goalie.id)
        }
        team.goalie_substitutions = goalieSubstitutionsArray
        team.save()

        // user definetely exists on this step
        const user = User.load(receiptWithOutcome.receipt.signerId) as User
        user.team = team.id
        user.save()
    }
    else if (methodName == 'nft_buy_pack' || methodName == "nft_register_account") {
        // {”account_id”: “let45fc.testnet", “token_id”: “token-12345678”}
        if (receiptWithOutcome.outcome.logs.length == 0) {
            log.error("logs are empty", [])
            return
        }
        const args = json.fromString(functionCall.args.toString()).toObject()

        const tokens = new Array<string>()
        const logData = json.fromString(receiptWithOutcome.outcome.logs[0]).toArray()
        for (let i = 0; i < logData.length; i++) {
            const tokenId = logData[i].toString()
            if (!tokenId) {
                log.error("nft_buy_pack or nft_register_account: tokenId is empty", [])
                continue
            }
            tokens.push(tokenId)
        }
        const receiver_id = args.get('receiver_id')!.toString()

        let user = User.load(receiptWithOutcome.receipt.signerId)
        if (!user) {
            user = new User(receiptWithOutcome.receipt.signerId)
        }
        for (let i = 0; i < tokens.length; i++) {
            const token = Token.load(tokens[i].toString())
            if (!token) {
                log.error("nft_buy_pack or nft_register_account: token {} does not exist in indexer", [tokens[i].toString()])
                return
            }
            token.owner = user.id
            token.ownerId = user.id
            token.save()
        }
        user.tokens = (user.tokens ? user.tokens!: new Array<string>()).concat(tokens)
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
        const price = BigInt.fromString(args.get('price')!.toString())
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
            store.remove('Offer', marketplaceToken.offers[i])
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
            const offer = new Offer(getOfferId(token_id, user.id))
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

