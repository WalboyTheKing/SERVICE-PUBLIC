export interface PiPaymentDTO {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: {
    type: 'seller_registration' | 'product_publication' | 'product_purchase' | 'cart_checkout';
    product_id?: string;
    order_id?: string;
    shipping_address?: string;
    contact_info?: string;
    product_data?: {
      title: string;
      description: string;
      price_pi: number;
      category: string;
      image_url: string;
    };
    [key: string]: unknown;
  };
  to_address: string;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: null | {
    txid: string;
    verified: boolean;
    _link: string;
  };
}

export interface PiAuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

export interface PiSDK {
  init(options: { version: string; sandbox: boolean }): void;
  authenticate(
    scopes: string[],
    onIncompletePaymentFound: (payment: PiPaymentDTO) => void
  ): Promise<PiAuthResult>;
  createPayment(
    paymentData: {
      amount: number;
      memo: string;
      metadata: Record<string, unknown>;
    },
    callbacks: {
      onReadyForServerApproval: (paymentId: string) => void;
      onReadyForServerCompletion: (paymentId: string, txid: string) => void;
      onCancel: (paymentId: string) => void;
      onError: (error: Error, payment?: PiPaymentDTO) => void;
    }
  ): void;
}

declare global {
  interface Window {
    Pi?: PiSDK;
  }
}