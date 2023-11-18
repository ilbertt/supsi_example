import Assets "mo:assets";
import Types "mo:assets/Types";

shared ({ caller = creator }) actor class () {
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
};