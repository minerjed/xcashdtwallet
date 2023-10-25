export interface Delegate {
    votes: number,
    voters: number,
    IPAdress: string,
    delegateName: string,
    sharedDelegate: boolean,
    seedNode: boolean,
    online: boolean,
    fee: number,
    totalRounds: number,
    totalBlockProducerRounds: number,
    onlinePercentage: number
  }  