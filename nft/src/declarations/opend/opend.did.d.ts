import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface _SERVICE {
  'mint' : ActorMethod<[Array<number>, string], Principal>,
}
