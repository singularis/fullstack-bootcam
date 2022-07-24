import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import NFTActorClass "../NFT/nft";
import Principal "mo:base/Principal";


actor OpenD {

    public shared(msg) func mint(imgData: [Nat8], name: Text) : async Principal {
      let owner : Principal = msg.caller;

      Debug.print(debug_show(Cycles.balance()));
      Cycles.add(366_126_255_896);
      let newNFT = await NFTActorClass.NFT(name, owner, imgData);
      Debug.print(debug_show(Cycles.balance()));

      let newCFTPrincipal = await newNFT.getCanisterId();

      return newCFTPrincipal;

    }

};