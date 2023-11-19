import Assets "mo:assets";
import Types "mo:assets/Types";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Blob "mo:base/Blob";
import Nat64 "mo:base/Nat64";
import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Cycles "mo:base/ExperimentalCycles";
import Random "mo:base/Random";
import HttpTypes "HttpTypes";

shared ({ caller = creator }) actor class () {
  //// documents
  stable var entries : Assets.SerializedEntries = ([], [creator]);
  let assets = Assets.Assets({
    serializedEntries = entries;
  });

  system func preupgrade() {
    entries := assets.entries();
  };

  public shared ({ caller }) func authorize(other : Principal) : async () {
    assets.authorize({
      caller;
      other;
    });
  };

  public query func is_authorized(principal : Principal) : async Bool {
    let (_, authorized) = assets.entries();

    func eq(value : Principal) : Bool = value == principal;
    Array.find(authorized, eq) != null;
  };

  public query func retrieve(path : Assets.Path) : async Assets.Contents {
    assets.retrieve(path);
  };

  public shared ({ caller }) func store(
    arg : {
      key : Assets.Key;
      content_type : Text;
      content_encoding : Text;
      content : Blob;
      sha256 : ?Blob;
    }
  ) : async () {
    assets.store({
      caller;
      arg;
    });
  };

  public query func list(arg : {}) : async [Types.AssetDetails] {
    assets.list(arg);
  };
  public query func get(
    arg : {
      key : Types.Key;
      accept_encodings : [Text];
    }
  ) : async ({
    content : Blob;
    content_type : Text;
    content_encoding : Text;
    total_length : Nat;
    sha256 : ?Blob;
  }) {
    assets.get(arg);
  };

  public query func get_chunk(
    arg : {
      key : Types.Key;
      content_encoding : Text;
      index : Nat;
      sha256 : ?Blob;
    }
  ) : async ({
    content : Blob;
  }) {
    assets.get_chunk(arg);
  };

  public shared ({ caller }) func create_batch(arg : {}) : async ({
    batch_id : Types.BatchId;
  }) {
    assets.create_batch({
      caller;
      arg;
    });
  };

  public shared ({ caller }) func create_chunk(
    arg : {
      batch_id : Types.BatchId;
      content : Blob;
    }
  ) : async ({
    chunk_id : Types.ChunkId;
  }) {
    assets.create_chunk({
      caller;
      arg;
    });
  };

  public shared ({ caller }) func commit_batch(args : Types.CommitBatchArguments) : async () {
    assets.commit_batch({
      caller;
      args;
    });
  };
  public shared ({ caller }) func create_asset(arg : Types.CreateAssetArguments) : async () {
    assets.create_asset({
      caller;
      arg;
    });
  };

  public shared ({ caller }) func set_asset_content(arg : Types.SetAssetContentArguments) : async () {
    assets.set_asset_content({
      caller;
      arg;
    });
  };

  public shared ({ caller }) func unset_asset_content(args : Types.UnsetAssetContentArguments) : async () {
    assets.unset_asset_content({
      caller;
      args;
    });
  };

  public shared ({ caller }) func delete_asset(args : Types.DeleteAssetArguments) : async () {
    assets.delete_asset({
      caller;
      args;
    });
  };

  public shared ({ caller }) func clear(args : Types.ClearArguments) : async () {
    assets.clear({
      caller;
      args;
    });
  };

  //// sync
  let ic : HttpTypes.IC = actor ("aaaaa-aa"); // management canister
  // url from which to sync data from
  let url = "https://api.restful-api.dev/objects";

  type SyncedData = {
    data : Text;
    last_synced_at : Time.Time;
  };

  stable var synced_data : SyncedData = {
    data = "{}";
    last_synced_at = Time.now();
  };

  public query func get_synced_data() : async SyncedData {
    synced_data;
  };

  public func sync_data() : async () {
    synced_data := {
      data = await fetchData();
      last_synced_at = Time.now();
    };
  };

  public query func transform(raw : HttpTypes.TransformArgs) : async HttpTypes.CanisterHttpResponsePayload {
    let transformed : HttpTypes.CanisterHttpResponsePayload = {
      status = raw.response.status;
      body = raw.response.body;
      headers = Array.filter(
        raw.response.headers,
        func(h : HttpTypes.HttpHeader) : Bool {
          h.name == "content-type";
        },
      );
    };
    transformed;
  };

  public func fetchData() : async Text {
    let request_headers = [
      { name = "Accept"; value = "application/json" },
    ];

    let transform_context : HttpTypes.TransformContext = {
      function = transform;
      context = Blob.fromArray([]);
    };

    // generate two dummy ids between 1 and 10
    let randomId1: Nat = switch (Random.Finite(await Random.blob()).range(3)) {
      case (?x) { x + 1 };
      case (null) { 1 };
    };
    let randomId2: Nat = switch (Random.Finite(await Random.blob()).range(3)) {
      case (?x) {
        if (x == randomId1) {
          x + 2;
        } else {
          x + 1;
        };
      };
      case (null) { 2 };
    };

    let http_request : HttpTypes.HttpRequestArgs = {
      url = url # "?id=" # Nat.toText(randomId1) # "&id=" # Nat.toText(randomId2);
      max_response_bytes = ?Nat64.fromNat(10_000); // we expect to receive around 5kb
      headers = request_headers;
      body = null;
      method = #get;
      transform = ?transform_context;
    };

    // add 180_000_000 cycles to pay for the http_request
    // estimated from https://forum.dfinity.org/t/a-new-price-function-for-https-outcalls/20838
    Cycles.add(180_000_000);

    let http_response : HttpTypes.HttpResponsePayload = await ic.http_request(http_request);

    if (http_response.status != 200) {
      Debug.trap("Unexpected status code: " # Nat.toText(http_response.status));
    };

    let response_body : Blob = Blob.fromArray(http_response.body);
    let decoded_text : Text = switch (Text.decodeUtf8(response_body)) {
      case (null) { "No value returned" };
      case (?y) { y };
    };

    decoded_text;
  };
};
