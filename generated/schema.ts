// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Token extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Token entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Token must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Token", id.toString(), this);
    }
  }

  static load(id: string): Token | null {
    return changetype<Token | null>(store.get("Token", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get title(): string {
    let value = this.get("title");
    return value!.toString();
  }

  set title(value: string) {
    this.set("title", Value.fromString(value));
  }

  get media(): string {
    let value = this.get("media");
    return value!.toString();
  }

  set media(value: string) {
    this.set("media", Value.fromString(value));
  }

  get reality(): boolean {
    let value = this.get("reality");
    return value!.toBoolean();
  }

  set reality(value: boolean) {
    this.set("reality", Value.fromBoolean(value));
  }

  get stats(): string {
    let value = this.get("stats");
    return value!.toString();
  }

  set stats(value: string) {
    this.set("stats", Value.fromString(value));
  }

  get nationality(): string {
    let value = this.get("nationality");
    return value!.toString();
  }

  set nationality(value: string) {
    this.set("nationality", Value.fromString(value));
  }

  get birthday(): BigInt {
    let value = this.get("birthday");
    return value!.toBigInt();
  }

  set birthday(value: BigInt) {
    this.set("birthday", Value.fromBigInt(value));
  }

  get number(): i32 {
    let value = this.get("number");
    return value!.toI32();
  }

  set number(value: i32) {
    this.set("number", Value.fromI32(value));
  }

  get hand(): string {
    let value = this.get("hand");
    return value!.toString();
  }

  set hand(value: string) {
    this.set("hand", Value.fromString(value));
  }

  get player_role(): string {
    let value = this.get("player_role");
    return value!.toString();
  }

  set player_role(value: string) {
    this.set("player_role", Value.fromString(value));
  }

  get native_position(): string {
    let value = this.get("native_position");
    return value!.toString();
  }

  set native_position(value: string) {
    this.set("native_position", Value.fromString(value));
  }

  get player_type(): string {
    let value = this.get("player_type");
    return value!.toString();
  }

  set player_type(value: string) {
    this.set("player_type", Value.fromString(value));
  }

  get rarity(): string {
    let value = this.get("rarity");
    return value!.toString();
  }

  set rarity(value: string) {
    this.set("rarity", Value.fromString(value));
  }

  get issued_at(): BigInt {
    let value = this.get("issued_at");
    return value!.toBigInt();
  }

  set issued_at(value: BigInt) {
    this.set("issued_at", Value.fromBigInt(value));
  }

  get tokenId(): string {
    let value = this.get("tokenId");
    return value!.toString();
  }

  set tokenId(value: string) {
    this.set("tokenId", Value.fromString(value));
  }

  get owner(): string {
    let value = this.get("owner");
    return value!.toString();
  }

  set owner(value: string) {
    this.set("owner", Value.fromString(value));
  }

  get ownerId(): string {
    let value = this.get("ownerId");
    return value!.toString();
  }

  set ownerId(value: string) {
    this.set("ownerId", Value.fromString(value));
  }

  get perpetual_royalties(): string {
    let value = this.get("perpetual_royalties");
    return value!.toString();
  }

  set perpetual_royalties(value: string) {
    this.set("perpetual_royalties", Value.fromString(value));
  }

  get marketplace_data(): string | null {
    let value = this.get("marketplace_data");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set marketplace_data(value: string | null) {
    if (!value) {
      this.unset("marketplace_data");
    } else {
      this.set("marketplace_data", Value.fromString(<string>value));
    }
  }
}

export class MarketplaceToken extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save MarketplaceToken entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type MarketplaceToken must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("MarketplaceToken", id.toString(), this);
    }
  }

  static load(id: string): MarketplaceToken | null {
    return changetype<MarketplaceToken | null>(
      store.get("MarketplaceToken", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get price(): BigInt {
    let value = this.get("price");
    return value!.toBigInt();
  }

  set price(value: BigInt) {
    this.set("price", Value.fromBigInt(value));
  }

  get token(): string {
    let value = this.get("token");
    return value!.toString();
  }

  set token(value: string) {
    this.set("token", Value.fromString(value));
  }

  get isAuction(): boolean {
    let value = this.get("isAuction");
    return value!.toBoolean();
  }

  set isAuction(value: boolean) {
    this.set("isAuction", Value.fromBoolean(value));
  }

  get offers(): Array<string> {
    let value = this.get("offers");
    return value!.toStringArray();
  }

  set offers(value: Array<string>) {
    this.set("offers", Value.fromStringArray(value));
  }
}

export class Offer extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Offer entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Offer must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Offer", id.toString(), this);
    }
  }

  static load(id: string): Offer | null {
    return changetype<Offer | null>(store.get("Offer", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get price(): BigInt {
    let value = this.get("price");
    return value!.toBigInt();
  }

  set price(value: BigInt) {
    this.set("price", Value.fromBigInt(value));
  }

  get user(): string {
    let value = this.get("user");
    return value!.toString();
  }

  set user(value: string) {
    this.set("user", Value.fromString(value));
  }
}

export class User extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save User entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type User must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("User", id.toString(), this);
    }
  }

  static load(id: string): User | null {
    return changetype<User | null>(store.get("User", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get tokens(): Array<string> | null {
    let value = this.get("tokens");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set tokens(value: Array<string> | null) {
    if (!value) {
      this.unset("tokens");
    } else {
      this.set("tokens", Value.fromStringArray(<Array<string>>value));
    }
  }

  get team(): string | null {
    let value = this.get("team");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set team(value: string | null) {
    if (!value) {
      this.unset("team");
    } else {
      this.set("team", Value.fromString(<string>value));
    }
  }
}

export class Team extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Team entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Team must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Team", id.toString(), this);
    }
  }

  static load(id: string): Team | null {
    return changetype<Team | null>(store.get("Team", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get fives(): Array<string> {
    let value = this.get("fives");
    return value!.toStringArray();
  }

  set fives(value: Array<string>) {
    this.set("fives", Value.fromStringArray(value));
  }

  get goalies(): Array<string> {
    let value = this.get("goalies");
    return value!.toStringArray();
  }

  set goalies(value: Array<string>) {
    this.set("goalies", Value.fromStringArray(value));
  }
}

export class Five extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Five entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Five must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Five", id.toString(), this);
    }
  }

  static load(id: string): Five | null {
    return changetype<Five | null>(store.get("Five", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get field_players(): Array<string> {
    let value = this.get("field_players");
    return value!.toStringArray();
  }

  set field_players(value: Array<string>) {
    this.set("field_players", Value.fromStringArray(value));
  }

  get number(): string {
    let value = this.get("number");
    return value!.toString();
  }

  set number(value: string) {
    this.set("number", Value.fromString(value));
  }

  get ice_time_priority(): string {
    let value = this.get("ice_time_priority");
    return value!.toString();
  }

  set ice_time_priority(value: string) {
    this.set("ice_time_priority", Value.fromString(value));
  }

  get tactic(): string {
    let value = this.get("tactic");
    return value!.toString();
  }

  set tactic(value: string) {
    this.set("tactic", Value.fromString(value));
  }
}

export class PlayerOnPosition extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save PlayerOnPosition entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type PlayerOnPosition must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("PlayerOnPosition", id.toString(), this);
    }
  }

  static load(id: string): PlayerOnPosition | null {
    return changetype<PlayerOnPosition | null>(
      store.get("PlayerOnPosition", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get token_id(): string {
    let value = this.get("token_id");
    return value!.toString();
  }

  set token_id(value: string) {
    this.set("token_id", Value.fromString(value));
  }

  get position(): string {
    let value = this.get("position");
    return value!.toString();
  }

  set position(value: string) {
    this.set("position", Value.fromString(value));
  }
}

export class Goalie extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Goalie entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Goalie must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Goalie", id.toString(), this);
    }
  }

  static load(id: string): Goalie | null {
    return changetype<Goalie | null>(store.get("Goalie", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get number(): string {
    let value = this.get("number");
    return value!.toString();
  }

  set number(value: string) {
    this.set("number", Value.fromString(value));
  }

  get token_id(): string {
    let value = this.get("token_id");
    return value!.toString();
  }

  set token_id(value: string) {
    this.set("token_id", Value.fromString(value));
  }
}
