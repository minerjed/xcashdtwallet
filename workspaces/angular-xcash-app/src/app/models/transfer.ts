export interface Transfer {
    address: string;
    amount: number;
    confirmations: number;
    double_spend_seen: boolean;
    fee: number;
    height: number;
    note: string;
    payment_id: string;
    subaddr_index: {
      major: number;
      minor: number;
    };
    suggested_confirmations_threshold: number;
    timestamp: number;
    txid: string;
    type: string;
    unlock_time: number;
};